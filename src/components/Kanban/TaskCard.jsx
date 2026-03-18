import React from 'react';
import StatusBadge from '../shared/StatusBadge';
import { Clock, User, MapPin, Wrench } from 'lucide-react';

const TaskCard = ({ task, onClick, isOwner = false, staffMembers = [], onAssign }) => {
    const formatTimeAgo = (dateString) => {
        if (!dateString) return '';
        const minutes = Math.floor((new Date() - new Date(dateString)) / 60000);
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        return `${Math.floor(hours / 24)}d`;
    };

    const priorityStyles = {
        critical: 'bg-red-50 text-red-500',
        high: 'bg-amber-50 text-amber-500',
    };

    const statusBarColor = {
        unassigned: 'bg-slate-300',
        in_progress: 'bg-amber-400',
        completed: 'bg-emerald-500',
    };

    return (
        <div
            onClick={() => onClick(task)}
            className="native-card cursor-pointer group relative overflow-hidden hover:border-slate-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all"
        >
            {/* Status accent bar — left edge */}
            <div className={`absolute top-0 left-0 w-[3px] h-full ${statusBarColor[task.status] ?? 'bg-slate-200'}`} />

            <div className="pl-3 pr-2.5 py-2 flex flex-col gap-1.5">
                {/* Row 1: Task number + name + chevron */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[10px] font-medium text-slate-400 shrink-0">#{task.task_number}</span>
                        <span className="text-[13px] font-semibold text-slate-900 truncate leading-tight group-hover:text-primary-600 transition-colors">
                            {task.customer_name}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                        {task.priority && task.priority !== 'medium' && (
                            <span className={`text-[9px] font-bold px-1 py-0.5 rounded uppercase tracking-wide ${priorityStyles[task.priority] ?? ''}`}>
                                {task.priority}
                            </span>
                        )}
                        <StatusBadge status={task.status} />
                    </div>
                </div>

                {/* Row 2: Meta info in single horizontal line */}
                <div className="flex items-center gap-x-2.5 text-[11px] text-slate-400 min-w-0">
                    {task.category && (
                        <div className="flex items-center gap-1 shrink-0">
                            <Wrench size={9} className="text-slate-300" />
                            <span className="capitalize">{task.category}</span>
                        </div>
                    )}
                    {task.customer_address && (
                        <div className="flex items-center gap-1 truncate">
                            <MapPin size={9} className="text-primary-400 shrink-0" />
                            <span className="truncate">{task.customer_address.split(',')[0]}</span>
                        </div>
                    )}
                    {task.description && (
                        <span className="truncate text-slate-400 italic hidden sm:inline">
                            {task.description}
                        </span>
                    )}
                </div>

                {/* Divider */}
                <div className="h-px bg-slate-100 -mx-2.5" />

                {/* Row 3: Assignee + time */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                            {task.assigned_to ? (
                                <span className="text-[9px] font-bold text-primary-600">
                                    {(task.assigned_user?.name || 'A')[0].toUpperCase()}
                                </span>
                            ) : (
                                <User size={9} className="text-slate-300" />
                            )}
                        </div>
                        <span className="text-[11px] text-slate-500 truncate max-w-[90px]">
                            {task.assigned_user?.name || 'Unassigned'}
                        </span>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Clock size={9} />
                        <span>{formatTimeAgo(task.created_at)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskCard;
