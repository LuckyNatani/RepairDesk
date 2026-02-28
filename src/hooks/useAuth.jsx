import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabaseClient';
import { subscribeToPush } from '../lib/pushNotifications';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        // Initialize session safely without racing getSession and onAuthStateChange
        const initializeAuth = async () => {
            try {
                // Get initial session
                const { data: { session } } = await supabase.auth.getSession();

                if (session) {
                    if (mounted) setUser(session.user);
                    await fetchUserRole(session.user.id);
                    if (mounted) subscribeToPush(session.user.id);
                } else {
                    if (mounted) setLoading(false);
                }
            } catch (err) {
                console.error("Auth init error:", err);
                if (mounted) setLoading(false);
            }
        };

        initializeAuth();

        // Listen for auth changes separately
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            // Ignore the initial session event to prevent duplicate fetches/deadlocks
            if (_event === 'INITIAL_SESSION') return;

            if (session) {
                if (mounted) setUser(session.user);
                await fetchUserRole(session.user.id);
                if (mounted) subscribeToPush(session.user.id);
            } else {
                if (mounted) {
                    setUser(null);
                    setRole(null);
                    setLoading(false);
                }
            }
        });

        return () => {
            mounted = false;
            if (subscription) subscription.unsubscribe();
        };
    }, []);

    const fetchUserRole = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('role')
                .eq('id', userId)
                .single();

            if (data && !error) {
                setRole(data.role);
            }
        } catch (err) {
            console.error('Error fetching user role:', err);
        } finally {
            setLoading(false);
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
        <AuthContext.Provider value={{ user, role, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
