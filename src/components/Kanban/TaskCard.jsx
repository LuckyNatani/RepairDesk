import React from 'react';
import StatusBadge from '../shared/StatusBadge';
import { Clock, User, MapPin, MessageSquare, ChevronRight } from 'lucide-react';

const TaskCard = ({ task, onClick, isOwner = false, staffMembers = [], onAssign }) => {
    const latestRemark = task.remarks && task.remarks.length > 0
        ? [...task.remarks].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
        : null;

    const formatTimeAgo = (dateString) => {
        if (!dateString) return '';
        const minutes = Math.floor((new Date() - new Date(dateString)) / 60000);
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        return `${Math.floor(hours / 24)}d`;
    };

    const handleAssign = (e) => {
        e.stopPropagation();
        if (onAssign) onAssign(task.id, e.target.value || null);
    };

    return (
        <div
            onClick={() => onClick(task)}
            className="native-card p-4 hover-lift active:scale-[0.98] cursor-pointer group flex flex-col gap-3 relative overflow-hidden bg-white border-slate-100"
        >
            {/* Status Bar Indicator */}
            <div className={`absolute top-0 left-0 w-1 h-full ${
                task.status === 'unassigned' ? 'bg-slate-300' : 
                task.status === 'in_progress' ? 'bg-amber-400' : 
                'bg-emerald-500'
            }`} />

            {/* Top Row: Task # & Badges */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 tracking-tighter">
                        #{task.task_number}
                    </span>
                    <StatusBadge status={task.status} />
                </div>
                <div className="flex gap-1.5">
                    {task.priority && task.priority !== 'medium' && (
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tight ${
                            task.priority === 'critical' ? 'bg-red-50 text-red-600 border border-red-100' : 
                            'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                            {task.priority}
                        </span>
                    )}
                    {task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed' && (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tight bg-red-100 text-red-700 animate-pulse">
                            Overdue
                        </span>
                    )}
                </div>
            </div>

            {/* Core Info Section */}
            <div className="flex flex-col gap-1">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[15px] font-bold text-slate-900 leading-tight tracking-tight group-hover:text-primary-600 transition-colors">
                        {task.customer_name}
                    </h3>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-primary-400 transition-colors" />
                </div>
                
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                    {task.category && (
                        <div className="flex items-center gap-1">
                            <span className="text-[11px] font-semibold text-slate-500 capitalize">
                                {task.category}
                            </span>
                        </div>
                    )}
                    {task.customer_address && (
                        <div className="flex items-center gap-1 min-w-0 max-w-[180px]">
                            <MapPin size={11} className="shrink-0 text-primary-500" />
                            <span className="text-[11px] font-medium text-slate-500 truncate">
                                {task.customer_address.split(',')[0]}
                            </span>
                        </div>
                    )}
                </div>

                {task.description && (
                    <p className="mt-2 text-[12px] text-slate-600 leading-relaxed line-clamp-2 bg-slate-50/50 p-2 rounded-xl border border-slate-100/50">
                        {task.description}
                    </p>
                )}

                {latestRemark && (
                    <div className="mt-1 flex items-start gap-2 bg-primary-50/30 p-2.5 rounded-xl border border-primary-100/30">
                        <MessageSquare size={12} className="shrink-0 mt-0.5 text-primary-400" />
                        <p className="text-[11px] font-medium text-primary-700 leading-snug line-clamp-1 italic">
                            {latestRemark.remark_text}
                        </p>
                    </div>
                )}
            </div>

            {/* Bottom Row: User & Timing */}
            <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-50">
                <div className="flex items-center gap-2.5" onClick={(e) => isOwner && e.stopPropagation()}>
                    <div className="w-7 h-7 rounded-xl bg-primary-100 flex items-center justify-center shrink-0 border border-primary-50 shadow-sm">
                        {task.assigned_to ? (
                            <span className="text-[10px] font-bold text-primary-700">
                                {(task.assigned_user?.name || 'A')[0].toUpperCase()}
                            </span>
                        ) : (
                            <User size={12} className="text-primary-400" />
                        )}
                    </div>

                    {isOwner && task.status !== 'completed' ? (
                        <div className="relative group/select">
                            <select
                                className="text-[12px] font-bold text-slate-700 bg-transparent border-none appearance-none outline-none cursor-pointer hover:text-primary-600 focus:ring-0 pr-0"
                                value={task.assigned_to || ''}
                                onChange={handleAssign}
                            >
                                <option value="">Unassigned</option>
                                {staffMembers.map(staff => (
                                    <option key={staff.id} value={staff.id}>{staff.name}</option>
                                ))}
                            </select>
                            <div className="absolute -bottom-0.5 left-0 w-full h-[1px] bg-slate-200 group-hover/select:bg-primary-300 transition-colors" />
                        </div>
                    ) : (
                        <span className="text-[12px] font-bold text-slate-700 truncate max-w-[100px]">
                            {task.assigned_user?.name || 'Unassigned'}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-tight">
                    <Clock size={11} className="text-slate-300" />
                    {formatTimeAgo(task.created_at)}
                </div>
            </div>
        </div>
    );
};

export default TaskCard;
