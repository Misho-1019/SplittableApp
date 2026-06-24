import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import type { User } from '@/types';

function mapFirebaseUser(firebaseUser: FirebaseUser): User {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email ?? '',
    displayName: firebaseUser.displayName ?? '',
    photoURL: firebaseUser.photoURL,
    createdAt: Timestamp.now(),
  };
}

export function subscribeToAuth(
  onUser: (user: User | null) => void,
  onLoading: (loading: boolean) => void,
): () => void {
  onLoading(true);

  return onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      onUser(mapFirebaseUser(firebaseUser));
    } else {
      onUser(null);
    }
    onLoading(false);
  });
}

export async function login(
  email: string,
  password: string,
): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return mapFirebaseUser(credential.user);
}

export async function register(
  email: string,
  password: string,
  displayName: string,
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const user = credential.user;

  await updateProfile(user, { displayName });

  try {
    await setDoc(doc(db, 'users', user.uid), {
      email,
      displayName,
      photoURL: null,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    // Rollback: delete the Firebase Auth user if Firestore write fails
    await user.delete();
    throw error;
  }

  return {
    id: user.uid,
    email,
    displayName,
    photoURL: null,
    createdAt: Timestamp.now(),
  };
}

export async function logout(): Promise<void> {
  await signOut(auth);
}
