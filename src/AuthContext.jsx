import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  updateProfile,
  fetchSignInMethodsForEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  // ─── Sign Up ──────────────────────────────────────────────────────────────
  async function signUp(name, email, password) {
    setAuthError('');
    // Create user
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const user = cred.user;

    // Set display name
    await updateProfile(user, { displayName: name });

    // Save to Firestore (password is NOT stored – Firebase handles it securely)
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      name,
      email,
      createdAt: serverTimestamp(),
      emailVerified: false,
      signInProvider: 'email',
    });

    // Send verification email
    await sendEmailVerification(user);

    return user;
  }

  // ─── Sign In with Email ───────────────────────────────────────────────────
  async function signIn(email, password) {
    setAuthError('');
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const user = cred.user;

    if (!user.emailVerified) {
      await signOut(auth);
      throw new Error('Please verify your email before signing in. Check your inbox for a verification link.');
    }

    // Update Firestore record
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      await setDoc(userRef, { emailVerified: true, lastLogin: serverTimestamp() }, { merge: true });
    }

    return user;
  }

  // ─── Google Sign In ───────────────────────────────────────────────────────
  async function signInWithGoogle() {
    setAuthError('');
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if the email was used previously with email/password
    const methods = await fetchSignInMethodsForEmail(auth, user.email);
    const usedEmailBefore = methods.some(m => m === 'password');

    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      // User exists: update last login
      await setDoc(userRef, {
        lastLogin: serverTimestamp(),
        emailVerified: true,
        photoURL: user.photoURL || snap.data().photoURL,
      }, { merge: true });
    } else {
      // New user via Google: create Firestore record
      await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName || 'User',
        email: user.email,
        photoURL: user.photoURL || '',
        createdAt: serverTimestamp(),
        emailVerified: true,
        signInProvider: 'google',
        linkedEmailPassword: usedEmailBefore,
      });
    }

    return user;
  }

  // ─── Sign Out ─────────────────────────────────────────────────────────────
  async function logOut() {
    await signOut(auth);
  }

  // ─── Resend verification email ────────────────────────────────────────────
  async function resendVerification(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(cred.user);
    await signOut(auth);
  }

  // ─── Auth state listener ──────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && !user.emailVerified && user.providerData[0]?.providerId === 'password') {
        // Don't set a logged-in state for unverified email/password users
        setCurrentUser(null);
      } else {
        setCurrentUser(user);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    authError,
    setAuthError,
    signUp,
    signIn,
    signInWithGoogle,
    logOut,
    resendVerification,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
