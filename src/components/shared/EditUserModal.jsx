import React, { useState, useEffect } from 'react';
import { X, User, Lock, Mail } from 'lucide-react';

const EditUserModal = ({ user, onClose, onSave, isUpdating }) => {
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                username: user.username || '',
                password: '' // Keep empty for security, optional to update
            });
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const updates = {};
        if (formData.name !== user.name) updates.name = formData.name;
        if (formData.username !== user.username) updates.username = formData.username;
        if (formData.password.trim() !== '') updates.password = formData.password;

        if (Object.keys(updates).length > 0) {
            await onSave(user.id, updates);
        } else {
            onClose(); // No changes
        }
    };

    if (!user) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
            <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-3xl shadow-2xl animate-in fade-in slide-in-from-bottom-8 sm:zoom-in duration-300 relative pb-safe">
                {/* Mobile Drag Handle Hint */}
                <div className="w-full flex justify-center pt-3 pb-2 sm:hidden absolute top-0 left-0 right-0 z-10 bg-white rounded-t-[32px]">
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
                </div>

                <div className="flex items-center justify-between p-6 border-b border-slate-100 pt-10 sm:pt-6 shrink-0 bg-white sm:rounded-t-3xl rounded-t-[32px]">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center mr-3 border border-indigo-100/50 shadow-sm">
                            <User size={16} className="text-indigo-600" />
                        </div>
                        Edit {user.role === 'owner' ? 'Company Owner' : 'Staff Member'}
                    </h2>
                    <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors shrink-0">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User size={18} className="text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900 bg-white"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5 pl-1">Username</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail size={18} className="text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900 bg-white"
                                    placeholder="john_doe"
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-1.5 pl-1">Used for login. Lowercase, numbers, underscores only.</p>
                        </div>

                        <div className="pt-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1.5 pl-1">New Password (Optional)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-slate-400" />
                                </div>
                                <input
                                    type="password"
                                    minLength={6}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900 bg-white"
                                    placeholder="Leave blank to keep current"
                                />
                            </div>
                        </div>

                        <div className="pt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isUpdating}
                                className="flex-1 px-4 py-3 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-70 flex justify-center items-center"
                            >
                                {isUpdating ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditUserModal;
