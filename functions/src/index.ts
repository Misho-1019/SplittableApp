import * as admin from 'firebase-admin';
import Stripe from 'stripe';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onDocumentWritten, onDocumentCreated } from 'firebase-functions/v2/firestore';
import { notifyExpenseInvolvedUsers, notifySettlementParty, notifyMemberAdded } from './notifications';

admin.initializeApp();

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-02-24.acacia',
    });
  }
  return _stripe;
}

export const createpaymentintent = onCall(
  { region: 'us-central1' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be logged in.');
    }

    const { amount, currency, groupId, toUserId: otherUserId } = request.data;

    if (typeof amount !== 'number' || amount <= 0) {
      throw new HttpsError(
        'invalid-argument',
        'Amount must be a positive number.',
      );
    }

    if (!groupId || !otherUserId) {
      throw new HttpsError(
        'invalid-argument',
        'groupId and otherUserId are required.',
      );
    }

    const groupDoc = await admin
      .firestore()
      .collection('groups')
      .doc(groupId)
      .get();

    if (!groupDoc.exists) {
      throw new HttpsError('not-found', 'Group not found.');
    }

    const groupData = groupDoc.data()!;
    if (!groupData.members?.includes(request.auth.uid)) {
      throw new HttpsError('permission-denied', 'Not a group member.');
    }

    if (!groupData.members?.includes(otherUserId)) {
      throw new HttpsError('permission-denied', 'Recipient is not a group member.');
    }

    const paymentIntent = await getStripe().paymentIntents.create({
      amount,
      currency: (currency ?? 'usd').toLowerCase(),
      metadata: {
        groupId,
        fromUserId: request.auth.uid,
        toUserId: otherUserId,
      },
    });

    const settlementRef = admin
      .firestore()
      .collection('groups')
      .doc(groupId)
      .collection('settlements')
      .doc();

    const fromUser = await admin
      .firestore()
      .collection('users')
      .doc(request.auth.uid)
      .get();

    const toUser = await admin
      .firestore()
      .collection('users')
      .doc(otherUserId)
      .get();

    await settlementRef.set({
      fromUserId: request.auth.uid,
      fromUserName: fromUser.data()?.displayName ?? '',
      toUserId: otherUserId,
      toUserName: toUser.data()?.displayName ?? '',
      amount: amount / 100,
      currency: (currency ?? 'usd').toUpperCase(),
      paidVia: 'card',
      status: 'pending',
      stripePaymentIntentId: paymentIntent.id,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      clientSecret: paymentIntent.client_secret,
      settlementId: settlementRef.id,
    };
  },
);

export const confirmsettlement = onCall(
  { region: 'us-central1' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be logged in.');
    }

    const { settlementId, groupId, paymentIntentId } = request.data;

    if (!settlementId || !groupId || !paymentIntentId) {
      throw new HttpsError(
        'invalid-argument',
        'settlementId, groupId, and paymentIntentId are required.',
      );
    }

    const paymentIntent = await getStripe().paymentIntents.retrieve(
      paymentIntentId,
    );

    if (paymentIntent.status !== 'succeeded') {
      await getStripe().paymentIntents.confirm(paymentIntentId, {
        payment_method: 'pm_card_visa',
      });
    }

    const settlementRef = admin
      .firestore()
      .collection('groups')
      .doc(groupId)
      .collection('settlements')
      .doc(settlementId);

    const settlementDoc = await settlementRef.get();
    if (!settlementDoc.exists) {
      throw new HttpsError('not-found', 'Settlement not found.');
    }

    const settlementData = settlementDoc.data()!;
    if (
      settlementData.fromUserId !== request.auth.uid ||
      settlementData.stripePaymentIntentId !== paymentIntentId
    ) {
      throw new HttpsError('permission-denied', 'Not authorized.');
    }

    await settlementRef.update({
      status: 'completed',
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await admin
      .firestore()
      .collection('groups')
      .doc(groupId)
      .update({
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    return { success: true };
  },
);

export const onexpensewrite = onDocumentWritten(
  'groups/{groupId}/expenses/{expenseId}',
  async (event) => {
    const groupId = event.params.groupId;
    const expenseId = event.params.expenseId;

    // Recalculate totalExpenses
    const expensesSnapshot = await admin
      .firestore()
      .collection('groups')
      .doc(groupId)
      .collection('expenses')
      .get();

    const total = expensesSnapshot.docs.reduce(
      (sum, doc) => sum + ((doc.data().amount as number) || 0),
      0,
    );

    const groupRef = admin.firestore().collection('groups').doc(groupId);
    const groupDoc = await groupRef.get();
    if (groupDoc.exists) {
      await groupRef.update({
        totalExpenses: total,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    // Send notification on expense creation
    const before = event.data?.before;
    const after = event.data?.after;
    if (!before?.exists && after?.exists) {
      const data = after.data()!;
      try {
        await notifyExpenseInvolvedUsers(
          groupId,
          expenseId,
          data.paidByName as string,
          data.description as string,
          data.amount as number,
        );
      } catch {
        // Notification sending is non-critical
      }
    }
  },
);

// Notify when a settlement is completed
export const onsettlementwrite = onDocumentWritten(
  'groups/{groupId}/settlements/{settlementId}',
  async (event) => {
    const before = event.data?.before;
    const after = event.data?.after;
    if (!after?.exists) return;

    const groupId = event.params.groupId;
    const data = after.data()!;

    // Only notify on create (status: pending) or status change to completed
    const isNew = !before?.exists;
    const statusChanged = before?.exists && before.data()?.status !== after.data()?.status;

    if (isNew || statusChanged) {
      try {
        const isCompleted = data.status === 'completed';
        // Notify the 'from' user (the one who paid)
        if (data.fromUserId) {
          await notifySettlementParty(
            data.fromUserId as string,
            groupId,
            data.toUserName as string,
            data.amount as number,
            isCompleted ? 'completed' : 'pending',
          );
        }
        // Notify the 'to' user (the one who received)
        if (data.toUserId) {
          await notifySettlementParty(
            data.toUserId as string,
            groupId,
            data.fromUserName as string,
            data.amount as number,
            isCompleted ? 'completed' : 'pending',
          );
        }
      } catch {
        // Non-critical
      }
    }
  },
);

// Notify when a user is added to a group
export const ongroupupdate = onDocumentWritten(
  'groups/{groupId}',
  async (event) => {
    const before = event.data?.before;
    const after = event.data?.after;
    if (!before?.exists || !after?.exists) return;

    const beforeMembers: string[] = before.data()?.members ?? [];
    const afterMembers: string[] = after.data()?.members ?? [];

    // Detect new members
    const newMembers = afterMembers.filter((id) => !beforeMembers.includes(id));
    if (newMembers.length === 0 && after.data()?.createdBy === before.data()?.createdBy) return;

    const addedByName = after.data()?.memberNames?.[before.data()?.createdBy] ?? 'Someone';
    const groupId = event.params.groupId;

    for (const newUserId of newMembers) {
      try {
        await notifyMemberAdded(newUserId, groupId, addedByName);
      } catch {
        // Non-critical
      }
    }
  },
);
