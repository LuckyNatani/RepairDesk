import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { X, UserPlus, Phone, MapPin, ClipboardList, PenLine } from 'lucide-react';

const NewTaskForm = ({ staffMembers, onSubmit, onCancel }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_phone: '',
        customer_address: '',
        description: '',
        assigned_to: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const status = formData.assigned_to ? 'in_progress' : 'unassigned';
        const assigned_at = formData.assigned_to ? new Date().toISOString() : null;

        try {
            await onSubmit({
                ...formData,
                status,
                assigned_at,
                created_by: user.id,
                assigned_to: formData.assigned_to || null
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-6 md:p-7 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center tracking-tight">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center mr-3 border border-indigo-100/50 shadow-sm">
                            <PenLine size={16} className="text-indigo-600" />
                        </div>
                        Create New Task
                    </h2>
                    <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 md:p-7 space-y-6">
                    <div className="space-y-5">
                        <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-100 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 flex items-center">
                                    Client Name
                                </label>
                                <input
                                    required
                                    name="customer_name"
                                    value={formData.customer_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none shadow-sm placeholder:text-slate-400"
                                    placeholder="e.g. John Doe"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 flex items-center">
                                        Phone Number
                                    </label>
                                    <input
                                        required
                                        name="customer_phone"
                                        value={formData.customer_phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none shadow-sm placeholder:text-slate-400"
                                        placeholder="+91 9876543210"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 flex items-center">
                                        Assign Staff
                                    </label>
                                    <select
                                        name="assigned_to"
                                        value={formData.assigned_to}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none shadow-sm cursor-pointer"
                                    >
                                        <option value="">Unassigned</option>
                                        {staffMembers.map(staff => (
                                            <option key={staff.id} value={staff.id}>{staff.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-5 pt-2">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 flex items-center">
                                    Address
                                </label>
                                <textarea
                                    required
                                    name="customer_address"
                                    value={formData.customer_address}
                                    onChange={handleChange}
                                    rows="2"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-none shadow-sm placeholder:text-slate-400"
                                    placeholder="House No, Street, City"
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 flex items-center">
                                    Description
                                </label>
                                <textarea
                                    required
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-none shadow-sm placeholder:text-slate-400"
                                    placeholder="Describe the issue or task fully..."
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 flex justify-end gap-3 border-t border-slate-100 mt-8 pt-6">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200 shadow-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 border border-transparent rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                            {loading ? 'Creating...' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewTaskForm;
