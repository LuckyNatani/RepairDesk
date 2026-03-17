import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { X, User, Phone, MapPin, ClipboardList, PenLine, ChevronRight, Calendar, AlertCircle } from 'lucide-react';

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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-end md:items-center justify-center p-0 md:p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-xl rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl animate-in slide-in-from-bottom duration-300 overflow-hidden flex flex-col max-h-[95vh]">
                
                {/* Visual Grabber for mobile handle look */}
                <div className="md:hidden flex justify-center pt-3 pb-1 shrink-0">
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-7 py-6 md:py-8 border-b border-slate-50 sticky top-0 bg-white/80 backdrop-blur-md z-20 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[1.2rem] bg-primary-100 flex items-center justify-center border border-primary-200 shadow-sm transition-transform hover:scale-105">
                            <PenLine size={24} className="text-primary-700" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">New Ticket</h2>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Create Repair Entry</p>
                        </div>
                    </div>
                    <button onClick={onCancel} className="p-3 hover:bg-slate-50 rounded-[1.2rem] text-slate-400 hover:text-slate-900 transition-all tap-highlight outline-none">
                        <X size={22} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-7 py-8 no-scrollbar custom-scrollbar">
                    <form onSubmit={handleSubmit} className="space-y-10 pb-20 md:pb-0">
                        
                        {/* Client Identity Section */}
                        <div className="space-y-5">
                            <div className="flex items-center gap-2 px-1">
                                <User size={14} className="text-primary-500" />
                                <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Customer Identity</h3>
                            </div>
                            
                            <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                    <input
                                        required
                                        name="customer_name"
                                        value={formData.customer_name}
                                        onChange={handleChange}
                                        className="w-full text-[15px] font-bold text-slate-900 bg-white border border-slate-200 rounded-[1.5rem] px-5 py-4 focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none shadow-sm placeholder:text-slate-300"
                                        placeholder="e.g. Rahul Sharma"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Number</label>
                                    <div className="flex items-center bg-white border border-slate-200 rounded-[1.5rem] px-5 py-4 focus-within:ring-4 focus-within:ring-primary-100 transition-all shadow-sm">
                                        <Phone size={16} className="text-slate-300 mr-3" />
                                        <input
                                            required
                                            name="customer_phone"
                                            value={formData.customer_phone}
                                            onChange={handleChange}
                                            className="w-full text-[15px] font-bold text-slate-900 bg-transparent outline-none placeholder:text-slate-300"
                                            placeholder="98765 XXXXX"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Service Configuration Section */}
                        <div className="space-y-5">
                            <div className="flex items-center gap-2 px-1">
                                <ClipboardList size={14} className="text-primary-500" />
                                <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Service Config</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                                    <div className="relative group">
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50/50 border border-slate-200 rounded-[1.5rem] px-5 py-4 font-black text-sm text-slate-800 transition-all hover:border-primary-300 focus:ring-4 focus:ring-primary-100 outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="repair">Repair</option>
                                            <option value="installation">Installation</option>
                                            <option value="maintenance">Maintenance</option>
                                            <option value="other">Other</option>
                                        </select>
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <ChevronRight size={18} className="rotate-90" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority</label>
                                    <div className="relative group">
                                        <select
                                            name="priority"
                                            value={formData.priority}
                                            onChange={handleChange}
                                            className={`w-full border rounded-[1.5rem] px-5 py-4 font-black text-sm transition-all hover:ring-4 outline-none appearance-none cursor-pointer ${
                                                formData.priority === 'critical' ? 'bg-red-50/50 border-red-100 text-red-700 hover:ring-red-100' :
                                                formData.priority === 'high' ? 'bg-amber-50/50 border-amber-100 text-amber-700 hover:ring-amber-100' :
                                                'bg-slate-50/50 border-slate-200 text-slate-800 hover:ring-primary-100'
                                            }`}
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="critical">Critical</option>
                                        </select>
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <ChevronRight size={18} className="rotate-90" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign Technician</label>
                                    <div className="relative group">
                                        <select
                                            name="assigned_to"
                                            value={formData.assigned_to}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50/50 border border-slate-200 rounded-[1.5rem] px-5 py-4 font-black text-sm text-slate-800 transition-all hover:border-primary-300 focus:ring-4 focus:ring-primary-100 outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="">Awaiting Assignment</option>
                                            {staffMembers.map(staff => (
                                                <option key={staff.id} value={staff.id}>{staff.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <ChevronRight size={18} className="rotate-90" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Est. Completion / SLA</label>
                                    <div className="flex items-center bg-slate-50/50 border border-slate-200 rounded-[1.5rem] px-5 py-4 focus-within:ring-4 focus-within:ring-primary-100 transition-all">
                                        <Calendar size={16} className="text-slate-300 mr-3" />
                                        <input
                                            type="datetime-local"
                                            name="due_date"
                                            value={formData.due_date}
                                            onChange={handleChange}
                                            className="w-full text-sm font-black text-slate-800 bg-transparent outline-none cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Location & Problem Detail */}
                        <div className="space-y-5">
                            <div className="flex items-center gap-2 px-1">
                                <AlertCircle size={14} className="text-primary-500" />
                                <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Job Details</h3>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Site Address</label>
                                    <div className="flex items-start bg-slate-50/50 border border-slate-200 rounded-[1.5rem] px-5 py-4 focus-within:ring-4 focus-within:ring-primary-100 transition-all">
                                        <MapPin size={18} className="text-slate-300 mr-3 mt-0.5" />
                                        <textarea
                                            required
                                            name="customer_address"
                                            value={formData.customer_address}
                                            onChange={handleChange}
                                            rows="2"
                                            className="w-full text-[14px] font-bold text-slate-900 bg-transparent outline-none resize-none placeholder:text-slate-300"
                                            placeholder="Where is the repair needed?"
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description / Notes</label>
                                    <div className="bg-primary-50/20 border border-primary-100/30 rounded-[2.5rem] p-6 focus-within:ring-4 focus-within:ring-primary-100 transition-all">
                                        <textarea
                                            required
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows="4"
                                            className="w-full text-[15px] font-medium text-slate-700 bg-transparent outline-none resize-none placeholder:text-primary-300"
                                            placeholder="Be detailed about the issues reported..."
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Fixed Footer */}
                <div className="px-7 py-6 md:px-10 md:py-8 border-t border-slate-50 bg-white/95 backdrop-blur-md flex flex-col md:flex-row gap-4 shrink-0 pt-safe pb-safe pb-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="hidden md:block w-32 px-6 py-4 bg-slate-50 text-slate-600 font-black text-[14px] rounded-2xl hover:bg-slate-100 transition-all tap-highlight"
                    >
                        Discard
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 px-6 py-4 bg-primary-600 text-white font-black text-[15px] rounded-2xl shadow-xl shadow-primary-200 hover:bg-primary-700 hover:-translate-y-1 active:translate-y-0 transition-all tap-highlight flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Syncing Task...
                            </>
                        ) : (
                            <>Create Active Ticket</>
                        )}
                    </button>
                    {/* Mobile Only Cancel */}
                    <button
                        type="button"
                        onClick={onCancel}
                        className="md:hidden w-full px-6 py-4 text-slate-400 font-bold text-[14px] transition-all tap-highlight"
                    >
                        Discard Entry
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewTaskForm;
