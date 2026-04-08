import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

export interface UserPayload {
  id: number;
  name: string;
  email: string;
  permissions: string[];
  exp: number;
  iat: number;
}

interface AuthContextType {
  user: UserPayload | null;
  login: (token: string) => void;
  logout: () => void;
  isLoadingAuth: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserPayload | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Re-hydrate session on mount
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch('/api/users/me/');
        if (res.ok) {
          const data = await res.json();
          const decoded = jwtDecode<UserPayload>(data.token);
          setUser(decoded);
        }
      } catch (err) {
        console.error("Session re-hydration explicitly failed:", err);
      } finally {
        setIsLoadingAuth(false);
      }
    };
    
    fetchMe();
  }, []);

  const login = (token: string) => {
    try {
      const decoded = jwtDecode<UserPayload>(token);
      setUser(decoded);
    } catch (e) {
      console.error("Invalid token format generated");
    }
  };

  const logout = async () => {
    setUser(null);
    try {
      await fetch('/api/users/logout/', { method: 'POST' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoadingAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
