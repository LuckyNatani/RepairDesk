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
            // First get the owner's company_id
            const { data: ownerData, error: ownerError } = await supabase
                .from('users')
                .select('company_id')
                .eq('id', currentUser.id)
                .single();

            if (ownerError) throw new Error("Could not determine your company.");
            if (!ownerData.company_id) throw new Error("You are not assigned to a company.");

            const companyId = ownerData.company_id;
            const systemEmail = `${username}@taskpod.system`;

            // Create Supabase Auth user
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
                email: systemEmail,
                password: password,
            });

            if (signUpError) throw signUpError;
            if (!authData.user) throw new Error("Failed to create user account system record.");

            // Create profile in our users table
            const { error: profileError } = await supabase
                .from('users')
                .insert([{
                    id: authData.user.id,
                    name: name,
                    username: username,
                    role: 'staff',
                    company_id: companyId
                }]);

            if (profileError) throw profileError;

            // Refresh the staff list
            const { data } = await supabase
                .from('users')
                .select('*')
                .eq('role', 'staff')
                .order('name');

            if (data) setStaff(data);

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

    return { staff, loading, createStaffMember, removeStaffMember };
};
