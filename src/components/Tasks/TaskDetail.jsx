import React, { useState } from 'react';
import { X, User, Phone, MapPin, ClipboardList, CheckCircle2, History, MessageSquare, Trash2, Pencil, Save, BookOpen, Clock, Calendar, ChevronRight } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';
import RemarkForm from './RemarkForm';
import CustomerHistoryModal from '../Customers/CustomerHistoryModal';

const TaskDetail = ({ task, userRole, currentUserId, staffMembers, onUpdateStatus, onAddRemark, onEdit, onDelete, onClose }) => {
    const [updating, setUpdating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        customer_name: task.customer_name || '',
        customer_phone: task.customer_phone || '',
        customer_address: task.customer_address || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        category: task.category || 'repair',
        due_date: task.due_date ? new Date(task.due_date).toISOString().slice(0,16) : ''
    });

    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

    const formatDate = (dateString, compact = false) => {
        if (!dateString) return 'Not available';
        const date = new Date(dateString);
        if (compact) {
            return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ', ' + 
                   date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
        }
        return date.toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const isAssignedToMe = task.assigned_to === currentUserId;
    const isOwner = userRole === 'owner';

    const handleAssignStaff = async (e) => {
        const newStaffId = e.target.value;
        setUpdating(true);
        try {
            const newStatus = newStaffId ? 'in_progress' : 'unassigned';
            await onUpdateStatus(task.id, newStatus, newStaffId || null);
        } finally {
            setUpdating(false);
        }
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveEdit = async () => {
        setUpdating(true);
        try {
            await onEdit(task.id, editForm);
            setIsEditing(false);
        } catch (err) {
            alert('Failed to update task: ' + err.message);
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-end md:items-center justify-center p-0 md:p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-2xl rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl animate-in slide-in-from-bottom duration-300 overflow-hidden flex flex-col max-h-[92vh]">
                
                {/* Visual Grabber for mobile handle look */}
                <div className="md:hidden flex justify-center pt-3 pb-1">
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 md:py-6 border-b border-slate-50 sticky top-0 bg-white/80 backdrop-blur-md z-20">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                                Ticket <span className="text-primary-600">#{task.task_number}</span>
                            </h2>
                            {!isEditing && <StatusBadge status={task.status} />}
                        </div>
                        <div className="flex gap-2">
                             {task.priority && task.priority !== 'medium' && (
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tight ${
                                    task.priority === 'critical' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                                }`}>
                                    {task.priority} Priority
                                </span>
                            )}
                            {task.category && (
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                    • {task.category}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isOwner && onEdit && !isEditing && task.status !== 'completed' && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-2.5 hover:bg-slate-50 text-slate-400 hover:text-primary-600 rounded-2xl transition-all tap-highlight"
                                title="Edit Task"
                            >
                                <Pencil size={20} />
                            </button>
                        )}
                        <button onClick={onClose} className="p-2.5 hover:bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 transition-all tap-highlight">
                            <X size={22} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-8 space-y-10 custom-scrollbar">
                    {/* Client Information */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                                <User size={14} className="mr-2 text-primary-500" />
                                Client Information
                            </h3>
                            {!isEditing && isOwner && (
                                <button
                                    onClick={() => setIsHistoryModalOpen(true)}
                                    className="text-[11px] font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 rounded-full transition-all tap-highlight"
                                >
                                    <BookOpen size={13} />
                                    View History
                                </button>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                            <div className="space-y-3">
                                {isEditing ? (
                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Name</label>
                                            <input
                                                name="customer_name"
                                                value={editForm.customer_name}
                                                onChange={handleEditChange}
                                                className="w-full text-base font-bold text-slate-900 bg-white border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone</label>
                                            <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-primary-500 transition-all">
                                                <Phone size={14} className="mr-3 text-slate-400" />
                                                <input
                                                    name="customer_phone"
                                                    value={editForm.customer_phone}
                                                    onChange={handleEditChange}
                                                    className="w-full text-base font-bold text-slate-900 bg-transparent outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-lg font-black text-slate-900 tracking-tight">{task.customer_name}</p>
                                        <a href={`tel:${task.customer_phone}`} className="inline-flex items-center px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-2xl text-[14px] font-bold transition-all hover:bg-emerald-100 tap-highlight shadow-sm border border-emerald-100">
                                            <Phone size={14} className="mr-2" />
                                            {task.customer_phone}
                                        </a>
                                    </>
                                )}
                            </div>
                            
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Address</p>
                                {isEditing ? (
                                    <textarea
                                        name="customer_address"
                                        value={editForm.customer_address}
                                        onChange={handleEditChange}
                                        className="w-full text-[14px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-primary-500 transition-all outline-none resize-none"
                                        rows="3"
                                    />
                                ) : (
                                    <div className="flex items-start gap-2 group">
                                        <MapPin size={16} className="text-primary-500 shrink-0 mt-0.5" />
                                        <a 
                                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(task.customer_address || '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[14px] font-bold text-slate-700 leading-relaxed hover:text-primary-600 transition-colors"
                                        >
                                            {task.customer_address}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Task Details */}
                    <section className="space-y-4">
                        <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                            <ClipboardList size={14} className="mr-2 text-primary-500" />
                            Service Details
                        </h3>
                        
                        {isEditing ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Priority</label>
                                    <select
                                        name="priority"
                                        value={editForm.priority}
                                        onChange={handleEditChange}
                                        className="w-full text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:ring-2 focus:ring-primary-500 outline-none appearance-none"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Category</label>
                                    <select
                                        name="category"
                                        value={editForm.category}
                                        onChange={handleEditChange}
                                        className="w-full text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:ring-2 focus:ring-primary-500 outline-none appearance-none"
                                    >
                                        <option value="repair">Repair</option>
                                        <option value="installation">Installation</option>
                                        <option value="maintenance">Maintenance</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2 space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Due Date</label>
                                    <input
                                        type="datetime-local"
                                        name="due_date"
                                        value={editForm.due_date}
                                        onChange={handleEditChange}
                                        className="w-full text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Description</label>
                                    <textarea
                                        name="description"
                                        value={editForm.description}
                                        onChange={handleEditChange}
                                        placeholder="Detailed description of the problem..."
                                        className="w-full text-[14px] font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-[2rem] p-6 focus:ring-2 focus:ring-primary-500 outline-none min-h-[140px]"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="bg-primary-50/20 rounded-[2rem] border border-primary-100/30 p-8">
                                <p className="text-[15px] font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">
                                    {task.description || "No description provided."}
                                </p>
                            </div>
                        )}
                    </section>

                    {/* Timeline & Assignment Grid */}
                    {!isEditing && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <section className="space-y-4">
                                <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                                    <Clock size={14} className="mr-2 text-primary-500" />
                                    Timeline
                                </h3>
                                <div className="space-y-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:shadow-md">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[12px] font-bold text-slate-400">Created</span>
                                        <span className="text-[12px] font-black text-slate-900">{formatDate(task.created_at, true)}</span>
                                    </div>
                                    {task.due_date && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-[12px] font-bold text-slate-400">Due By</span>
                                            <span className={`text-[12px] font-black ${new Date(task.due_date) < new Date() && task.status !== 'completed' ? 'text-danger' : 'text-slate-900'}`}>
                                                {formatDate(task.due_date, true)}
                                            </span>
                                        </div>
                                    )}
                                    {task.completed_at && (
                                        <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                            <span className="text-[12px] font-bold text-success">Finished</span>
                                            <span className="text-[12px] font-black text-success">{formatDate(task.completed_at, true)}</span>
                                        </div>
                                    )}
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                                    <User size={14} className="mr-2 text-primary-500" />
                                    Assignment
                                </h3>
                                {isOwner ? (
                                    <div className="relative group">
                                        <select
                                            disabled={updating || task.status === 'completed'}
                                            value={task.assigned_to || ''}
                                            onChange={handleAssignStaff}
                                            className="w-full bg-white border border-slate-200 rounded-[1.5rem] px-5 py-4 font-black text-sm text-slate-800 transition-all hover:border-primary-300 focus:ring-4 focus:ring-primary-100 outline-none disabled:bg-slate-50 appearance-none cursor-pointer"
                                        >
                                            <option value="">Unassigned</option>
                                            {staffMembers.map(staff => (
                                                <option key={staff.id} value={staff.id}>{staff.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <ChevronRight size={18} className="rotate-90" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-5 bg-white border border-slate-200 rounded-[1.5rem] flex items-center gap-4 transition-all hover:border-primary-200">
                                        <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-700 font-black text-lg shadow-sm">
                                            {task.assigned_user?.name?.[0] || '?'}
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-tighter">Technician</p>
                                            <p className="text-[15px] font-black text-slate-900">{task.assigned_user?.name || 'Unassigned'}</p>
                                        </div>
                                    </div>
                                )}
                            </section>
                        </div>
                    )}

                    {/* Activity Feed */}
                    {!isEditing && (
                        <section className="space-y-6 pt-2">
                            <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                                <MessageSquare size={14} className="mr-2 text-primary-500" />
                                Activity Feed
                            </h3>

                            <div className="space-y-6 relative ml-4 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                                {task.remarks && task.remarks.length > 0 ? (
                                    task.remarks.map((remark, idx) => (
                                        <div key={idx} className="relative pl-8">
                                            {/* Timeline dot */}
                                            <div className="absolute left-[-5px] top-2 w-2.5 h-2.5 rounded-full bg-white border-2 border-primary-500 z-10 shadow-sm" />
                                            
                                            <div className="bg-slate-50 rounded-[1.5rem] p-5 border border-slate-100/50 transition-all hover:bg-white hover:shadow-sm">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-[13px] font-black text-slate-900">{remark.user?.name || 'Staff Member'}</span>
                                                    <span className="text-[10px] font-bold text-slate-400">
                                                        {formatDate(remark.created_at, true)}
                                                    </span>
                                                </div>
                                                <p className="text-[14px] font-medium text-slate-700 leading-relaxed italic pr-2">
                                                    "{remark.remark_text}"
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200 ml-4">
                                        <p className="text-[14px] font-bold text-slate-400">No activity yet. Every step matters!</p>
                                    </div>
                                )}
                            </div>

                            {isAssignedToMe && task.status !== 'completed' && (
                                <div className="mt-8 ml-4">
                                    <RemarkForm onSubmit={(text) => onAddRemark(task.id, text)} />
                                </div>
                            )}
                        </section>
                    )}
                </div>

                {/* Footer Fixed Actions */}
                <div className="px-6 py-6 md:px-8 border-t border-slate-50 bg-white/95 backdrop-blur-md flex flex-col md:flex-row gap-3 pt-safe pb-safe pb-4">
                    {isEditing ? (
                        <>
                            <button
                                onClick={() => setIsEditing(false)}
                                disabled={updating}
                                className="flex-1 px-6 py-4 bg-slate-50 text-slate-600 font-black text-[14px] rounded-2xl hover:bg-slate-100 transition-all tap-highlight outline-none"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                disabled={updating}
                                className="flex-[2] px-6 py-4 bg-primary-600 text-white font-black text-[14px] rounded-2xl shadow-lg shadow-primary-200 hover:bg-primary-700 hover:-translate-y-0.5 transition-all tap-highlight flex items-center justify-center gap-2"
                            >
                                {updating ? 'Syncing...' : <><Save size={18} /> Save Changes</>}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={onClose}
                                className="md:w-32 px-6 py-4 bg-slate-50 text-slate-600 font-black text-[14px] rounded-2xl hover:bg-slate-100 transition-all tap-highlight"
                            >
                                Back
                            </button>
                            {isAssignedToMe && task.status === 'in_progress' && (
                                <button
                                    onClick={() => onUpdateStatus(task.id, 'completed')}
                                    disabled={updating}
                                    className="flex-1 px-6 py-4 bg-emerald-600 text-white font-black text-[14px] rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:-translate-y-0.5 transition-all tap-highlight flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 size={18} />
                                    Job Completed
                                </button>
                            )}
                            {isOwner && task.status === 'unassigned' && (
                                <div className="flex-1 flex items-center justify-center text-[13px] font-bold text-slate-400 animate-pulse">
                                    <Clock size={16} className="mr-2" />
                                    Awaiting Technician Assignment
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            
            <CustomerHistoryModal
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                customerPhone={task.customer_phone}
                customerName={task.customer_name}
            />
        </div>
    );
};

export default TaskDetail;
