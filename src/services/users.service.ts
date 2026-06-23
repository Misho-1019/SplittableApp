import {
  doc,
  getDoc,
  getDocs,
  query,
  where,
  collection,
  limit,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { User } from '@/types';

function buildUserFromDoc(id: string, data: Record<string, unknown>): User {
  return {
    id,
    email: data.email as string,
    displayName: data.displayName as string,
    photoURL: (data.photoURL as string) ?? null,
    createdAt: data.createdAt as User['createdAt'],
  };
}

export async function getUser(userId: string): Promise<User | null> {
  const snap = await getDoc(doc(db, 'users', userId));
  if (!snap.exists()) return null;
  return buildUserFromDoc(snap.id, snap.data());
}

export async function getUsers(userIds: string[]): Promise<User[]> {
  if (userIds.length === 0) return [];

  const uniqueIds = [...new Set(userIds)];
  const users: User[] = [];

  for (const userId of uniqueIds) {
    const user = await getUser(userId);
    if (user) users.push(user);
  }

  return users;
}

export async function searchUserByEmail(email: string): Promise<User | null> {
  const q = query(
    collection(db, 'users'),
    where('email', '==', email.toLowerCase().trim()),
    limit(1),
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return buildUserFromDoc(doc.id, doc.data());
}
