import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { User, UserRole } from './lib/utils';
import firebaseConfig from '../firebase-applet-config.json';
import { trpc } from './lib/trpc';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  login: () => Promise<void>;
  loginWithCredentials: (username: string, pass: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('firebase_user_token'));

  // tRPC query to get profile
  const { data: profile, refetch: refetchProfile } = trpc.me.useQuery(undefined, {
    enabled: !!token,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const idToken = await fbUser.getIdToken();
        setToken(idToken);
        localStorage.setItem('firebase_user_token', idToken);
      } else {
        const currentToken = localStorage.getItem('firebase_user_token');
        if (!currentToken || !currentToken.startsWith('admin_authorized_token')) {
          setToken(null);
          setUser(null);
          localStorage.removeItem('firebase_user_token');
        }
      }
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (profile) {
      setUser(profile as any);
    }
  }, [profile]);

  const login = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const loginWithCredentials = async (username: string, pass: string): Promise<boolean> => {
    if ((username === 'admin' || username === 'admin@kingfish.com') && pass === 'admin123') {
      const adminToken = 'admin_authorized_token_kf_2024';
      setToken(adminToken);
      localStorage.setItem('firebase_user_token', adminToken);
      await refetchProfile();
      return true;
    }
    return false;
  };

  const logout = () => {
    auth.signOut();
    setToken(null);
    setUser(null);
    localStorage.removeItem('firebase_user_token');
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, login, loginWithCredentials, logout, isLoading, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
