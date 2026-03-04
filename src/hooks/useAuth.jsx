import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabaseClient';
import { subscribeToPush } from '../lib/pushNotifications';

const AuthContext = createContext();

// Helper: wrap a promise with a timeout
const withTimeout = (promise, ms) => {
    const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out')), ms)
    );
    return Promise.race([promise, timeout]);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [roleError, setRoleError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            try {
                // 1. Check for a stored session in localStorage (fast, local)
                const { data: { session: cachedSession } } = await supabase.auth.getSession();

                if (!cachedSession) {
                    if (mounted) setLoading(false);
                    return;
                }

                // 2. Try to refresh the session (network call) with 6s timeout
                let session;
                try {
                    const { data, error: refreshError } = await withTimeout(
                        supabase.auth.refreshSession(), 6000
                    );
                    if (refreshError || !data?.session) {
                        console.warn('Session refresh failed, using cached session:', refreshError?.message);
                        // Fall back to cached session — it might still work if JWT hasn't expired
                        session = cachedSession;
                    } else {
                        session = data.session;
                    }
                } catch (timeoutErr) {
                    console.warn('Session refresh timed out, using cached session');
                    session = cachedSession;
                }

                // 3. Now we have a session — fetch the user role
                if (mounted) setUser(session.user);
                await fetchUserRole(session.user.id, () => mounted);
                if (mounted) subscribeToPush(session.user.id);

            } catch (err) {
                console.error('Auth init error:', err);
                if (mounted) setLoading(false);
            }
        };

        initializeAuth();

        // Listen for future auth changes (login, logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (_event === 'INITIAL_SESSION') return;
            if (!mounted) return;

            if (_event === 'SIGNED_IN') {
                setLoading(true);  // Show loading while fetching role
                setUser(session.user);
                await fetchUserRole(session.user.id, () => mounted);
                if (mounted) subscribeToPush(session.user.id);
            } else if (_event === 'SIGNED_OUT') {
                setUser(null);
                setRole(null);
                setRoleError(null);
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            if (subscription) subscription.unsubscribe();
        };
    }, []);

    const fetchUserRole = async (userId, isMounted) => {
        try {
            if (isMounted && isMounted()) setRoleError(null);
            const { data, error } = await withTimeout(
                supabase
                    .from('users')
                    .select('role, company_id')
                    .eq('id', userId)
                    .single(),
                5000
            );

            if (error) throw error;
            if (!data) throw new Error("User record not found");

            if (data.role !== 'superadmin' && !data.company_id) {
                throw new Error("Missing company assignment");
            }

            if (isMounted && isMounted()) {
                setRole(data.role);
            }
        } catch (err) {
            console.error('Error fetching user role:', err);
            if (isMounted && isMounted()) {
                setRoleError(err.message || "Failed to fetch role");
                setRole(null);
            }
        } finally {
            if (isMounted && isMounted()) {
                setLoading(false);
            }
        }
    };

    const login = async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return error;
    };

    const logout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, role, roleError, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
