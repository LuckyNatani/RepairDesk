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

        // Status depends on whether a staff member is assigned
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
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-indigo-900 flex items-center">
                        <UserPlus size={20} className="mr-2" />
                        Create New Task
                    </h2>
                    <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center">
                                <ClipboardList size={14} className="mr-1 text-gray-400" />
                                Customer Name*
                            </label>
                            <input
                                required
                                name="customer_name"
                                value={formData.customer_name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all outline-none"
                                placeholder="e.g. Rahul Sharma"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center">
                                    <Phone size={14} className="mr-1 text-gray-400" />
                                    Phone Number*
                                </label>
                                <input
                                    required
                                    name="customer_phone"
                                    value={formData.customer_phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all outline-none"
                                    placeholder="9876543210"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center">
                                    <UserPlus size={14} className="mr-1 text-gray-400" />
                                    Assign Staff
                                </label>
                                <select
                                    name="assigned_to"
                                    value={formData.assigned_to}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all outline-none appearance-none"
                                >
                                    <option value="">Leave Unassigned</option>
                                    {staffMembers.map(staff => (
                                        <option key={staff.id} value={staff.id}>{staff.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center">
                                <MapPin size={14} className="mr-1 text-gray-400" />
                                Service Address*
                            </label>
                            <textarea
                                required
                                name="customer_address"
                                value={formData.customer_address}
                                onChange={handleChange}
                                rows="2"
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all outline-none"
                                placeholder="House No, Street, Landmark, Pincode"
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center">
                                <ClipboardList size={14} className="mr-1 text-gray-400" />
                                Task Description*
                            </label>
                            <textarea
                                required
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all outline-none"
                                placeholder="Mention issue: PC not turning on, Blue screen..."
                            ></textarea>
                        </div>
                    </div>

                    <div className="pt-4 flex space-x-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-3 px-4 py-3 bg-indigo-900 hover:bg-indigo-800 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
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
