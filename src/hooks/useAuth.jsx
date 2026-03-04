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
        let authInitialized = false;

        // Safety timeout — never stay stuck on loading for more than 8 seconds
        const safetyTimer = setTimeout(() => {
            if (mounted && loading) {
                console.warn('Auth init timed out — forcing loading to false');
                setLoading(false);
            }
        }, 8000);

        // Use onAuthStateChange as the SINGLE source of truth.
        // It fires INITIAL_SESSION on setup (with the restored session if any),
        // then TOKEN_REFRESHED, SIGNED_IN, SIGNED_OUT, etc.
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!mounted) return;

            if (session) {
                setUser(session.user);

                // Only fetch role on initial load or sign-in events.
                // Skip TOKEN_REFRESHED and other maintenance events to avoid redundant fetches.
                if (!authInitialized || _event === 'SIGNED_IN') {
                    authInitialized = true;
                    await fetchUserRole(session.user.id, () => mounted);
                    if (mounted) subscribeToPush(session.user.id);
                }
            } else {
                setUser(null);
                setRole(null);
                setRoleError(null);
                setLoading(false);
                authInitialized = true;
            }
        });

        return () => {
            mounted = false;
            clearTimeout(safetyTimer);
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
