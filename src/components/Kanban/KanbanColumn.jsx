import React from 'react';
import TaskCard from './TaskCard';
import { Circle, PlayCircle, CheckCircle2, MoreHorizontal } from 'lucide-react';

const KanbanColumn = ({ title, status, tasks, onTaskClick, isOwner, staffMembers, onAssign }) => {
    const filteredTasks = tasks.filter(task => task.status === status);

    const columnStyles = {
        unassigned: {
            bg: 'bg-slate-50/50',
            border: 'border-slate-100',
            headerBg: 'bg-white',
            badgeBg: 'bg-slate-900',
            badgeText: 'text-white',
            icon: <Circle size={14} className="text-slate-400" />,
            emptyText: 'No pending requests',
            accent: 'bg-slate-200'
        },
        in_progress: {
            bg: 'bg-primary-50/20',
            border: 'border-primary-50/50',
            headerBg: 'bg-white',
            badgeBg: 'bg-primary-600',
            badgeText: 'text-white',
            icon: <PlayCircle size={14} className="text-primary-500" />,
            emptyText: 'Clean slate, let\'s work!',
            accent: 'bg-primary-400'
        },
        completed: {
            bg: 'bg-emerald-50/20',
            border: 'border-emerald-50/50',
            headerBg: 'bg-white',
            badgeBg: 'bg-emerald-600',
            badgeText: 'text-white',
            icon: <CheckCircle2 size={14} className="text-emerald-500" />,
            emptyText: 'Nothing archived yet',
            accent: 'bg-emerald-400'
        }
    };

    const style = columnStyles[status] || columnStyles.unassigned;

    return (
        <div className={`flex flex-col w-full h-full rounded-[2.5rem] p-5 border transition-all ${style.bg} ${style.border}`}>
            {/* Column Header */}
            <div className="flex items-center justify-between mb-8 px-2">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        {style.icon}
                        <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${style.accent} animate-pulse`} />
                    </div>
                    <h2 className="text-[14px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                        {title}
                        <span className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-lg text-[10px] font-black ${style.badgeBg} ${style.badgeText} shadow-sm`}>
                            {filteredTasks.length}
                        </span>
                    </h2>
                </div>
                <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                    <MoreHorizontal size={18} />
                </button>
            </div>

            {/* Card Container */}
            <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar scroll-smooth pb-8 pr-1">
                {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                        <div key={task.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                    <div className="py-20 flex flex-col items-center justify-center text-center px-6">
                        <div className={`w-12 h-12 rounded-2xl border-2 border-dashed flex items-center justify-center mb-4 ${style.accent.replace('bg-', 'border-')} opacity-30`}>
                            {style.icon}
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{style.emptyText}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KanbanColumn;
