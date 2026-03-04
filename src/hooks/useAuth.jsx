import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabaseClient';
import { subscribeToPush } from '../lib/pushNotifications';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [roleError, setRoleError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            try {
                // 1. Check for a stored session in localStorage
                const { data: { session: cachedSession } } = await supabase.auth.getSession();

                if (!cachedSession) {
                    // No session at all — user needs to log in
                    if (mounted) setLoading(false);
                    return;
                }

                // 2. Force-refresh the session to get a valid (non-expired) JWT.
                //    This is critical for PWA: users may reopen the app after hours/days,
                //    and the cached JWT will be expired. refreshSession() uses the
                //    long-lived refresh token to get a fresh access token.
                const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();

                if (refreshError || !session) {
                    // Refresh token is invalid — session is dead, user must re-login
                    console.warn('Session refresh failed:', refreshError?.message);
                    if (mounted) setLoading(false);
                    return;
                }

                // 3. Now we have a valid session with a fresh JWT — safe to query
                if (mounted) setUser(session.user);
                await fetchUserRole(session.user.id, () => mounted);
                if (mounted) subscribeToPush(session.user.id);

            } catch (err) {
                console.error('Auth init error:', err);
                if (mounted) setLoading(false);
            }
        };

        initializeAuth();

        // Listen for future auth changes (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            // Skip INITIAL_SESSION — already handled by initializeAuth above
            if (_event === 'INITIAL_SESSION') return;
            if (!mounted) return;

            if (_event === 'SIGNED_IN') {
                // Fresh login
                setUser(session.user);
                await fetchUserRole(session.user.id, () => mounted);
                if (mounted) subscribeToPush(session.user.id);
            } else if (_event === 'SIGNED_OUT') {
                setUser(null);
                setRole(null);
                setRoleError(null);
                setLoading(false);
            }
            // TOKEN_REFRESHED is handled automatically by the Supabase client —
            // no need to re-fetch role since it doesn't change.
        });

        return () => {
            mounted = false;
            if (subscription) subscription.unsubscribe();
        };
    }, []);

    const fetchUserRole = async (userId, isMounted) => {
        try {
            if (isMounted && isMounted()) setRoleError(null);
            const { data, error } = await supabase
                .from('users')
                .select('role, company_id')
                .eq('id', userId)
                .single();

            if (error) throw error;
            if (!data) throw new Error("User record not found");

            // SuperAdmins are allowed to have no company_id. Everyone else needs one.
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
