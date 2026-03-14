import React, { useState } from 'react';
import KanbanColumn from './KanbanColumn';
import { Search } from 'lucide-react';

const KanbanBoard = ({ tasks, onTaskClick, isOwner, staffMembers, onAssign }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTasks = tasks.filter(task => {
        if (!searchQuery) return true;
        const lowerQuery = searchQuery.toLowerCase();
        return (
            task.customer_name?.toLowerCase().includes(lowerQuery) ||
            task.customer_phone?.toLowerCase().includes(lowerQuery) ||
            task.task_number?.toString().includes(lowerQuery) ||
            task.description?.toLowerCase().includes(lowerQuery)
        );
    });

    return (
        <div className="flex flex-col gap-6 mt-6">
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder="Search tasks by name, phone, or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <KanbanColumn
                title="Unassigned"
                status="unassigned"
                tasks={filteredTasks}
                onTaskClick={onTaskClick}
                isOwner={isOwner}
                staffMembers={staffMembers}
                onAssign={onAssign}
            />
            <KanbanColumn
                title="In Progress"
                status="in_progress"
                tasks={filteredTasks}
                onTaskClick={onTaskClick}
                isOwner={isOwner}
                staffMembers={staffMembers}
                onAssign={onAssign}
            />
            <KanbanColumn
                title="Completed"
                status="completed"
                tasks={filteredTasks}
                onTaskClick={onTaskClick}
                isOwner={isOwner}
                staffMembers={staffMembers}
                onAssign={onAssign}
            />
            </div>
        </div>
    );
};

export default KanbanBoard;
