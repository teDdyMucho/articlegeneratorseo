import { createContext, useContext, useState, ReactNode } from 'react';

const VALID_EMAIL = 'ongoing44444@gmail.com';
const VALID_PASSWORD = 'Ongoing2025!';
const STORAGE_KEY = 'auth_logged_in';

interface AuthContextValue {
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => { error: string | null };
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem(STORAGE_KEY) === 'true'
  );

  const signIn = (email: string, password: string) => {
    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
      localStorage.setItem(STORAGE_KEY, 'true');
      setIsAuthenticated(true);
      return { error: null };
    }
    return { error: 'Invalid email or password' };
  };

  const signOut = () => {
    localStorage.removeItem(STORAGE_KEY);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
