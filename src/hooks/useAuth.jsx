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
            if (!isMounted()) return;
            setRoleError(null);

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

            if (isMounted()) setRole(data.role);
        } catch (err) {
            console.error('Error fetching user role:', err);
            if (isMounted()) {
                setRoleError(err.message || "Failed to fetch role");
                setRole(null);
            }
        } finally {
            if (isMounted()) setLoading(false);
        }
    };

    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            try {
                // Check active sessions and sets the user
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error("Error getting session:", error);
                    if (mounted) setLoading(false);
                    return;
                }

                if (session?.user) {
                    if (mounted) setUser(session.user);
                    await fetchUserRole(session.user.id, () => mounted);
                    if (mounted) subscribeToPush(session.user.id);
                } else {
                    // Important: Always set loading to false if no session
                    if (mounted) {
                        setUser(null);
                        setRole(null);
                        setLoading(false);
                    }
                }
            } catch (err) {
                console.error('Auth init error:', err);
                if (mounted) setLoading(false);
            }
        };

        initializeAuth();

        // Listen for changes on auth state (in, out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!mounted) return;

            if (session?.user) {
                // If user changes, update state and fetch their new role
                setUser(session.user);
                setLoading(true); // Temporarily show loading while fetching new roles
                await fetchUserRole(session.user.id, () => mounted);
                if (mounted) subscribeToPush(session.user.id);
            } else {
                // Logged out
                setUser(null);
                setRole(null);
                setRoleError(null);
                setLoading(false); // Make sure we stop loading!
            }
        });

        // Fallback timeout to prevent infinite loading if Supabase hangs indefinitely
        const timeoutId = setTimeout(() => {
            if (mounted && loading) {
                console.warn("Auth initialization timed out. Forcing loading state to false.");
                setLoading(false);
                setRoleError("Authentication request timed out. Please refresh or check your connection.");
            }
        }, 8000);

        return () => {
            mounted = false;
            clearTimeout(timeoutId);
            if (subscription) subscription.unsubscribe();
        };
    }, []); // Empty dependency array so this exact effect only runs once on mount.

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
