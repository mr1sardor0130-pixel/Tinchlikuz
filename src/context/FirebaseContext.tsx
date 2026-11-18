import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import { doc, onSnapshot, Timestamp } from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
  SUPER_ADMIN_EMAIL,
} from '../firebase';

export interface AdminRecord {
  email: string;
  displayName: string;
  canAccessPanel: boolean;
  canManageBookings: boolean;
  canManageAdmins: boolean;
  addedBy: string;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

interface FirebaseContextValue {
  user: User | null;
  authReady: boolean;
  adminProfile: AdminRecord | null;
  isSuperAdmin: boolean;
  canAccessPanel: boolean;
  canManageBookings: boolean;
  canManageAdmins: boolean;
  signingIn: boolean;
  authError: string;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [adminProfile, setAdminProfile] = useState<AdminRecord | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setAdminProfile(null);
        setProfileLoaded(true);
      } else {
        setProfileLoaded(false);
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  const userEmailLower = user?.email ? user.email.toLowerCase() : '';
  const isVerified = Boolean(user?.email && user?.emailVerified);
  const isSuperAdmin = isVerified && userEmailLower === SUPER_ADMIN_EMAIL;

  useEffect(() => {
    if (!authReady || !user || !isVerified || !userEmailLower) {
      setAdminProfile(null);
      setProfileLoaded(true);
      return;
    }

    const adminPath = `admins/${userEmailLower}`;
    const unsub = onSnapshot(
      doc(db, 'admins', userEmailLower),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setAdminProfile({
            email: String(data.email || userEmailLower),
            displayName: String(data.displayName || user.displayName || userEmailLower),
            canAccessPanel: Boolean(data.canAccessPanel),
            canManageBookings: Boolean(data.canManageBookings),
            canManageAdmins: Boolean(data.canManageAdmins),
            addedBy: String(data.addedBy || SUPER_ADMIN_EMAIL),
            createdAt: data.createdAt ?? null,
            updatedAt: data.updatedAt ?? null,
          });
        } else {
          setAdminProfile(null);
        }
        setProfileLoaded(true);
      },
      (error) => {
        setProfileLoaded(true);
        handleFirestoreError(error, OperationType.GET, adminPath);
      }
    );

    return () => unsub();
  }, [authReady, user, isVerified, userEmailLower]);

  const signInWithGoogle = async () => {
    setAuthError('');
    setSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : 'Google orqali kirishda xatolik yuz berdi.';
      if (msg.includes('popup-closed-by-user')) {
        setAuthError('Kirish oynasi yopildi. Qaytadan urinib ko‘ring.');
      } else {
        setAuthError(`Kirishda xatolik: ${msg}`);
      }
    } finally {
      setSigningIn(false);
    }
  };

  const signOutUser = async () => {
    setAuthError('');
    await signOut(auth);
  };

  const value = useMemo<FirebaseContextValue>(() => {
    const canAccessPanel = isSuperAdmin || Boolean(adminProfile?.canAccessPanel);
    const canManageBookings =
      isSuperAdmin ||
      (Boolean(adminProfile?.canAccessPanel) && Boolean(adminProfile?.canManageBookings));
    const canManageAdmins =
      isSuperAdmin ||
      (Boolean(adminProfile?.canAccessPanel) && Boolean(adminProfile?.canManageAdmins));

    return {
      user,
      authReady: authReady && profileLoaded,
      adminProfile,
      isSuperAdmin,
      canAccessPanel,
      canManageBookings,
      canManageAdmins,
      signingIn,
      authError,
      signInWithGoogle,
      signOutUser,
    };
  }, [
    user,
    authReady,
    profileLoaded,
    adminProfile,
    isSuperAdmin,
    signingIn,
    authError,
  ]);

  return (
    <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const ctx = useContext(FirebaseContext);
  if (!ctx) {
    throw new Error('useFirebase must be used inside FirebaseProvider');
  }
  return ctx;
}
