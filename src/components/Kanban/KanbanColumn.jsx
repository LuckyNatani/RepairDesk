import React from 'react';
import TaskCard from './TaskCard';

const KanbanColumn = ({ title, status, tasks, onTaskClick, isOwner, staffMembers, onAssign }) => {
    const filteredTasks = tasks.filter(task => task.status === status);

    return (
        <div className="flex flex-col w-full min-h-[400px] bg-slate-50/50 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    {title}
                    <span className="px-2 py-0.5 bg-slate-200/50 text-slate-600 rounded-md text-[10px] font-bold">
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
                    <div className="h-24 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 font-medium">
                        No tasks
                    </div>
                )}
            </div>
        </div>
    );
};

export default KanbanColumn;
