import React, { useState } from 'react';
import { useStaff } from '../hooks/useStaff';
import { UserPlus, Settings, Shield, User, Trash2, Users, Edit2 } from 'lucide-react';
import EditUserModal from '../components/shared/EditUserModal';

const AdminPanel = () => {
    const { staff, loading, createStaffMember, removeStaffMember, updateStaffMember } = useStaff();
    const [isCreating, setIsCreating] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
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

    const handleEditStaff = async (userId, updates) => {
        try {
            setIsUpdating(true);
            setError(null);
            await updateStaffMember(userId, updates);
            setEditingStaff(null);
        } catch (err) {
            setError(err.message || 'Failed to update staff member');
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-40 text-slate-400 gap-2">
                <Settings className="animate-spin text-indigo-400" size={16} />
                <p className="text-[12px] font-medium">Loading staff directory...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {/* Compact Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-[15px] font-semibold text-slate-900 tracking-tight">Team Management</h1>
                    <p className="text-[11px] text-slate-400 mt-0.5">Manage staff members and access</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-semibold text-[12px] rounded-lg transition-all shadow-sm shadow-indigo-600/20"
                >
                    <UserPlus size={13} />
                    <span className="hidden sm:inline">Add Member</span>
                </button>
            </div>

            {/* Error banner */}
            {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-[12px] border border-red-100 font-medium flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="ml-2 font-bold hover:underline shrink-0">✕</button>
                </div>
            )}

            {/* Create form */}
            {isCreating && (
                <div className="bg-white rounded-lg border border-slate-200 p-4 relative overflow-hidden">
                    <h2 className="text-[13px] font-semibold text-slate-900 mb-3 flex items-center gap-1.5">
                        <UserPlus size={13} className="text-indigo-600" />
                        Create Staff Account
                    </h2>
                    <form onSubmit={handleSubmit} className="max-w-xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <div>
                                <label className="block text-[11px] font-medium text-slate-600 mb-1">Full Name</label>
                                <input
                                    required
                                    type="text"
                                    value={newStaff.name}
                                    onChange={e => setNewStaff({ ...newStaff, name: e.target.value })}
                                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-[12px] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                    placeholder="Jane Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-medium text-slate-600 mb-1">Username</label>
                                <input
                                    required
                                    type="text"
                                    value={newStaff.username}
                                    onChange={e => setNewStaff({ ...newStaff, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-[12px] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                    placeholder="jane_doe"
                                />
                                <p className="text-[10px] text-slate-400 mt-0.5">Lowercase, numbers, underscores only</p>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[11px] font-medium text-slate-600 mb-1">Temporary Password</label>
                                <input
                                    required
                                    type="password"
                                    minLength={6}
                                    value={newStaff.password}
                                    onChange={e => setNewStaff({ ...newStaff, password: e.target.value })}
                                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-[12px] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                    placeholder="Min. 6 characters"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 pt-3 border-t border-slate-100">
                            <button
                                type="submit"
                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[12px] rounded-md transition-colors"
                            >
                                Create Account
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 font-medium text-[12px] rounded-md hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Staff list */}
            <div className="bg-white rounded-lg border border-slate-100 overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                {/* List header */}
                <div className="px-3.5 py-2 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                    <h3 className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">Active Directory</h3>
                    <span className="text-[10px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-100">
                        {staff.length} member{staff.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {staff.length === 0 ? (
                    <div className="py-12 text-center">
                        <Users size={24} className="mx-auto mb-2 text-slate-200" />
                        <p className="text-[12px] font-medium text-slate-500 mb-0.5">No staff members yet</p>
                        <p className="text-[11px] text-slate-400">Add a team member to get started.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-slate-50">
                        {staff.map((member) => (
                            <li
                                key={member.id}
                                className="px-3.5 py-2.5 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-3 group"
                            >
                                {/* Avatar + info */}
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-semibold text-[11px] shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors">
                                        {member.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[12px] font-semibold text-slate-900 truncate">{member.name}</p>
                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                                            <User size={9} className="opacity-60 shrink-0" />
                                            <span>Staff</span>
                                            <span className="text-slate-200">•</span>
                                            <span className="font-mono truncate max-w-[140px]">@{member.username}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1.5 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setEditingStaff(member)}
                                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors border border-transparent hover:border-indigo-100"
                                        title="Edit"
                                    >
                                        <Edit2 size={13} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (window.confirm(`Remove ${member.name}?`)) {
                                                removeStaffMember(member.id);
                                            }
                                        }}
                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors border border-transparent hover:border-red-100"
                                        title="Remove"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <EditUserModal
                user={editingStaff}
                onClose={() => setEditingStaff(null)}
                onSave={handleEditStaff}
                isUpdating={isUpdating}
            />
        </div>
    );
};

export default AdminPanel;
