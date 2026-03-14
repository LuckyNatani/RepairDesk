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
        assigned_to: '',
        priority: 'medium',
        category: 'repair',
        due_date: ''
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
            const finalData = {
                ...formData,
                status,
                assigned_at,
                created_by: user.id,
                assigned_to: formData.assigned_to || null
            };
            if (!finalData.due_date) delete finalData.due_date; // Remove empty string

            await onSubmit(finalData);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
            <div className="bg-white w-full max-w-xl rounded-t-[32px] sm:rounded-3xl shadow-2xl animate-in fade-in slide-in-from-bottom-8 sm:zoom-in duration-300 relative pb-safe max-h-[95vh] flex flex-col">
                {/* Mobile Drag Handle Hint */}
                <div className="w-full flex justify-center pt-3 pb-2 sm:hidden absolute top-0 left-0 right-0 z-10 bg-white rounded-t-[32px]">
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
                </div>

                <div className="flex items-center justify-between p-6 md:p-7 border-b border-slate-100 pt-10 sm:pt-6 shrink-0 bg-white sm:rounded-t-3xl rounded-t-[32px]">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center tracking-tight">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center mr-3 border border-indigo-100/50 shadow-sm">
                            <PenLine size={16} className="text-indigo-600" />
                        </div>
                        Create New Task
                    </h2>
                    <button onClick={onCancel} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors shrink-0">
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 p-6 md:p-7 no-scrollbar pb-32">
                    <form onSubmit={handleSubmit} className="space-y-6">
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 flex items-center">
                                            Priority
                                        </label>
                                        <select
                                            name="priority"
                                            value={formData.priority}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none shadow-sm cursor-pointer"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="critical">Critical</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 flex items-center">
                                            Category
                                        </label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none shadow-sm cursor-pointer"
                                        >
                                            <option value="repair">Repair</option>
                                            <option value="installation">Installation</option>
                                            <option value="maintenance">Maintenance</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 flex items-center">
                                        Due Date (SLA)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="due_date"
                                        value={formData.due_date}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none shadow-sm placeholder:text-slate-400"
                                    />
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

                        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-slate-100 pb-safe sm:static sm:bg-transparent sm:border-t sm:border-slate-100 sm:mt-8 sm:pt-6 sm:p-0 flex justify-end gap-3 z-20">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="hidden sm:block px-6 py-3 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200 shadow-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full sm:w-auto px-6 py-3.5 text-sm font-bold text-white bg-indigo-600 border border-transparent rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-all disabled:opacity-50 focus:outline-none shadow-md"
                            >
                                {loading ? 'Creating...' : 'Create Task'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default NewTaskForm;
