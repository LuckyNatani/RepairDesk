import React, { useState } from 'react';
import { X, User, Phone, MapPin, ClipboardList, CheckCircle2, History, MessageSquare } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';
import RemarkForm from './RemarkForm';

const TaskDetail = ({ task, userRole, currentUserId, staffMembers, onUpdateStatus, onAddRemark, onClose }) => {
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
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white sticky top-0 z-10">
                    <div className="flex items-center space-x-3">
                        <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Task #{task.task_number}</h2>
                        <StatusBadge status={task.status} />
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-8">
                    {/* Task Info Section */}
                    <section className="space-y-3">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center">
                            <User size={14} className="mr-2" />
                            Client Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <div>
                                <p className="text-xs font-medium text-slate-500 mb-0.5">Contact</p>
                                <p className="text-sm font-semibold text-slate-900">{task.customer_name}</p>
                                <a href={`tel:${task.customer_phone}`} className="text-sm text-indigo-600 hover:underline flex items-center mt-1">
                                    <Phone size={12} className="mr-1.5" />
                                    {task.customer_phone}
                                </a>
                            </div>
                            <div className="md:col-span-1">
                                <p className="text-xs font-medium text-slate-500 mb-0.5">Address</p>
                                <div className="flex items-start">
                                    <MapPin size={14} className="text-slate-400 mr-1.5 mt-0.5 shrink-0" />
                                    <p className="text-sm text-slate-700 leading-relaxed">{task.customer_address}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Task Description */}
                    <section className="space-y-3">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center">
                            <ClipboardList size={14} className="mr-2" />
                            Description
                        </h3>
                        <div className="bg-white p-4 rounded-lg border border-slate-200">
                            <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                                {task.description}
                            </p>
                        </div>
                    </section>

                    {/* Timeline & Assignment */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center">
                                <History size={14} className="mr-2" />
                                Timeline
                            </h3>
                            <div className="space-y-2.5 bg-white border border-slate-200 rounded-lg p-4">
                                <div className="flex items-center text-xs justify-between pb-2 border-b border-slate-100">
                                    <span className="text-slate-500 font-medium">Created</span>
                                    <span className="text-slate-900 font-medium">{formatDate(task.created_at)}</span>
                                </div>
                                {task.assigned_at && (
                                    <div className="flex items-center text-xs justify-between pb-2 border-b border-slate-100">
                                        <span className="text-slate-500 font-medium">Assigned</span>
                                        <span className="text-slate-900 font-medium">{formatDate(task.assigned_at)}</span>
                                    </div>
                                )}
                                {task.completed_at && (
                                    <div className="flex items-center text-xs justify-between">
                                        <span className="text-slate-500 font-medium">Completed</span>
                                        <span className="text-emerald-700 font-medium">{formatDate(task.completed_at)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center">
                                <User size={14} className="mr-2" />
                                Assignment
                            </h3>
                            {isOwner ? (
                                <div className="relative">
                                    <select
                                        disabled={updating || task.status === 'completed'}
                                        value={task.assigned_to || ''}
                                        onChange={handleStatusChange}
                                        className="w-full pl-3 pr-10 py-3 bg-white border border-slate-200 rounded-lg font-medium text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none disabled:opacity-60 transition-all disabled:bg-slate-50"
                                    >
                                        <option value="">Unassigned</option>
                                        {staffMembers.map(staff => (
                                            <option key={staff.id} value={staff.id}>{staff.name}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center text-slate-600 font-semibold text-sm">
                                        {task.assigned_user?.name?.[0] || '?'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{task.assigned_user?.name || 'Unassigned'}</p>
                                        <p className="text-[10px] font-medium text-slate-500 uppercase tracking-tight">Assigned Staff</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Remarks Section */}
                    <section className="space-y-4">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center">
                            <MessageSquare size={14} className="mr-2" />
                            Activity & Remarks
                        </h3>

                        <div className="space-y-3 mt-2">
                            {task.remarks && task.remarks.length > 0 ? (
                                task.remarks.map((remark, idx) => (
                                    <div key={idx} className="flex space-x-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-semibold text-slate-500 shrink-0">
                                            {remark.user?.name?.[0] || 'R'}
                                        </div>
                                        <div className="flex-1 bg-white border border-slate-200 p-3 rounded-lg rounded-tl-sm shadow-sm">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-xs font-semibold text-slate-900">{remark.user?.name || 'Staff Member'}</span>
                                                <span className="text-[10px] font-medium text-slate-400">
                                                    {formatDate(remark.created_at)}
                                                </span>
                                            </div>
                                            <p className="text-sm tracking-tight text-slate-700 leading-relaxed">{remark.remark_text}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-6 text-center border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                                    <p className="text-sm text-slate-500">No activity recorded yet.</p>
                                </div>
                            )}
                        </div>

                        {isAssignedToMe && task.status !== 'completed' && (
                            <div className="mt-4">
                                <RemarkForm onSubmit={(text) => onAddRemark(task.id, text)} />
                            </div>
                        )}
                    </section>
                </div>

                {/* Footer Actions */}
                <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 sticky bottom-0 z-10">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium text-sm rounded-lg hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                    >
                        Close
                    </button>
                    {isAssignedToMe && task.status === 'in_progress' && (
                        <button
                            onClick={handleMarkComplete}
                            disabled={updating}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg transition-colors flex items-center justify-center disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 shadow-sm"
                        >
                            <CheckCircle2 size={16} className="mr-1.5" />
                            Mark Complete
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskDetail;
