import React from 'react';
import StatusBadge from '../shared/StatusBadge';
import { Calendar, User, Hash } from 'lucide-react';
import { Draggable } from '@hello-pangea/dnd';

const TaskCard = ({ task, index, onClick, isOwner = false, staffMembers = [], onAssign }) => {
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleAssign = (e) => {
        e.stopPropagation(); // prevent card click
        if (onAssign) {
            onAssign(task.id, e.target.value || null);
        }
    };

    return (
        <Draggable draggableId={task.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={() => onClick(task)}
                    className={`bg-white p-4 rounded-xl shadow-sm border ${snapshot.isDragging ? 'shadow-lg border-indigo-300 scale-[1.02] z-50' : 'border-gray-100'} hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer group flex flex-col`}
                >
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-2 text-indigo-900 font-bold text-sm">
                            <Hash size={14} className="text-gray-400" />
                            <span>{task.task_number}</span>
                        </div>
                        <StatusBadge status={task.status} />
                    </div>

                    <h3 className="text-gray-900 font-bold mb-1 group-hover:text-indigo-900 transition-colors">
                        {task.customer_name}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">
                        {task.description}
                    </p>

                    <div className="pt-3 border-t border-gray-50 flex items-center justify-between text-[11px] font-medium text-gray-400">
                        <div className="flex items-center space-x-1">
                            <Calendar size={12} />
                            <span>{formatDate(task.created_at)}</span>
                        </div>
                        <div className="flex items-center space-x-1" onClick={(e) => isOwner && e.stopPropagation()}>
                            <User size={12} />
                            {isOwner && task.status !== 'completed' ? (
                                <select
                                    className="bg-transparent border-none appearance-none outline-none cursor-pointer hover:text-indigo-600 focus:ring-0 max-w-[100px] truncate"
                                    value={task.assigned_to || ''}
                                    onChange={handleAssign}
                                >
                                    <option value="">Unassigned</option>
                                    {staffMembers.map(staff => (
                                        <option key={staff.id} value={staff.id}>{staff.name}</option>
                                    ))}
                                </select>
                            ) : (
                                <span className="max-w-[100px] truncate">{task.assigned_user?.name || 'Unassigned'}</span>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    );
};

export default TaskCard;
