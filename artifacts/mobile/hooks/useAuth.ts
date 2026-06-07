import { useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { AppUser, UserRole } from "../types";

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        try {
          const userDoc = await getDoc(doc(db, "users", fbUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUser({
              uid: fbUser.uid,
              name: data.name ?? fbUser.displayName ?? fbUser.email?.split("@")[0] ?? "User",
              email: data.email ?? fbUser.email ?? "",
              role: data.role as UserRole,
              createdAt: data.createdAt?.toDate() ?? new Date(),
              updatedAt: data.updatedAt?.toDate() ?? new Date(),
            });
          } else {
            // User doc not found yet (e.g. just registered) — build minimal user
            setUser({
              uid: fbUser.uid,
              name: fbUser.displayName ?? fbUser.email?.split("@")[0] ?? "User",
              email: fbUser.email ?? "",
              role: "commuter",
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
        } catch {
          // Firestore read failed (permissions or offline) — use Firebase Auth data as fallback
          setUser({
            uid: fbUser.uid,
            name: fbUser.displayName ?? fbUser.email?.split("@")[0] ?? "User",
            email: fbUser.email ?? "",
            role: "commuter",
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  async function signIn(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function register(email: string, password: string, name: string): Promise<void> {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", cred.user.uid), {
      name,
      email,
      role: "commuter" as UserRole,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async function signOut(): Promise<void> {
    await firebaseSignOut(auth);
  }

  return { user, firebaseUser, loading, signIn, register, signOut };
}
