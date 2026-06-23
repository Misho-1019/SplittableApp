import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
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
  await deleteDoc(doc(db, 'groups', groupId));
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
  const groupRef = doc(db, 'groups', groupId);

  await updateDoc(groupRef, {
    members: arrayUnion(userId),
    [`memberNames.${userId}`]: displayName,
    updatedAt: serverTimestamp(),
  });
}

export async function removeMemberFromGroup(
  groupId: string,
  userId: string,
): Promise<void> {
  const groupRef = doc(db, 'groups', groupId);
  const snap = await getDoc(groupRef);

  if (!snap.exists()) return;

  const data = snap.data();
  const members: string[] = data.members.filter((m: string) => m !== userId);
  const memberNames: Record<string, string> = { ...data.memberNames };
  delete memberNames[userId];

  await updateDoc(groupRef, {
    members,
    memberNames,
    updatedAt: serverTimestamp(),
  });
}
