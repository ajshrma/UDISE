'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import axios from '@/lib/api/axios';

interface User {
    name: string;
    email: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (user: User) => void;
    logout: () => void;
    refresh: () => Promise<void>;
    user: User | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    const checkAuth = useCallback(async () => {
        try {
            // Check if we're in browser environment
            if (typeof window === 'undefined') {
                setIsAuthenticated(false);
                setUser(null);
                setIsLoading(false);
                return;
            }

            // Check if user data exists in localStorage first
            const storedUser = localStorage.getItem('user');
            const storedAuth = localStorage.getItem('isAuthenticated');
            
            if (storedUser && storedAuth === 'true') {
                try {
                    const userData = JSON.parse(storedUser);
                    // Validate user data structure
                    if (userData && (userData.name || userData.email)) {
                        setUser(userData);
                        setIsAuthenticated(true);
                        setIsLoading(false);
                        return;
                    } else {
                        // Invalid user data structure
                        localStorage.removeItem('user');
                        localStorage.removeItem('isAuthenticated');
                    }
                } catch (parseError) {
                    // If localStorage data is corrupted, clear it
                    localStorage.removeItem('user');
                    localStorage.removeItem('isAuthenticated');
                }
            }
            
            // If no stored data or corrupted data, user is not authenticated
            setIsAuthenticated(false);
            setUser(null);
            setIsLoading(false);
        } catch (error) {
            setIsAuthenticated(false);
            setUser(null);
            if (typeof window !== 'undefined') {
                localStorage.removeItem('user');
                localStorage.removeItem('isAuthenticated');
            }
            setIsLoading(false);
        }
    }, []);

    // Add a window focus event listener to check auth on page focus
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const handleFocus = () => {
                // Re-check authentication when window gains focus
                checkAuth();
            };

            window.addEventListener('focus', handleFocus);
            return () => window.removeEventListener('focus', handleFocus);
        }
    }, [checkAuth]);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // Add a visibility change listener to check auth when page becomes visible
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const handleVisibilityChange = () => {
                if (!document.hidden) {
                    // Page became visible, re-check authentication
                    checkAuth();
                }
            };

            document.addEventListener('visibilitychange', handleVisibilityChange);
            return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
        }
    }, [checkAuth]);

    const login = useCallback((userData: User) => {
        setUser(userData);
        setIsAuthenticated(true);
        // Store in localStorage only in browser
        if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('isAuthenticated', 'true');
        }
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setIsAuthenticated(false);
        // Clear localStorage only in browser
        if (typeof window !== 'undefined') {
            localStorage.removeItem('user');
            localStorage.removeItem('isAuthenticated');
        }
    }, []);

    const refresh = useCallback(() => checkAuth(), [checkAuth]);

    if (isLoading) {
        return null;
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, refresh, user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
