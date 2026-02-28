import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useStaff = () => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('role', 'staff')
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

    return { staff, loading };
};
