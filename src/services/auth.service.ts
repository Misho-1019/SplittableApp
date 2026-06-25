import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import type { User } from '@/types';

export function subscribeToAuth(
  onUser: (user: User | null) => void,
  onLoading: (loading: boolean) => void,
): () => void {
  onLoading(true);

  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
      const userData = snap.exists() ? snap.data() : {};
      onUser({
        id: firebaseUser.uid,
        email: firebaseUser.email ?? '',
        displayName: firebaseUser.displayName ?? '',
        photoURL: firebaseUser.photoURL,
        createdAt: (userData.createdAt as Timestamp) ?? Timestamp.now(),
      });
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
  const user = credential.user;
  const snap = await getDoc(doc(db, 'users', user.uid));
  const userData = snap.exists() ? snap.data() : {};

  return {
    id: user.uid,
    email: user.email ?? '',
    displayName: user.displayName ?? '',
    photoURL: user.photoURL,
    createdAt: (userData.createdAt as Timestamp) ?? Timestamp.now(),
  };
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
