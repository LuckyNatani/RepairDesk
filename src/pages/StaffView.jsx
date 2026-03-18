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
        <div className="flex flex-col min-h-full gap-3">
            {/* Compact Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                        <span className="text-[9px] font-black text-primary-600 uppercase tracking-widest">Field Ops</span>
                    </div>
                    <h1 className="text-[15px] font-semibold text-slate-900 tracking-tight">
                        Hi, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Technician'}
                    </h1>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                        <span className="text-slate-700 font-semibold">{activeCount}</span> active · <span className="text-slate-700 font-semibold">{completedCount}</span> done
                    </p>
                </div>

                {/* Mini progress */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[20px] font-black text-slate-900 leading-none">{statsProgress}%</span>
                    <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary-500 rounded-full transition-all duration-700"
                            style={{ width: `${statsProgress}%` }}
                        />
                    </div>
                    <span className="text-[9px] text-slate-400 uppercase tracking-wide">Done</span>
                </div>
            </div>

            {/* Search bar */}
            <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300" size={13} />
                <input
                    type="text"
                    placeholder="Find tickets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-100 rounded-lg text-[12px] font-medium text-slate-900 focus:outline-none focus:border-primary-400 shadow-sm placeholder:text-slate-300 transition-all"
                />
            </div>

            {/* Tab Segments — compact pill */}
            <div className="flex p-1 bg-slate-100/70 rounded-lg overflow-hidden gap-1">
                {[
                    { id: 'my-tasks', label: 'Active', icon: CircleDashed },
                    { id: 'completed', label: 'Done', icon: CheckCircle2 },
                    { id: 'all', label: 'All', icon: ListTodo }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-semibold transition-all duration-200 ${filter === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <tab.icon size={12} className={filter === tab.id ? 'text-primary-500' : 'text-slate-300'} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Task List */}
            {loading && tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-300">
                    <Loader2 size={24} className="animate-spin mb-3" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Syncing...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
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
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                                <Search size={20} className="text-slate-300" />
                            </div>
                            <h3 className="text-[13px] font-semibold text-slate-700">Quiet day?</h3>
                            <p className="mt-1 text-[11px] text-slate-400 max-w-xs mx-auto">
                                No tasks match this filter.
                            </p>
                            {filter === 'my-tasks' && (
                                <button
                                    onClick={() => setFilter('all')}
                                    className="mt-4 px-4 py-1.5 bg-slate-900 hover:bg-black text-white text-[11px] font-semibold rounded-lg transition-all tap-highlight"
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
