/**
 * SISMP — Auth Provider & Role Gate
 * Client-side authentication context with RBAC gating.
 */
'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { ROLES, type Role } from './roles';
import { hasPermission, type Permission } from './permissions';

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  role: Role;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  switchRole: (role: Role) => void; // Dev utility for testing RBAC
  can: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USER: User = {
  id: 'dev-001',
  name: 'Department Officer',
  email: 'officer@mp.gov.in',
  role: ROLES.DEPARTMENT_OFFICER,
  department: 'Department of Industrial Policy',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage if available, otherwise fallback to null (or mock for dev)
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('sismp_auth_user');
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        setUser(MOCK_USER);
      }
    } catch {
      setUser(MOCK_USER);
    }
    setIsLoaded(true);
  }, []);

  const login = useCallback((newUser: User) => {
    setUser(newUser);
    localStorage.setItem('sismp_auth_user', JSON.stringify(newUser));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('sismp_auth_user');
  }, []);

  const switchRole = useCallback((role: Role) => {
    setUser((prev) => {
      const updated = prev ? { ...prev, role } : { ...MOCK_USER, role };
      localStorage.setItem('sismp_auth_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const can = useCallback(
    (permission: Permission) => {
      if (!user) return false;
      return hasPermission(user.role, permission);
    },
    [user]
  );

  const value: AuthContextType = {
    user,
    role: user?.role ?? ROLES.PUBLIC,
    isAuthenticated: user !== null && user.role !== ROLES.PUBLIC,
    login,
    logout,
    switchRole,
    can,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * RoleGate — conditionally renders children based on role/permission.
 * Use this instead of disabling buttons. Components behind RoleGate
 * never render for unauthorized roles.
 */
interface RoleGateProps {
  children: ReactNode;
  /** Allow if user has this role */
  role?: Role | Role[];
  /** Allow if user has this permission */
  permission?: Permission;
  /** Fallback content for unauthorized users (default: nothing) */
  fallback?: ReactNode;
}

export function RoleGate({ children, role, permission, fallback = null }: RoleGateProps) {
  const { user, can } = useAuth();

  if (!user) return <>{fallback}</>;

  // Check role-based access
  if (role) {
    const roles = Array.isArray(role) ? role : [role];
    if (!roles.includes(user.role)) return <>{fallback}</>;
  }

  // Check permission-based access
  if (permission) {
    if (!can(permission)) return <>{fallback}</>;
  }

  return <>{children}</>;
}
