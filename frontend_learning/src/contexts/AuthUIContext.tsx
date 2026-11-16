import { createContext, useContext, useState, type ReactNode } from 'react';

type Role = 'student' | 'teacher';

interface AuthUIContextValue {
  role: Role;
  setRole: (role: Role) => void;
}

const AuthUIContext = createContext<AuthUIContextValue | undefined>(undefined);

export function AuthUIProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('student');

  return (
    <AuthUIContext.Provider value={{ role, setRole }}>
      {children}
    </AuthUIContext.Provider>
  );
}

export function useAuthUI() {
  const ctx = useContext(AuthUIContext);
  if (!ctx) throw new Error('useAuthUI must be used within AuthUIProvider');
  return ctx;
}