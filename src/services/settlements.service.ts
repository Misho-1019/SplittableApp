import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { Settlement } from '@/types';

function buildSettlementFromDoc(
  id: string,
  groupId: string,
  data: Record<string, unknown>,
): Settlement {
  return {
    id,
    groupId,
    fromUserId: data.fromUserId as string,
    fromUserName: data.fromUserName as string,
    toUserId: data.toUserId as string,
    toUserName: data.toUserName as string,
    amount: data.amount as number,
    currency: data.currency as string,
    paidVia: data.paidVia as Settlement['paidVia'],
    status: data.status as Settlement['status'],
    stripePaymentIntentId: (data.stripePaymentIntentId as string) ?? null,
    createdAt: data.createdAt as Timestamp,
    completedAt: (data.completedAt as Timestamp) ?? null,
  };
}

export async function createSettlement(
  groupId: string,
  data: Omit<Settlement, 'id' | 'groupId' | 'createdAt' | 'completedAt'>,
): Promise<Settlement> {
  // Check for existing settlement between the same pair (prevents duplicates)
  const existingQuery = query(
    collection(db, 'groups', groupId, 'settlements'),
    orderBy('createdAt', 'desc'),
  );
  const existingSnap = await getDocs(existingQuery);
  const hasExisting = existingSnap.docs.some((d) => {
    const s = d.data();
    return (
      s.status !== 'failed' &&
      ((s.fromUserId === data.fromUserId && s.toUserId === data.toUserId) ||
       (s.fromUserId === data.toUserId && s.toUserId === data.fromUserId))
    );
  });

  if (hasExisting) {
    throw new Error('A settlement already exists between these users. Please complete or cancel it first.');
  }

  const ref = doc(collection(db, 'groups', groupId, 'settlements'));

  const settlement: Omit<Settlement, 'createdAt' | 'completedAt'> = {
    id: ref.id,
    groupId,
    ...data,
  };

  await setDoc(ref, {
    ...settlement,
    createdAt: serverTimestamp(),
    completedAt:
      settlement.status === 'completed' ? serverTimestamp() : null,
  });

  await updateDoc(doc(db, 'groups', groupId), {
    updatedAt: serverTimestamp(),
  });

  return {
    ...settlement,
    createdAt: Timestamp.now(),
    completedAt: settlement.status === 'completed' ? Timestamp.now() : null,
  };
}

export function subscribeToGroupSettlements(
  groupId: string,
  onData: (settlements: Settlement[]) => void,
  onError: (error: Error) => void,
): () => void {
  const q = query(
    collection(db, 'groups', groupId, 'settlements'),
    orderBy('createdAt', 'desc'),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const settlements = snapshot.docs.map((d) =>
        buildSettlementFromDoc(d.id, groupId, d.data()),
      );
      onData(settlements);
    },
    onError,
  );
}

export async function getAllUserSettlements(
  userId: string,
  groupIds: string[],
): Promise<Settlement[]> {
  if (groupIds.length === 0) return [];

  const all: Settlement[] = [];

  for (const groupId of groupIds) {
    const q = query(
      collection(db, 'groups', groupId, 'settlements'),
      orderBy('createdAt', 'desc'),
    );

    const snapshot = await getDocs(q);

    snapshot.docs.forEach((d) => {
      const s = buildSettlementFromDoc(d.id, groupId, d.data());
      if (s.fromUserId === userId || s.toUserId === userId) {
        all.push(s);
      }
    });
  }

  return all.sort(
    (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0),
  );
}

export async function getSettlement(
  groupId: string,
  settlementId: string,
): Promise<Settlement | null> {
  const snap = await getDoc(
    doc(db, 'groups', groupId, 'settlements', settlementId),
  );
  if (!snap.exists()) return null;
  return buildSettlementFromDoc(snap.id, groupId, snap.data());
}

export async function getSettlementsBetweenUsers(
  groupId: string,
  userId1: string,
  userId2: string,
): Promise<Settlement[]> {
  const q = query(
    collection(db, 'groups', groupId, 'settlements'),
    orderBy('createdAt', 'desc'),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((d) => buildSettlementFromDoc(d.id, groupId, d.data()))
    .filter(
      (s) =>
      s.status === 'pending' &&
        ((s.fromUserId === userId1 && s.toUserId === userId2) ||
         (s.fromUserId === userId2 && s.toUserId === userId1)),
    );
}

export async function updateSettlementStatus(
  groupId: string,
  settlementId: string,
  status: Settlement['status'],
): Promise<void> {
  await updateDoc(doc(db, 'groups', groupId, 'settlements', settlementId), {
    status,
    ...(status === 'completed'
      ? { completedAt: serverTimestamp() }
      : {}),
  });
}
