import React from 'react';
import StatusBadge from '../shared/StatusBadge';
import { Clock, User, MapPin } from 'lucide-react';

const TaskCard = ({ task, onClick, isOwner = false, staffMembers = [], onAssign }) => {
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

    return (
        <div
            onClick={() => onClick(task)}
            className="bg-white p-4 lg:p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group flex flex-col gap-3 h-auto"
        >
            <div className="flex justify-between items-start">
                <StatusBadge status={task.status} />
                <span className="text-xs font-bold text-slate-400 group-hover:text-indigo-500 transition-colors bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                    #{task.task_number}
                </span>
            </div>

            <div className="flex flex-col gap-1.5">
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {task.customer_name}
                </h3>
                {task.customer_address && (
                    <p className="text-xs font-medium text-slate-500 flex items-start gap-1">
                        <MapPin size={12} className="shrink-0 mt-0.5 text-slate-400" />
                        <span className="leading-relaxed">{task.customer_address}</span>
                    </p>
                )}
                {task.description && (
                    <div className="mt-2 text-xs text-slate-600 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 leading-relaxed break-words whitespace-pre-wrap">
                        {task.description}
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100">
                <div className="flex items-center space-x-2" onClick={(e) => isOwner && e.stopPropagation()}>
                    <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-200 shadow-sm">
                        {task.assigned_to ? (
                            <span className="text-[10px] font-bold text-indigo-700">
                                {(task.assigned_user?.name || 'A')[0].toUpperCase()}
                            </span>
                        ) : (
                            <User size={12} className="text-slate-400" />
                        )}
                    </div>

                    {isOwner && task.status !== 'completed' ? (
                        task.assigned_to ? (
                            <select
                                className="text-xs font-semibold text-slate-700 bg-transparent border-none appearance-none outline-none cursor-pointer hover:text-indigo-600 focus:ring-0 max-w-[100px] truncate p-0"
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
                                <div className="px-2.5 py-1 text-[10px] font-bold tracking-wide text-white bg-indigo-600 rounded flex items-center shadow-sm hover:bg-indigo-700 transition-colors cursor-pointer ring-1 ring-inset ring-indigo-500/20">
                                    Quick Assign
                                </div>
                            </div>
                        )
                    ) : (
                        <span className="text-xs font-semibold text-slate-600 truncate max-w-[100px]">
                            {task.assigned_user?.name || 'Unassigned'}
                        </span>
                    )}
                </div>

                <div className="flex flex-col items-end justify-center">
                    <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <Clock size={10} className="mr-1 opacity-70" />
                        {formatTimeAgo(task.created_at)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskCard;
