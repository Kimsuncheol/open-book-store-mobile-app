import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithCredential,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GOOGLE_WEB_CLIENT_ID } from '../config/firebase';

WebBrowser.maybeCompleteAuthSession();

export type UserRole = 'user' | 'seller';

// Email/Password Sign In
export const signInWithEmail = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Email/Password Sign Up with Role
export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName: string,
  role: UserRole = 'user'
) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  if (result.user) {
    await updateProfile(result.user, { displayName });
    // Store user profile with role in Firestore
    await setDoc(doc(db, 'users', result.user.uid), {
      email,
      displayName,
      role,
      createdAt: new Date().toISOString(),
    });
  }
  return result;
};

// Get user role from Firestore
export const getUserRole = async (uid: string): Promise<UserRole> => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) {
    return (userDoc.data().role as UserRole) || 'user';
  }
  return 'user';
};

// Google Sign In
export const signInWithGoogle = async (idToken: string) => {
  const credential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(auth, credential);
  // Check if user exists in Firestore, if not create with default role
  const userDoc = await getDoc(doc(db, 'users', result.user.uid));
  if (!userDoc.exists()) {
    await setDoc(doc(db, 'users', result.user.uid), {
      email: result.user.email,
      displayName: result.user.displayName,
      role: 'user',
      createdAt: new Date().toISOString(),
    });
  }
  return result;
};

// Get Google Auth Config
export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID,
  });
  return { request, response, promptAsync };
};

// Sign Out
export const signOutUser = async () => {
  return signOut(auth);
};

// Reset Password
export const resetPassword = async (email: string) => {
  return sendPasswordResetEmail(auth, email);
};

// Get current user
export const getCurrentUser = () => auth.currentUser;
