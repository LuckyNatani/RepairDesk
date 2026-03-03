import React, { useState } from 'react';
import { useStaff } from '../hooks/useStaff';
import { UserPlus, Settings, Shield, User, Trash2 } from 'lucide-react';

const AdminPanel = () => {
    const { staff, loading, createStaffMember, removeStaffMember } = useStaff();
    const [isCreating, setIsCreating] = useState(false);
    const [newStaff, setNewStaff] = useState({ name: '', username: '', password: '' });
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await createStaffMember(newStaff.name, newStaff.username, newStaff.password);
            setNewStaff({ name: '', username: '', password: '' });
            setIsCreating(false);
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[70vh] text-slate-400">
                <Settings className="animate-spin mb-4 text-indigo-400" size={32} />
                <p className="font-medium ml-3">Loading staff directory...</p>
            </div>
        );
    }

    return (
        <div className="h-full">
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 md:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                        <Shield size={24} className="text-indigo-600 hidden sm:block" />
                        Team Management
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">Manage your staff members and assignments</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    <UserPlus size={16} className="mr-2" />
                    Add Team Member
                </button>
            </div>

            <main className="max-w-[1000px] mx-auto p-6 md:p-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200 font-medium">
                        {error}
                    </div>
                )}

                {isCreating && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 mb-8 relative overflow-hidden animate-in fade-in slide-in-from-top-4">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <UserPlus size={120} />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center relative z-10">
                            <UserPlus size={18} className="mr-2 text-indigo-600" />
                            Create New Account
                        </h2>

                        <form onSubmit={handleSubmit} className="relative z-10 max-w-2xl">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={newStaff.name}
                                        onChange={e => setNewStaff({ ...newStaff, name: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                        placeholder="Jane Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Unique Username</label>
                                    <input
                                        required
                                        type="text"
                                        value={newStaff.username}
                                        onChange={e => setNewStaff({ ...newStaff, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                        placeholder="jane_doe"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Lowercase letters, numbers, and underscores.</p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Temporary Password</label>
                                    <input
                                        required
                                        type="password"
                                        minLength={6}
                                        value={newStaff.password}
                                        onChange={e => setNewStaff({ ...newStaff, password: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                        placeholder="Minimum 6 characters"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    Create Account
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium text-sm rounded-lg hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-800">Active Directory</h3>
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">{staff.length} Members</span>
                    </div>
                    {staff.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            <Users size={32} className="mx-auto mb-3 text-slate-300" />
                            <p className="text-sm font-medium text-slate-600 mb-1">No staff members found</p>
                            <p className="text-xs">Add a team member to get started.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {staff.map((member) => (
                                <li key={member.id} className="p-4 md:p-6 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-semibold shadow-sm group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors shrink-0">
                                            {member.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900 group-hover:text-indigo-900 transition-colors">{member.name}</p>
                                            <div className="flex flex-col sm:flex-row sm:items-center text-xs text-slate-500 gap-1 sm:gap-3 mt-0.5">
                                                <span className="flex items-center"><User size={12} className="mr-1 opacity-70" /> Staff Role</span>
                                                <span className="hidden sm:inline text-slate-300">•</span>
                                                <span className="truncate max-w-[200px] font-mono">@{member.username}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (window.confirm(`Are you sure you want to remove ${member.name}?`)) {
                                                removeStaffMember(member.id);
                                            }
                                        }}
                                        className="w-full sm:w-auto px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 rounded-md transition-colors border border-red-100 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 flex items-center justify-center gap-1.5"
                                    >
                                        <Trash2 size={14} />
                                        Remove
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminPanel;
