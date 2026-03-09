import React from 'react';
import TaskCard from './TaskCard';

const KanbanColumn = ({ title, status, tasks, onTaskClick, isOwner, staffMembers, onAssign }) => {
    const filteredTasks = tasks.filter(task => task.status === status);

    const columnStyles = {
        unassigned: {
            bg: 'bg-slate-50',
            border: 'border-slate-200',
            headerBg: 'bg-white',
            badgeBg: 'bg-slate-200/50',
            badgeText: 'text-slate-600',
            icon: 'text-slate-400',
            emptyBorder: 'border-slate-300'
        },
        in_progress: {
            bg: 'bg-indigo-50/30',
            border: 'border-indigo-100',
            headerBg: 'bg-white',
            badgeBg: 'bg-indigo-100',
            badgeText: 'text-indigo-700',
            icon: 'text-indigo-400',
            emptyBorder: 'border-indigo-200'
        },
        completed: {
            bg: 'bg-emerald-50/30',
            border: 'border-emerald-100',
            headerBg: 'bg-white',
            badgeBg: 'bg-emerald-100',
            badgeText: 'text-emerald-700',
            icon: 'text-emerald-400',
            emptyBorder: 'border-emerald-200'
        }
    };

    const style = columnStyles[status] || columnStyles.unassigned;

    return (
        <div className={`flex flex-col w-full min-h-[400px] rounded-xl p-4 border transition-colors ${style.bg} ${style.border}`}>
            <div className={`flex items-center justify-between mb-4 px-3 py-2 rounded-lg border shadow-sm ${style.headerBg} ${style.border}`}>
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    {title}
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${style.badgeBg} ${style.badgeText}`}>
                        {filteredTasks.length}
                    </span>
                </h2>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-220px)] no-scrollbar pb-4">
                {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onClick={onTaskClick}
                            isOwner={isOwner}
                            staffMembers={staffMembers}
                            onAssign={onAssign}
                        />
                    ))
                ) : (
                    <div className={`h-24 border border-dashed rounded-xl flex items-center justify-center text-xs font-medium ${style.emptyBorder} ${style.icon}`}>
                        No tasks
                    </div>
                )}
            </div>
        </div>
    );
};

export default KanbanColumn;
