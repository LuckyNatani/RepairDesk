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
        <div className="flex flex-col gap-2.5">
            {/* Compact Search & Filter Bar */}
            <div className="flex items-center gap-1.5 px-0.5">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300" size={13} />
                    <input
                        type="text"
                        placeholder="Search tickets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-100 rounded-lg text-[12px] font-medium text-slate-900 focus:outline-none focus:border-primary-400 transition-all shadow-sm placeholder:text-slate-300"
                    />
                </div>
                <button className="p-1.5 bg-white border border-slate-100 rounded-lg text-slate-400 hover:text-slate-700 shadow-sm transition-all tap-highlight shrink-0">
                    <SlidersHorizontal size={14} />
                </button>
            </div>

            {/* Board — swipeable on mobile, grid on desktop */}
            <div className="flex lg:grid lg:grid-cols-3 gap-2 overflow-x-auto pb-2 snap-x no-scrollbar lg:overflow-visible">
                <div className="min-w-[82vw] sm:min-w-[300px] lg:min-w-0 snap-center">
                    <KanbanColumn
                        title="Open"
                        status="unassigned"
                        tasks={filteredTasks}
                        onTaskClick={onTaskClick}
                        isOwner={isOwner}
                        staffMembers={staffMembers}
                        onAssign={onAssign}
                    />
                </div>
                <div className="min-w-[82vw] sm:min-w-[300px] lg:min-w-0 snap-center">
                    <KanbanColumn
                        title="In Progress"
                        status="in_progress"
                        tasks={filteredTasks}
                        onTaskClick={onTaskClick}
                        isOwner={isOwner}
                        staffMembers={staffMembers}
                        onAssign={onAssign}
                    />
                </div>
                <div className="min-w-[82vw] sm:min-w-[300px] lg:min-w-0 snap-center">
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
