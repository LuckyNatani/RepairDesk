import React, { useState } from 'react';
import TaskCard from '../components/Kanban/TaskCard';
import TaskDetail from '../components/Tasks/TaskDetail';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../hooks/useAuth';
import { Search, Loader2, ListTodo, CheckCircle2, CircleDashed } from 'lucide-react';

const StaffView = () => {
    const { user } = useAuth();
    const { tasks, loading, updateTaskStatus, addRemark } = useTasks();
    const [filter, setFilter] = useState('my-tasks');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const selectedTask = tasks.find(t => t.id === selectedTaskId);

    const filteredTasks = tasks.filter(task => {
        let matchesTab = true;
        if (filter === 'my-tasks') matchesTab = task.assigned_to === user.id && task.status !== 'completed';
        if (filter === 'completed') matchesTab = task.assigned_to === user.id && task.status === 'completed';
        if (!matchesTab) return false;
        if (!searchQuery) return true;
        const lowerQuery = searchQuery.toLowerCase();
        return (
            task.customer_name?.toLowerCase().includes(lowerQuery) ||
            task.customer_phone?.toLowerCase().includes(lowerQuery) ||
            task.task_number?.toString().includes(lowerQuery) ||
            task.description?.toLowerCase().includes(lowerQuery)
        );
    });

    const myTasks = tasks.filter(task => task.assigned_to === user.id);
    const activeCount = myTasks.filter(t => t.status !== 'completed').length;
    const completedCount = myTasks.filter(t => t.status === 'completed').length;
    const statsProgress = myTasks.length > 0
        ? Math.round((completedCount / myTasks.length) * 100)
        : 0;

    const handleUpdateStatus = async (taskId, status, assignedTo) => {
        try { await updateTaskStatus(taskId, status, assignedTo); }
        catch (err) { alert('Failed to update: ' + err.message); }
    };

    const handleAddRemark = async (taskId, remarkText) => {
        try { await addRemark(taskId, user.id, remarkText); }
        catch (err) { alert('Failed to add remark: ' + err.message); }
    };

    return (
        <div className="flex flex-col min-h-full gap-5 pb-20">
            {/* Compact Header */}
            <div className="flex items-center justify-between p-5 bg-primary rounded-2xl text-on-primary shadow-lg shadow-primary/20">
                <div>
                    <div className="flex items-center gap-1.5 mb-1.5 opacity-80">
                        <div className="w-1.5 h-1.5 rounded-full bg-on-primary animate-pulse" />
                        <span className="font-label text-[9px] font-black uppercase tracking-widest">Field Ops</span>
                    </div>
                    <h1 className="font-headline text-lg font-bold tracking-tight mb-1">
                        Hi, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Technician'}
                    </h1>
                    <p className="text-sm opacity-90 font-medium">
                        {activeCount} active · {completedCount} done
                    </p>
                </div>

                {/* Mini progress */}
                <div className="flex flex-col items-end gap-1.5 shrink-0 bg-white/10 p-3 rounded-xl backdrop-blur-md">
                    <span className="font-headline text-[22px] font-black leading-none">{statsProgress}%</span>
                    <div className="w-20 h-1.5 bg-black/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white rounded-full transition-all duration-700"
                            style={{ width: `${statsProgress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Search bar */}
            <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/70" size={16} />
                <input
                    type="text"
                    placeholder="Find tickets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-full font-body text-sm font-medium text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-[0_4px_24px_rgba(25,28,30,0.02)] transition-all placeholder:text-on-surface-variant/50"
                />
            </div>

            {/* Tab Segments — compact pill */}
            <div className="flex p-1 bg-surface-container-high/50 rounded-xl overflow-hidden gap-1">
                {[
                    { id: 'my-tasks', label: 'Active', icon: CircleDashed },
                    { id: 'completed', label: 'Done', icon: CheckCircle2 },
                    { id: 'all', label: 'All', icon: ListTodo }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${filter === tab.id ? 'bg-surface-container-lowest text-on-surface shadow-[0_4px_12px_rgba(0,0,0,0.05)]' : 'text-on-surface-variant hover:text-on-surface'}`}
                    >
                        <tab.icon size={14} className={filter === tab.id ? 'text-primary' : 'text-outline'} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Task List */}
            {loading && tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
                    <Loader2 size={24} className="animate-spin mb-3 text-primary" />
                    <p className="font-label text-[10px] font-bold uppercase tracking-widest">Syncing...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredTasks.length > 0 ? (
                        filteredTasks.map(task => (
                            <div key={task.id} className="animate-fade-in">
                                <TaskCard
                                    task={task}
                                    onClick={() => setSelectedTaskId(task.id)}
                                />
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-16 flex flex-col items-center justify-center text-center">
                            <div className="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center mb-4">
                                <Search size={22} className="text-outline" />
                            </div>
                            <h3 className="font-headline text-[15px] font-bold text-on-surface">Quiet day?</h3>
                            <p className="mt-1 text-sm text-on-surface-variant max-w-xs mx-auto">
                                No tasks match this filter.
                            </p>
                            {filter === 'my-tasks' && (
                                <button
                                    onClick={() => setFilter('all')}
                                    className="mt-6 px-5 py-2 bg-on-surface hover:bg-black text-surface bg-slate-900 border border-transparent rounded-full font-bold text-xs transition-all active:scale-95"
                                >
                                    Browse all jobs
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Detail Overlay */}
            {selectedTask && (
                <TaskDetail
                    task={selectedTask}
                    userRole="staff"
                    currentUserId={user.id}
                    onUpdateStatus={handleUpdateStatus}
                    onAddRemark={handleAddRemark}
                    onClose={() => setSelectedTaskId(null)}
                />
            )}
        </div>
    );
};

export default StaffView;
