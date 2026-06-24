import * as admin from 'firebase-admin';
import Stripe from 'stripe';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';

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
      throw new HttpsError('failed-precondition', 'Payment not completed.');
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

    await admin
      .firestore()
      .collection('groups')
      .doc(groupId)
      .update({
        totalExpenses: total,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
  },
);
