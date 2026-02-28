import React, { useState } from 'react';
import { X, Calendar, User, Phone, MapPin, ClipboardList, CheckCircle2, History } from 'lucide-react';
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
            // If assigning to a staff member, status becomes "in_progress"
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
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
                    <div className="flex items-center space-x-3">
                        <h2 className="text-xl font-black text-indigo-900 tracking-tight">Task #{task.task_number}</h2>
                        <StatusBadge status={task.status} />
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Task Info Section */}
                    <section className="space-y-4">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center">
                            <User size={14} className="mr-2" />
                            Client Info
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <div>
                                <p className="text-xs font-bold text-indigo-900/50 mb-1">Client Name</p>
                                <p className="text-base font-bold text-gray-900">{task.customer_name}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-indigo-900/50 mb-1">Phone Number</p>
                                <a href={`tel:${task.customer_phone}`} className="text-base font-bold text-indigo-600 flex items-center hover:underline">
                                    <Phone size={14} className="mr-2" />
                                    {task.customer_phone}
                                </a>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-xs font-bold text-indigo-900/50 mb-1">Location / Address</p>
                                <div className="flex items-start">
                                    <MapPin size={16} className="text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm font-medium text-gray-700 leading-relaxed">{task.customer_address}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Task Description */}
                    <section className="space-y-4">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center">
                            <ClipboardList size={14} className="mr-2" />
                            Task Description
                        </h3>
                        <div className="bg-indigo-50/30 p-4 rounded-2xl border border-indigo-100/50">
                            <p className="text-sm font-medium text-gray-800 leading-relaxed whitespace-pre-wrap">
                                {task.description}
                            </p>
                        </div>
                    </section>

                    {/* Timeline & Assignment */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center">
                                <History size={14} className="mr-2" />
                                Timeline
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center text-xs">
                                    <div className="w-2 h-2 rounded-full bg-indigo-900/20 mr-3"></div>
                                    <span className="text-gray-500 font-medium mr-2">Created:</span>
                                    <span className="text-gray-900 font-bold">{formatDate(task.created_at)}</span>
                                </div>
                                {task.assigned_at && (
                                    <div className="flex items-center text-xs">
                                        <div className="w-2 h-2 rounded-full bg-blue-500/20 mr-3"></div>
                                        <span className="text-gray-500 font-medium mr-2">Assigned:</span>
                                        <span className="text-gray-900 font-bold">{formatDate(task.assigned_at)}</span>
                                    </div>
                                )}
                                {task.completed_at && (
                                    <div className="flex items-center text-xs">
                                        <div className="w-2 h-2 rounded-full bg-green-500/20 mr-3"></div>
                                        <span className="text-gray-500 font-medium mr-2">Completed:</span>
                                        <span className="text-gray-900 font-bold">{formatDate(task.completed_at)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center">
                                <User size={14} className="mr-2" />
                                Assignment
                            </h3>
                            {isOwner ? (
                                <div className="relative">
                                    <select
                                        disabled={updating || task.status === 'completed'}
                                        value={task.assigned_to || ''}
                                        onChange={handleStatusChange}
                                        className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-700 shadow-sm focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none appearance-none disabled:opacity-50 transition-all"
                                    >
                                        <option value="">Unassigned</option>
                                        {staffMembers.map(staff => (
                                            <option key={staff.id} value={staff.id}>{staff.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-3.5 text-gray-400 pointer-events-none">
                                        <User size={16} />
                                    </div>
                                </div>
                            ) : (
                                <div className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-900 font-black">
                                        {task.assigned_user?.name?.[0] || '?'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{task.assigned_user?.name || 'Unassigned'}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Assigned Staff</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Remarks Section */}
                    <section className="space-y-4">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center">
                            <MessageSquare size={14} className="mr-2" />
                            Remarks & Updates
                        </h3>

                        <div className="space-y-4 mt-2">
                            {task.remarks && task.remarks.length > 0 ? (
                                task.remarks.map((remark, idx) => (
                                    <div key={idx} className="flex space-x-3 animate-in fade-in slide-in-from-left-2 duration-300">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400 flex-shrink-0">
                                            R
                                        </div>
                                        <div className="flex-1 bg-gray-50 p-3 rounded-2xl rounded-tl-none border border-gray-100">
                                            <p className="text-sm font-medium text-gray-700 leading-relaxed">{remark.remark_text}</p>
                                            <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tight">
                                                {formatDate(remark.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-400 italic">No remarks added yet.</p>
                            )}
                        </div>

                        {isAssignedToMe && task.status !== 'completed' && (
                            <RemarkForm onSubmit={(text) => onAddRemark(task.id, text)} />
                        )}
                    </section>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-100 bg-gray-50/50 sticky bottom-0 z-10">
                    <div className="flex space-x-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            Close
                        </button>
                        {isAssignedToMe && task.status === 'in_progress' && (
                            <button
                                onClick={handleMarkComplete}
                                disabled={updating}
                                className="flex-[2] px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-600/20 hover:-translate-y-0.5 flex items-center justify-center"
                            >
                                <CheckCircle2 size={18} className="mr-2" />
                                Mark as Completed
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskDetail;
