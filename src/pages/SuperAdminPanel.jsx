import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Shield, Building, UserPlus, Trash2, Key, Edit2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import EditUserModal from '../components/shared/EditUserModal';

const SuperAdminPanel = () => {
    const { user } = useAuth();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form states
    const [newCompanyName, setNewCompanyName] = useState('');
    const [isCreatingCompany, setIsCreatingCompany] = useState(false);

    const [newAdmin, setNewAdmin] = useState({ companyId: '', name: '', username: '', password: '' });
    const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

    // Edit state
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [isUpdatingAdmin, setIsUpdatingAdmin] = useState(false);

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('companies')
                .select(`
                    id, 
                    name,
                    created_at,
                    users (id, name, username, role)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCompanies(data || []);
        } catch (err) {
            console.error('Error fetching companies:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCompany = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const { error: insertError } = await supabase
                .from('companies')
                .insert([{ name: newCompanyName }]);

            if (insertError) throw insertError;

            setNewCompanyName('');
            setIsCreatingCompany(false);
            fetchCompanies(); // Refresh list
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            // Invoke the create-user Edge Function (server-side user creation)
            const { data, error: functionError } = await supabase.functions.invoke('create-user', {
                body: {
                    name: newAdmin.name,
                    username: newAdmin.username,
                    password: newAdmin.password,
                    role: 'owner',
                    companyId: newAdmin.companyId
                }
            });

            if (functionError) throw new Error(functionError.message || 'Failed to create admin');
            if (data?.error) throw new Error(data.error);

            setNewAdmin({ companyId: '', name: '', username: '', password: '' });
            setIsCreatingAdmin(false);
            fetchCompanies(); // Refresh list to show new admin

        } catch (err) {
            setError(err.message);
        }
    };

    const handleEditAdmin = async (userId, updates) => {
        try {
            setIsUpdatingAdmin(true);
            setError(null);

            const { data, error: functionError } = await supabase.functions.invoke('update-user', {
                body: { targetUserId: userId, updates }
            });

            if (functionError) throw new Error(functionError.message || 'Failed to update admin');
            if (data?.error) throw new Error(data.error);

            setEditingAdmin(null);
            fetchCompanies(); // Refresh data to show changes
        } catch (err) {
            setError(err.message || 'An error occurred while updating the admin.');
        } finally {
            setIsUpdatingAdmin(false);
        }
    };

    if (loading && companies.length === 0) {
        return (
            <div className="flex items-center justify-center h-[70vh] text-slate-400">
                <Shield className="animate-spin mb-4 text-indigo-400" size={32} />
                <p className="font-medium ml-3">Loading system records...</p>
            </div>
        );
    }

    return (
        <div className="h-full">
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 md:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                        <Key size={24} className="text-indigo-600 hidden sm:block" />
                        Super Admin Panel
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">Manage tenants, companies, and their administrators</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsCreatingCompany(true)}
                        className="flex items-center justify-center px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium text-sm rounded-lg transition-colors border border-indigo-200"
                    >
                        <Building size={16} className="mr-2" />
                        New Company
                    </button>
                    <button
                        onClick={() => setIsCreatingAdmin(true)}
                        className="flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition-colors shadow-sm"
                    >
                        <UserPlus size={16} className="mr-2" />
                        New Admin
                    </button>
                </div>
            </div>

            <main className="max-w-[1200px] mx-auto p-6 md:p-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200 font-medium">
                        {error}
                        <button onClick={() => setError(null)} className="ml-2 font-bold hover:underline">Dismiss</button>
                    </div>
                )}

                {/* Create Company Form */}
                {isCreatingCompany && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 mb-8">
                        <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                            <Building size={18} className="mr-2 text-indigo-600" />
                            Register New Company
                        </h2>
                        <form onSubmit={handleCreateCompany} className="max-w-md">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Company Name</label>
                                <input
                                    required
                                    type="text"
                                    value={newCompanyName}
                                    onChange={e => setNewCompanyName(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Acme Corp"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700">Save Company</button>
                                <button type="button" onClick={() => setIsCreatingCompany(false)} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50">Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Create Admin Form */}
                {isCreatingAdmin && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 mb-8">
                        <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                            <UserPlus size={18} className="mr-2 text-indigo-600" />
                            Create Company Administrator
                        </h2>
                        <form onSubmit={handleCreateAdmin} className="max-w-2xl">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Company</label>
                                    <select
                                        required
                                        value={newAdmin.companyId}
                                        onChange={e => setNewAdmin({ ...newAdmin, companyId: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="" disabled>Choose a company...</option>
                                        {companies.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Admin Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={newAdmin.name}
                                        onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Admin Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Unique Username</label>
                                    <input
                                        required
                                        type="text"
                                        value={newAdmin.username}
                                        onChange={e => setNewAdmin({ ...newAdmin, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                        placeholder="admin_acme"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Lowercase letters, numbers, and underscores only.</p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Initial Password</label>
                                    <input
                                        required
                                        type="password"
                                        minLength={6}
                                        value={newAdmin.password}
                                        onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Min 6 characters"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700">Create Administrator</button>
                                <button type="button" onClick={() => setIsCreatingAdmin(false)} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50">Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Companies List */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {companies.map(company => (
                        <div key={company.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                                        <Building size={16} />
                                    </div>
                                    <h3 className="font-semibold text-slate-800">{company.name}</h3>
                                </div>
                                <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                                    {(company.users || []).filter(u => u.role === 'owner').length} Admins
                                </span>
                            </div>
                            <div className="p-4">
                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Administrators</h4>
                                <div className="space-y-2">
                                    {(company.users || []).filter(u => u.role === 'owner').length === 0 ? (
                                        <p className="text-sm text-slate-500 italic">No administrators assigned yet.</p>
                                    ) : (
                                        (company.users || [])
                                            .filter(u => u.role === 'owner')
                                            .map(admin => (
                                                <div key={admin.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-900">{admin.name}</p>
                                                        <p className="text-xs text-slate-500 font-mono mt-0.5">@{admin.username}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded">Owner</span>
                                                        <button
                                                            onClick={() => setEditingAdmin(admin)}
                                                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                            title="Edit Administrator"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {companies.length === 0 && (
                        <div className="col-span-full p-12 text-center border-2 border-dashed border-slate-200 rounded-xl">
                            <Building size={48} className="mx-auto mb-4 text-slate-300" />
                            <h3 className="text-lg font-medium text-slate-900 mb-1">No Companies Registered</h3>
                            <p className="text-slate-500 text-sm">Create your first tenant company to get started.</p>
                        </div>
                    )}
                </div>
            </main>

            <EditUserModal
                user={editingAdmin}
                onClose={() => setEditingAdmin(null)}
                onSave={handleEditAdmin}
                isUpdating={isUpdatingAdmin}
            />
        </div>
    );
};

export default SuperAdminPanel;
