import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabaseClient';
import { subscribeToPush } from '../lib/pushNotifications';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [roleError, setRoleError] = useState(null);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error("Error getting session:", error);
                }

                if (session?.user) {
                    if (mounted) setUser(session.user);
                    await fetchUserRole(session.user.id, () => mounted);
                    if (mounted) subscribeToPush(session.user.id);
                } else {
                    if (mounted) setLoading(false);
                }
            } catch (err) {
                console.error('Auth init error:', err);
                if (mounted) setLoading(false);
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!mounted) return;

            if (session?.user) {
                // Only set loading if we don't already have the user (e.g. initial login vs token refresh)
                if (!user || user.id !== session.user.id) {
                    setLoading(true);
                    setUser(session.user);
                    await fetchUserRole(session.user.id, () => mounted);
                    if (mounted) subscribeToPush(session.user.id);
                }
            } else {
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
    }, [user?.id]); // Adding user?.id to dependencies prevents stale closures

    const login = async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return error; // The onAuthStateChange listener will handle the rest
    };

    const logout = async () => {
        setLoading(true); // Show loading while logging out
        await supabase.auth.signOut();
        // The onAuthStateChange listener will handle the UI reset
    };

    return (
        <AuthContext.Provider value={{ user, role, roleError, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
