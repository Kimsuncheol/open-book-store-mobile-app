import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithCredential,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updateProfile,
  deleteUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
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
    // Store user profile with role and subscription in Firestore
    await setDoc(doc(db, 'users', result.user.uid), {
      email,
      displayName,
      role,
      subscriptionStatus: 'free',
      subscriptionStartDate: null,
      subscriptionEndDate: null,
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
  // Check if user exists in Firestore, if not create with default role and subscription
  const userDoc = await getDoc(doc(db, 'users', result.user.uid));
  if (!userDoc.exists()) {
    await setDoc(doc(db, 'users', result.user.uid), {
      email: result.user.email,
      displayName: result.user.displayName,
      role: 'user',
      subscriptionStatus: 'free',
      subscriptionStartDate: null,
      subscriptionEndDate: null,
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

// Reauthenticate User
export const reauthenticateUser = async (password: string) => {
  const user = auth.currentUser;
  if (user && user.email) {
    const credential = EmailAuthProvider.credential(user.email, password);
    return reauthenticateWithCredential(user, credential);
  }
  throw new Error('No user logged in or user has no email');
};

// Reset Password
export const resetPassword = async (email: string) => {
  return sendPasswordResetEmail(auth, email);
};

// Delete Account
export const deleteUserAccount = async () => {
  const user = auth.currentUser;
  if (user) {
    // Delete user profile from Firestore
    await deleteDoc(doc(db, 'users', user.uid));
    // Delete user from Firebase Auth
    return deleteUser(user);
  }
};

// Get current user
export const getCurrentUser = () => auth.currentUser;
