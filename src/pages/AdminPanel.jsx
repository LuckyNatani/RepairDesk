import React, { useState } from 'react';
import Navbar from '../components/shared/Navbar';
import { useStaff } from '../hooks/useStaff';
import { UserPlus, Shield, Smartphone, Mail, Trash2, Loader2, Search } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const AdminPanel = () => {
    const { staff, loading: staffLoading } = useStaff();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [newStaff, setNewStaff] = useState({ name: '', email: '', phone: '', password: 'Password@123' });
    const [submitting, setSubmitting] = useState(false);

    const filteredStaff = staff.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreateStaff = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // 1. Create User in Supabase Auth (This usually requires a Service Role or Edge Function 
            // for security, but for this PRD we'll assume the Owner can sign them up via a simplified flow 
            // or we provide instructions for manual invite.)

            // NOTE: In a production Supabase app, the owner would use an Edge Function 
            // to create users via the Admin Auth API to avoid local sign-out.
            alert("Staff creation requires Supabase Admin API. In this demo, create staff users via the Supabase Dashboard > Authentication > Add User.");
            setIsAdding(false);
        } catch (err) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/30">
            <Navbar />

            <main className="max-w-5xl mx-auto px-4 py-8">
                <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <div className="flex items-center space-x-2 text-indigo-900 mb-1">
                            <Shield size={24} strokeWidth={3} />
                            <h1 className="text-2xl font-black tracking-tight uppercase">Admin Panel</h1>
                        </div>
                        <p className="text-gray-500 font-medium text-sm">Manage staff accounts and system permissions</p>
                    </div>

                    <button
                        onClick={() => setIsAdding(true)}
                        className="px-6 py-3 bg-indigo-900 text-white font-bold rounded-2xl flex items-center shadow-lg hover:bg-indigo-800 transition-all active:scale-95"
                    >
                        <UserPlus size={18} className="mr-2" />
                        Add Staff Member
                    </button>
                </header>

                {/* Search Bar */}
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search staff by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-medium"
                    />
                </div>

                {/* Staff List */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    {staffLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                            <Loader2 size={32} className="animate-spin mb-3 text-indigo-200" />
                            <p className="font-bold">Loading staff directory...</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {filteredStaff.length > 0 ? (
                                filteredStaff.map((person) => (
                                    <div key={person.id} className="p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors group">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-900 font-black text-lg">
                                                {person.name[0]}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{person.name}</h3>
                                                <div className="flex items-center space-x-3 mt-1 text-xs text-gray-400 font-bold tracking-tight">
                                                    <span className="flex items-center">
                                                        <Mail size={12} className="mr-1" />
                                                        {person.email || 'No email'}
                                                    </span>
                                                    <span className="flex items-center">
                                                        <Smartphone size={12} className="mr-1" />
                                                        {person.phone}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-green-100">
                                                Active
                                            </span>
                                            <button className="p-2 transition-colors text-gray-300 hover:text-red-500 rounded-xl hover:bg-red-50">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center">
                                    <p className="text-gray-400 font-bold">No staff members found matching your search</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Add Staff Modal Placeholder */}
                {isAdding && (
                    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8">
                            <h2 className="text-xl font-bold text-indigo-900 mb-4 flex items-center">
                                <UserPlus size={20} className="mr-2" />
                                Add New Staff
                            </h2>
                            <p className="text-gray-500 mb-6 text-sm">
                                Due to security restrictions, please create staff users via the <strong>Supabase Dashboard</strong>.
                                Ensure you set the <code>role</code> to <code>'staff'</code> in the <code>public.users</code> table after they sign up.
                            </p>
                            <button
                                onClick={() => setIsAdding(false)}
                                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-colors"
                            >
                                Got it, Close
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminPanel;
