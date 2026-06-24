import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  runTransaction,
  increment,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { Expense } from '@/types';

function buildExpenseFromDoc(
  id: string,
  groupId: string,
  data: Record<string, unknown>,
): Expense {
  return {
    id,
    groupId,
    description: data.description as string,
    amount: data.amount as number,
    currency: data.currency as string,
    paidBy: data.paidBy as string,
    paidByName: data.paidByName as string,
    splitType: data.splitType as Expense['splitType'],
    splitDetails: data.splitDetails as Expense['splitDetails'],
    receiptPhotoURL: (data.receiptPhotoURL as string) ?? null,
    receiptPhotoThumbnailURL: (data.receiptPhotoThumbnailURL as string) ?? null,
    createdAt: data.createdAt as Timestamp,
    createdBy: data.createdBy as string,
  };
}

export async function createExpense(
  groupId: string,
  data: Omit<Expense, 'id' | 'groupId' | 'createdAt'>,
): Promise<Expense> {
  const ref = doc(collection(db, 'groups', groupId, 'expenses'));

  const expense: Omit<Expense, 'createdAt'> = {
    id: ref.id,
    groupId,
    ...data,
  };

  await setDoc(ref, {
    ...expense,
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, 'groups', groupId), {
    totalExpenses: increment(data.amount),
    updatedAt: serverTimestamp(),
  });

  return {
    ...expense,
    createdAt: Timestamp.now(),
  };
}

export function subscribeToGroupExpenses(
  groupId: string,
  onData: (expenses: Expense[]) => void,
  onError: (error: Error) => void,
): () => void {
  const q = query(
    collection(db, 'groups', groupId, 'expenses'),
    orderBy('createdAt', 'desc'),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const expenses = snapshot.docs.map((d) =>
        buildExpenseFromDoc(d.id, groupId, d.data()),
      );
      onData(expenses);
    },
    onError,
  );
}

export async function getExpense(
  groupId: string,
  expenseId: string,
): Promise<Expense | null> {
  const snap = await getDoc(
    doc(db, 'groups', groupId, 'expenses', expenseId),
  );
  if (!snap.exists()) return null;
  return buildExpenseFromDoc(snap.id, groupId, snap.data());
}

export async function deleteExpense(
  groupId: string,
  expenseId: string,
): Promise<void> {
  const expenseRef = doc(db, 'groups', groupId, 'expenses', expenseId);
  const groupRef = doc(db, 'groups', groupId);

  await runTransaction(db, async (transaction) => {
    const expenseSnap = await transaction.get(expenseRef);
    if (!expenseSnap.exists()) return;

    const amount = expenseSnap.data().amount as number;
    transaction.delete(expenseRef);
    transaction.update(groupRef, {
      totalExpenses: increment(-amount),
    });
  });
}
