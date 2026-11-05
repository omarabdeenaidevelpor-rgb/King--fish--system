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
  const credentialLogin = trpc.loginWithCredentials.useMutation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const idToken = await fbUser.getIdToken();
        setToken(idToken);
        localStorage.setItem('firebase_user_token', idToken);
      } else {
        const currentToken = localStorage.getItem('firebase_user_token');
        if (!currentToken || !currentToken.startsWith('kf_session_v1.')) {
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
    const result = await credentialLogin.mutateAsync({ username, password: pass });
    setToken(result.token);
    localStorage.setItem('firebase_user_token', result.token);
    await refetchProfile();
    return true;
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
