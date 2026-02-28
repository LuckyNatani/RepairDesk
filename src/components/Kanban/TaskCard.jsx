import React from 'react';
import StatusBadge from '../shared/StatusBadge';
import { Clock, User } from 'lucide-react';
import { Draggable } from '@hello-pangea/dnd';

const TaskCard = ({ task, index, onClick, isOwner = false, staffMembers = [], onAssign }) => {
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
        <Draggable draggableId={task.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={() => onClick(task)}
                    className={`bg-white p-4 rounded-xl border ${snapshot.isDragging ? 'shadow-xl border-indigo-400 scale-[1.02] rotate-1 z-50' : 'border-slate-200 shadow-sm hover:border-indigo-300'} transition-all cursor-pointer group flex flex-col gap-3`}
                >
                    <div className="flex justify-between items-start">
                        <StatusBadge status={task.status} />
                        <span className="text-xs font-medium text-slate-400 group-hover:text-slate-600 transition-colors">
                            #{task.task_number}
                        </span>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">
                            {task.customer_name}
                        </h3>
                        {task.customer_address && (
                            <p className="mt-1 text-xs text-slate-500 truncate">
                                {task.customer_address}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-auto border-t border-slate-100">
                        <div className="flex items-center space-x-1" onClick={(e) => isOwner && e.stopPropagation()}>
                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                                {task.assigned_to ? (
                                    <span className="text-[10px] font-bold text-slate-600">
                                        {(task.assigned_user?.name || 'A')[0].toUpperCase()}
                                    </span>
                                ) : (
                                    <User size={10} className="text-slate-400" />
                                )}
                            </div>

                            {isOwner && task.status !== 'completed' ? (
                                <select
                                    className="text-xs font-medium text-slate-600 bg-transparent border-none appearance-none outline-none cursor-pointer hover:text-indigo-600 focus:ring-0 max-w-[80px] xs:max-w-[100px] truncate ml-1"
                                    value={task.assigned_to || ''}
                                    onChange={handleAssign}
                                >
                                    <option value="">Unassigned</option>
                                    {staffMembers.map(staff => (
                                        <option key={staff.id} value={staff.id}>{staff.name}</option>
                                    ))}
                                </select>
                            ) : (
                                <span className="text-xs font-medium text-slate-600 truncate max-w-[100px] ml-1">
                                    {task.assigned_user?.name || 'Unassigned'}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                            <Clock size={10} className="mr-1" />
                            {formatTimeAgo(task.created_at)}
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    );
};

export default TaskCard;
