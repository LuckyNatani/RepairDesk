import React from 'react';
import TaskCard from './TaskCard';
import { Circle, PlayCircle, CheckCircle2 } from 'lucide-react';

const KanbanColumn = ({ title, status, tasks, onTaskClick, isOwner, staffMembers, onAssign }) => {
    const filteredTasks = tasks.filter(task => task.status === status);

    const columnStyles = {
        unassigned: {
            bg: 'bg-slate-50/40',
            border: 'border-slate-100',
            topAccent: 'border-t-slate-300',
            icon: <Circle size={11} className="text-slate-400" />,
            emptyText: 'No pending requests',
        },
        in_progress: {
            bg: 'bg-amber-50/20',
            border: 'border-amber-100/40',
            topAccent: 'border-t-amber-400',
            icon: <PlayCircle size={11} className="text-amber-500" />,
            emptyText: 'No active jobs',
        },
        completed: {
            bg: 'bg-emerald-50/20',
            border: 'border-emerald-100/40',
            topAccent: 'border-t-emerald-500',
            icon: <CheckCircle2 size={11} className="text-emerald-500" />,
            emptyText: 'No finished jobs',
        }
    };

    const style = columnStyles[status] || columnStyles.unassigned;

    return (
        <div className={`flex flex-col w-full min-w-[280px] h-full rounded-lg border-x border-b ${style.bg} ${style.border}`}>
            {/* Sticky Column Header — compact */}
            <div className={`sticky top-0 z-10 flex items-center justify-between px-2.5 py-2 border-t-2 ${style.topAccent} rounded-t-lg bg-white/95 backdrop-blur-sm border-b border-slate-100`}>
                <div className="flex items-center gap-1.5">
                    {style.icon}
                    <h2 className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
                        {title}
                    </h2>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                    {filteredTasks.length}
                </span>
            </div>

            {/* Card Container — tight spacing */}
            <div className="p-1.5 space-y-1.5 flex-1 overflow-y-auto no-scrollbar scroll-smooth">
                {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                        <div key={task.id} className="animate-fade-in">
                            <TaskCard
                                task={task}
                                onClick={onTaskClick}
                                isOwner={isOwner}
                                staffMembers={staffMembers}
                                onAssign={onAssign}
                            />
                        </div>
                    ))
                ) : (
                    <div className="py-8 flex flex-col items-center justify-center text-center opacity-40">
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight italic">{style.emptyText}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KanbanColumn;
