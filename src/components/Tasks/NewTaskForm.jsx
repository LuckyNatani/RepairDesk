import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { X, UserPlus, Phone, MapPin, ClipboardList } from 'lucide-react';

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
            <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                        <UserPlus size={18} className="mr-2 text-indigo-600" />
                        Create New Task
                    </h2>
                    <button onClick={onCancel} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-5">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center">
                                <ClipboardList size={14} className="mr-1.5 text-slate-400" />
                                Client Name
                            </label>
                            <input
                                required
                                name="customer_name"
                                value={formData.customer_name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                placeholder="e.g. John Doe"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center">
                                    <Phone size={14} className="mr-1.5 text-slate-400" />
                                    Phone Number
                                </label>
                                <input
                                    required
                                    name="customer_phone"
                                    value={formData.customer_phone}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                    placeholder="9876543210"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center">
                                    <UserPlus size={14} className="mr-1.5 text-slate-400" />
                                    Assign Staff
                                </label>
                                <select
                                    name="assigned_to"
                                    value={formData.assigned_to}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                >
                                    <option value="">Unassigned</option>
                                    {staffMembers.map(staff => (
                                        <option key={staff.id} value={staff.id}>{staff.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center">
                                <MapPin size={14} className="mr-1.5 text-slate-400" />
                                Address
                            </label>
                            <textarea
                                required
                                name="customer_address"
                                value={formData.customer_address}
                                onChange={handleChange}
                                rows="2"
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-none"
                                placeholder="House No, Street, City"
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center">
                                <ClipboardList size={14} className="mr-1.5 text-slate-400" />
                                Description
                            </label>
                            <textarea
                                required
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-none"
                                placeholder="Describe the task..."
                            ></textarea>
                        </div>
                    </div>

                    <div className="pt-2 flex justify-end gap-3 border-t border-slate-100 mt-6 pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
