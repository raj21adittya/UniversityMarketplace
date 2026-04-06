"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { COLLECTIONS, ALLOWED_EMAIL_DOMAINS } from "./constants";
import { UMUser } from "./types";

interface AuthContextType {
  user: User | null;
  profile: UMUser | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  completeProfile: (data: Partial<UMUser>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

function isValidUNCEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return ALLOWED_EMAIL_DOMAINS.some(
    (d) => domain === d || domain?.endsWith("." + d)
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UMUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchProfile(uid: string) {
    const snap = await getDoc(doc(db, COLLECTIONS.users, uid));
    if (snap.exists()) {
      const data = snap.data();
      const p: UMUser = {
        ...data,
        id: snap.id,
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
        updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
      } as UMUser;
      setProfile(p);
      return p;
    }
    return null;
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          await fetchProfile(firebaseUser.uid);
        } catch (e) {
          console.error("Error fetching profile on auth change:", e);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  async function signIn(email: string, password: string) {
    setError(null);
    if (!isValidUNCEmail(email)) {
      setError("Please use a valid UNC email");
      return;
    }
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await fetchProfile(cred.user.uid);
    } catch (e: unknown) {
      setError((e as Error).message);
    }
  }

  async function signUp(email: string, password: string) {
    setError(null);
    if (!isValidUNCEmail(email)) {
      setError("Please use a valid UNC email");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (e: unknown) {
      setError((e as Error).message);
    }
  }

  async function signOut() {
    await firebaseSignOut(auth);
    setProfile(null);
  }

  async function completeProfile(data: Partial<UMUser>) {
    if (!user) return;
    setError(null);
    try {
      const ref = doc(db, COLLECTIONS.users, user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        await updateDoc(ref, { ...data, updatedAt: new Date() });
      } else {
        await setDoc(ref, {
          id: user.uid,
          email: user.email,
          isEmailVerified: true,
          blockedUserIDs: [],
          averageRating: 0,
          reviewCount: 0,
          listingCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...data,
        });
      }
      await fetchProfile(user.uid);
    } catch (e: unknown) {
      setError((e as Error).message);
    }
  }

  async function refreshProfile() {
    if (user) await fetchProfile(user.uid);
  }

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, error, signIn, signUp, signOut, completeProfile, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}
