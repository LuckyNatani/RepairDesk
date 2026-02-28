import React, { useState } from 'react';
import { X, User, Phone, MapPin, ClipboardList, CheckCircle2, History, MessageSquare, Trash2 } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';
import RemarkForm from './RemarkForm';

const TaskDetail = ({ task, userRole, currentUserId, staffMembers, onUpdateStatus, onAddRemark, onDelete, onClose }) => {
    const [updating, setUpdating] = useState(false);

    const formatDate = (dateString) => {
        if (!dateString) return 'Not available';
        return new Date(dateString).toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isAssignedToMe = task.assigned_to === currentUserId;
    const isOwner = userRole === 'owner';

    const handleStatusChange = async (e) => {
        const newStaffId = e.target.value;
        setUpdating(true);
        try {
            const newStatus = newStaffId ? 'in_progress' : 'unassigned';
            await onUpdateStatus(task.id, newStatus, newStaffId || null);
        } finally {
            setUpdating(false);
        }
    };

    const handleMarkComplete = async () => {
        setUpdating(true);
        try {
            await onUpdateStatus(task.id, 'completed');
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-5 md:px-6 border-b border-slate-100 bg-white sticky top-0 z-10">
                    <div className="flex items-center space-x-3">
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                            Ticket <span className="text-indigo-600">#{task.task_number}</span>
                        </h2>
                        <StatusBadge status={task.status} />
                    </div>
                    <div className="flex items-center">
                        {isOwner && onDelete && (
                            <button
                                onClick={() => {
                                    if (window.confirm('Are you certain you want to permanently delete this task? This action cannot be undone.')) {
                                        onDelete(task.id);
                                    }
                                }}
                                className="p-1.5 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-md transition-colors mr-1 cursor-pointer"
                                title="Delete Task permanently"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                        <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-8 bg-slate-50/30">
                    {/* Task Info Section */}
                    <section className="space-y-3">
                        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                            <User size={14} className="mr-2" />
                            Client Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <div>
                                <p className="text-xs font-semibold text-slate-400 mb-1">Contact</p>
                                <p className="text-[15px] font-bold text-slate-900">{task.customer_name}</p>
                                <a href={`tel:${task.customer_phone}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center mt-1.5 w-fit bg-indigo-50 px-2 py-0.5 rounded-md transition-colors">
                                    <Phone size={12} className="mr-1.5" />
                                    {task.customer_phone}
                                </a>
                            </div>
                            <div className="md:col-span-1">
                                <p className="text-xs font-semibold text-slate-400 mb-1">Address</p>
                                <div className="flex items-start">
                                    <MapPin size={14} className="text-slate-400 mr-1.5 mt-0.5 shrink-0" />
                                    <p className="text-sm font-medium text-slate-700 leading-relaxed">{task.customer_address}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Task Description */}
                    <section className="space-y-3">
                        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                            <ClipboardList size={14} className="mr-2" />
                            Description
                        </h3>
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <p className="text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">
                                {task.description}
                            </p>
                        </div>
                    </section>

                    {/* Timeline & Assignment */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                                <History size={14} className="mr-2" />
                                Timeline
                            </h3>
                            <div className="space-y-3 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                                <div className="flex items-center text-xs justify-between pb-3 border-b border-slate-100/80">
                                    <span className="text-slate-500 font-semibold">Created</span>
                                    <span className="text-slate-900 font-semibold">{formatDate(task.created_at)}</span>
                                </div>
                                {task.assigned_at && (
                                    <div className="flex items-center text-xs justify-between pb-3 border-b border-slate-100/80">
                                        <span className="text-slate-500 font-semibold">Assigned</span>
                                        <span className="text-slate-900 font-semibold">{formatDate(task.assigned_at)}</span>
                                    </div>
                                )}
                                {task.completed_at && (
                                    <div className="flex items-center text-xs justify-between">
                                        <span className="text-slate-500 font-semibold">Completed</span>
                                        <span className="text-emerald-600 font-bold">{formatDate(task.completed_at)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                                <User size={14} className="mr-2" />
                                Assignment
                            </h3>
                            {isOwner ? (
                                <div className="relative shadow-sm rounded-xl">
                                    <select
                                        disabled={updating || task.status === 'completed'}
                                        value={task.assigned_to || ''}
                                        onChange={handleStatusChange}
                                        className="w-full pl-4 pr-10 py-3.5 bg-white border border-slate-200 rounded-xl font-semibold text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none disabled:opacity-60 transition-all disabled:bg-slate-50 cursor-pointer"
                                    >
                                        <option value="">Unassigned</option>
                                        {staffMembers.map(staff => (
                                            <option key={staff.id} value={staff.id}>{staff.name}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center space-x-3 shadow-sm">
                                    <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                                        {task.assigned_user?.name?.[0] || '?'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{task.assigned_user?.name || 'Unassigned'}</p>
                                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight mt-0.5">Assigned Staff</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Remarks Section */}
                    <section className="space-y-4 pt-2">
                        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                            <MessageSquare size={14} className="mr-2" />
                            Activity & Remarks
                        </h3>

                        <div className="space-y-3 mt-2">
                            {task.remarks && task.remarks.length > 0 ? (
                                task.remarks.map((remark, idx) => (
                                    <div key={idx} className="flex space-x-3 mb-4">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                                            {remark.user?.name?.[0] || 'R'}
                                        </div>
                                        <div className="flex-1 bg-white border border-slate-200 p-3.5 rounded-xl rounded-tl-sm shadow-sm relative">
                                            <div className="flex justify-between items-start mb-1.5">
                                                <span className="text-xs font-bold text-indigo-900">{remark.user?.name || 'Staff Member'}</span>
                                                <span className="text-[10px] font-bold text-slate-400">
                                                    {formatDate(remark.created_at)}
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium text-slate-700 leading-relaxed">{remark.remark_text}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl bg-white shadow-sm">
                                    <p className="text-sm font-medium text-slate-400">No activity recorded yet.</p>
                                </div>
                            )}
                        </div>

                        {isAssignedToMe && task.status !== 'completed' && (
                            <div className="mt-6">
                                <RemarkForm onSubmit={(text) => onAddRemark(task.id, text)} />
                            </div>
                        )}
                    </section>
                </div>

                {/* Footer Actions */}
                <div className="p-4 md:px-6 border-t border-slate-100 bg-white flex justify-end gap-3 sticky bottom-0 z-10">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200 shadow-sm"
                    >
                        Close
                    </button>
                    {isAssignedToMe && task.status === 'in_progress' && (
                        <button
                            onClick={handleMarkComplete}
                            disabled={updating}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                            <CheckCircle2 size={18} className="mr-2" />
                            Mark Complete
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskDetail;
