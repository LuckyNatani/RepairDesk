import React from 'react';
import StatusBadge from '../shared/StatusBadge';
import { Clock, User, MapPin, MessageSquare } from 'lucide-react';

const TaskCard = ({ task, onClick, isOwner = false, staffMembers = [], onAssign }) => {
    const latestRemark = task.remarks && task.remarks.length > 0
        ? [...task.remarks].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
        : null;

    const formatTimeAgo = (dateString) => {
        if (!dateString) return '';
        const minutes = Math.floor((new Date() - new Date(dateString)) / 60000);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    const handleAssign = (e) => {
        e.stopPropagation();
        if (onAssign) onAssign(task.id, e.target.value || null);
    };

    const getStatusBorder = (status) => {
        switch (status) {
            case 'unassigned': return 'border-l-slate-400';
            case 'in_progress': return 'border-l-amber-400';
            case 'completed': return 'border-l-emerald-500';
            default: return 'border-l-slate-200';
        }
    };

    return (
        <div
            onClick={() => onClick(task)}
            className={`bg-white p-3.5 rounded-xl border border-slate-200 border-l-4 ${getStatusBorder(task.status)} shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group flex flex-col gap-2.5 h-auto relative overflow-hidden`}
        >
            {/* Top Row: Status, Task Number & Time */}
            <div className="flex justify-between items-center mb-0.5">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-indigo-500 transition-colors px-1.5 py-0.5">
                        #{task.task_number}
                    </span>
                    <StatusBadge status={task.status} />
                </div>
            </div>

            {/* Core Details */}
            <div className="flex flex-col gap-1.5">
                <h3 className="text-sm font-bold text-slate-900 leading-tight truncate">
                    {task.customer_name}
                </h3>
                {task.customer_address && (
                    <div className="flex items-start gap-1">
                        <MapPin size={12} className="shrink-0 mt-0.5 text-slate-400" />
                        <p className="text-[11px] font-medium text-slate-500 leading-snug truncate">
                            {task.customer_address}
                        </p>
                    </div>
                )}
                {task.description && (
                    <p className="mt-1 text-[11.5px] text-slate-600 bg-slate-50 border border-slate-100/50 p-2 rounded-lg leading-relaxed line-clamp-2">
                        {task.description}
                    </p>
                )}
                {latestRemark && (
                    <div className="mt-1 flex items-start gap-2 bg-indigo-50/50 border border-indigo-100/50 p-2 rounded-lg">
                        <MessageSquare size={12} className="shrink-0 mt-0.5 text-indigo-400" />
                        <p className="text-[11px] italic text-indigo-700 leading-relaxed line-clamp-2">
                            {latestRemark.remark_text}
                        </p>
                    </div>
                )}
            </div>

            {/* Bottom Row: Assignment & Time */}
            <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-slate-100">
                <div className="flex items-center space-x-2" onClick={(e) => isOwner && e.stopPropagation()}>
                    <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-200">
                        {task.assigned_to ? (
                            <span className="text-[9px] font-bold text-indigo-700">
                                {(task.assigned_user?.name || 'A')[0].toUpperCase()}
                            </span>
                        ) : (
                            <User size={10} className="text-slate-400" />
                        )}
                    </div>

                    {isOwner && task.status !== 'completed' ? (
                        task.assigned_to ? (
                            <select
                                className="text-[11px] font-semibold text-slate-700 bg-transparent border-none appearance-none outline-none cursor-pointer hover:text-indigo-600 focus:ring-0 max-w-[90px] truncate p-0"
                                value={task.assigned_to || ''}
                                onChange={handleAssign}
                            >
                                <option value="">Unassigned</option>
                                {staffMembers.map(staff => (
                                    <option key={staff.id} value={staff.id}>{staff.name}</option>
                                ))}
                            </select>
                        ) : (
                            <div className="relative">
                                <select
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    value=""
                                    onChange={handleAssign}
                                >
                                    <option value="" disabled>Assign To...</option>
                                    {staffMembers.map(staff => (
                                        <option key={staff.id} value={staff.id}>{staff.name}</option>
                                    ))}
                                </select>
                                <div className="px-2 py-0.5 text-[9px] font-bold tracking-wider text-white bg-slate-800 rounded flex items-center shadow-sm hover:bg-indigo-600 transition-colors cursor-pointer">
                                    Assign
                                </div>
                            </div>
                        )
                    ) : (
                        <span className="text-[11px] font-semibold text-slate-600 truncate max-w-[90px]">
                            {task.assigned_user?.name || 'Unassigned'}
                        </span>
                    )}
                </div>

                <div className="flex items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest shrink-0">
                    <Clock size={10} className="mr-1 opacity-70" />
                    {formatTimeAgo(task.created_at)}
                </div>
            </div>
        </div>
    );
};

export default TaskCard;
