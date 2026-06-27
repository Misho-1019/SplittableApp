import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  writeBatch,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  Timestamp,
} from 'firebase/firestore';
import { ref, listAll, deleteObject } from 'firebase/storage';
import { db, storage } from '@/config/firebase';
import type { Group } from '@/types';

function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function buildGroupFromDoc(id: string, data: Record<string, unknown>): Group {
  return {
    id,
    name: data.name as string,
    description: (data.description as string) ?? null,
    members: data.members as string[],
    memberNames: data.memberNames as Record<string, string>,
    createdBy: data.createdBy as string,
    inviteCode: data.inviteCode as string,
    totalExpenses: (data.totalExpenses as number) ?? 0,
    createdAt: data.createdAt as Timestamp,
    updatedAt: data.updatedAt as Timestamp,
  };
}

export async function createGroup(
  name: string,
  description: string | null,
  createdBy: string,
  createdByName: string,
): Promise<Group> {
  const groupRef = doc(collection(db, 'groups'));

  const group: Omit<Group, 'createdAt' | 'updatedAt'> = {
    id: groupRef.id,
    name,
    description,
    members: [createdBy],
    memberNames: { [createdBy]: createdByName },
    createdBy,
    inviteCode: generateInviteCode(),
    totalExpenses: 0,
  };

  await setDoc(groupRef, {
    ...group,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    ...group,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
}

export function subscribeToUserGroups(
  userId: string,
  onData: (groups: Group[]) => void,
  onError: (error: Error) => void,
): () => void {
  const q = query(
    collection(db, 'groups'),
    where('members', 'array-contains', userId),
    orderBy('updatedAt', 'desc'),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const groups = snapshot.docs.map((d) =>
        buildGroupFromDoc(d.id, d.data()),
      );
      onData(groups);
    },
    onError,
  );
}

export async function getGroup(groupId: string): Promise<Group | null> {
  const snap = await getDoc(doc(db, 'groups', groupId));
  if (!snap.exists()) return null;
  return buildGroupFromDoc(snap.id, snap.data());
}

export async function deleteGroup(groupId: string): Promise<void> {
  const batch = writeBatch(db);

  const expensesSnap = await getDocs(
    collection(db, 'groups', groupId, 'expenses'),
  );
  for (const expDoc of expensesSnap.docs) {
    batch.delete(doc(db, 'groups', groupId, 'expenses', expDoc.id));
  }

  const settlementsSnap = await getDocs(
    collection(db, 'groups', groupId, 'settlements'),
  );
  for (const setDoc of settlementsSnap.docs) {
    batch.delete(doc(db, 'groups', groupId, 'settlements', setDoc.id));
  }

  batch.delete(doc(db, 'groups', groupId));

  await batch.commit();

  // Best-effort: delete receipt files from Storage (cannot be batched)
  try {
    const receiptRef = ref(storage, `receipts/${groupId}`);
    const listResult = await listAll(receiptRef);
    for (const item of listResult.items) {
      await deleteObject(item);
    }
  } catch {
    // Storage cleanup is non-critical
  }
}

export async function updateGroup(
  groupId: string,
  data: Partial<Pick<Group, 'name' | 'description'>>,
): Promise<void> {
  await updateDoc(doc(db, 'groups', groupId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function addMemberToGroup(
  groupId: string,
  userId: string,
  displayName: string,
): Promise<void> {
  const userSnap = await getDoc(doc(db, 'users', userId));
  if (!userSnap.exists()) throw new Error('User does not exist.');

  const groupRef = doc(db, 'groups', groupId);

  await updateDoc(groupRef, {
    members: arrayUnion(userId),
    [`memberNames.${userId}`]: displayName,
    updatedAt: serverTimestamp(),
  });
}

export async function joinGroupByInviteCode(
  inviteCode: string,
  userId: string,
  displayName: string,
): Promise<Group> {
  const q = query(
    collection(db, 'groups'),
    where('inviteCode', '==', inviteCode.trim().toUpperCase()),
    limit(1),
  );
  const snap = await getDocs(q);
  if (snap.empty) throw new Error('Group not found with that invite code.');

  const group = buildGroupFromDoc(snap.docs[0].id, snap.docs[0].data());
  await addMemberToGroup(group.id, userId, displayName);
  return group;
}

export async function removeMemberFromGroup(
  groupId: string,
  userId: string,
): Promise<void> {
  const groupRef = doc(db, 'groups', groupId);

  await updateDoc(groupRef, {
    members: arrayRemove(userId),
    [`memberNames.${userId}`]: deleteField(),
    updatedAt: serverTimestamp(),
  });
}
