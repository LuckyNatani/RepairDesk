import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';

export const useStaff = () => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user: currentUser } = useAuth();

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('role', 'staff')
                    // RLS automatically filters this to their own company
                    .order('name');

                if (error) throw error;
                setStaff(data || []);
            } catch (err) {
                console.error('Error fetching staff:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStaff();
    }, []);

    const createStaffMember = async (name, username, password) => {
        try {
            // Invoke the create-user Edge Function (server-side user creation)
            // This avoids the signUp session hijack that would log out the admin
            const { data, error } = await supabase.functions.invoke('create-user', {
                body: { name, username, password, role: 'staff' }
            });

            if (error) {
                console.error('Edge Function Error:', error);
                throw new Error(error.message || 'Failed to create staff member');
            }
            if (data?.error) {
                throw new Error(data.error);
            }

            // Refresh the staff list
            const { data: newData } = await supabase
                .from('users')
                .select('*')
                .eq('role', 'staff')
                .order('name');

            if (newData) setStaff(newData);

            return { success: true };
        } catch (err) {
            throw err;
        }
    };

    const removeStaffMember = async (userId) => {
        try {
            // In a real production app we'd call an Edge Function to delete the auth user
            // For now, we'll just delete the profile record
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('id', userId);

            if (error) throw error;
            setStaff(staff.filter(s => s.id !== userId));
        } catch (err) {
            console.error('Error removing staff:', err);
            alert(err.message || 'Failed to remove staff member');
        }
    };

    const updateStaffMember = async (userId, updates) => {
        try {
            const { data, error } = await supabase.functions.invoke('update-user', {
                body: { targetUserId: userId, updates }
            });

            if (error) {
                console.error('Edge Function Error:', error);
                throw new Error(error.message || 'Failed to update user');
            }
            if (data?.error) {
                throw new Error(data.error);
            }

            // Refresh the staff list
            const { data: newData } = await supabase
                .from('users')
                .select('*')
                .eq('role', 'staff')
                .order('name');

            if (newData) setStaff(newData);

            return { success: true };
        } catch (err) {
            throw err;
        }
    };

    return { staff, loading, createStaffMember, removeStaffMember, updateStaffMember };
};
