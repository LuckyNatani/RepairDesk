import React, { useState } from 'react';
import KanbanColumn from './KanbanColumn';
import { Search, SlidersHorizontal } from 'lucide-react';

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
        <div className="flex flex-col gap-8">
            {/* Search & Filter Bar */}
            <div className="flex items-center gap-4 px-1">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input
                        type="text"
                        placeholder="Search tickets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] text-[15px] font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all shadow-sm placeholder:text-slate-300"
                    />
                </div>
                <button className="p-4 bg-white border border-slate-100 rounded-[1.2rem] text-slate-400 hover:text-slate-900 shadow-sm transition-all tap-highlight shrink-0">
                    <SlidersHorizontal size={20} />
                </button>
            </div>

            {/* Board Layout */}
            <div className="flex flex-col lg:flex-row gap-6 overflow-x-auto pb-8 snap-x no-scrollbar lg:grid lg:grid-cols-3">
                <div className="min-w-[85vw] md:min-w-[400px] lg:min-w-0 snap-center px-1">
                    <KanbanColumn
                        title="Open Tickets"
                        status="unassigned"
                        tasks={filteredTasks}
                        onTaskClick={onTaskClick}
                        isOwner={isOwner}
                        staffMembers={staffMembers}
                        onAssign={onAssign}
                    />
                </div>
                <div className="min-w-[85vw] md:min-w-[400px] lg:min-w-0 snap-center px-1">
                    <KanbanColumn
                        title="Work in Progress"
                        status="in_progress"
                        tasks={filteredTasks}
                        onTaskClick={onTaskClick}
                        isOwner={isOwner}
                        staffMembers={staffMembers}
                        onAssign={onAssign}
                    />
                </div>
                <div className="min-w-[85vw] md:min-w-[400px] lg:min-w-0 snap-center px-1">
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
        </div>
    );
};

export default KanbanBoard;
