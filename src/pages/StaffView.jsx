import React, { useState } from 'react';
import TaskCard from '../components/Kanban/TaskCard';
import TaskDetail from '../components/Tasks/TaskDetail';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../hooks/useAuth';
import { Search, Loader2, ListTodo, CheckCircle2, CircleDashed, Filter } from 'lucide-react';

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

    const activeCount = tasks.filter(task => task.assigned_to === user.id && task.status !== 'completed').length;
    const statsProgress = tasks.filter(task => task.assigned_to === user.id).length > 0
        ? Math.round((tasks.filter(task => task.assigned_to === user.id && task.status === 'completed').length / tasks.filter(task => task.assigned_to === user.id).length) * 100)
        : 0;

    const handleUpdateStatus = async (taskId, status, assignedTo) => {
        try {
            await updateTaskStatus(taskId, status, assignedTo);
        } catch (err) {
            alert('Failed to update: ' + err.message);
        }
    };

    const handleAddRemark = async (taskId, remarkText) => {
        try {
            await addRemark(taskId, user.id, remarkText);
        } catch (err) {
            alert('Failed to add remark: ' + err.message);
        }
    };

    return (
        <div className="flex flex-col min-h-full">
            {/* Native Header */}
            <div className="px-6 pt-8 pb-6 border-b border-slate-100 bg-white sticky top-0 z-20">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 px-3 py-1 bg-primary-50 rounded-full border border-primary-100/50">
                        <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                        <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest leading-none">Field Ops</span>
                    </div>
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-1">
                    Hi, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Technician'}
                </h1>
                <p className="text-sm font-medium text-slate-400">
                    You have <span className="text-slate-900">{activeCount} assignments</span> for today.
                </p>

                {/* Progress Mini Bar */}
                <div className="mt-6 flex items-center gap-4">
                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-primary-500 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(92,124,250,0.3)]"
                            style={{ width: `${statsProgress}%` }}
                        />
                    </div>
                    <span className="text-xs font-black text-slate-900">{statsProgress}%</span>
                </div>
            </div>

            <div className="px-6 py-8">
                {/* Search & Filter */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input
                            type="text"
                            placeholder="Find tickets..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-slate-100/50 border-none rounded-[1.5rem] text-[15px] font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all placeholder:text-slate-300"
                        />
                    </div>
                    <button className="p-4 bg-white border border-slate-100 rounded-[1.2rem] text-slate-400 hover:text-slate-900 shadow-sm transition-all tap-highlight shrink-0">
                        <Filter size={20} />
                    </button>
                </div>

                {/* Segments (Tabs) */}
                <div className="flex p-1.5 bg-slate-100/80 rounded-[1.5rem] mb-10 overflow-hidden">
                    {[
                        { id: 'my-tasks', label: 'Active', icon: CircleDashed, color: 'text-primary-500' },
                        { id: 'completed', label: 'Done', icon: CheckCircle2, color: 'text-emerald-500' },
                        { id: 'all', label: 'All', icon: ListTodo, color: 'text-slate-500' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-2 rounded-[1.2rem] text-[13px] font-black transition-all duration-300 ${filter === tab.id ? 'bg-white text-slate-900 shadow-md transform scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <tab.icon size={16} className={filter === tab.id ? tab.color : 'text-slate-300'} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Task Grid */}
                {loading && tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-300 text-center">
                        <Loader2 size={32} className="animate-spin mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest italic">Syncing queue...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map(task => (
                                <div key={task.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <TaskCard
                                        task={task}
                                        onClick={() => setSelectedTaskId(task.id)}
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-24 flex flex-col items-center justify-center text-center">
                                <div className="w-20 h-20 rounded-[2rem] bg-slate-100 flex items-center justify-center mb-6 relative">
                                    <Search size={32} className="text-slate-300" />
                                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center shadow-sm">
                                        <div className="w-2 h-2 rounded-full bg-slate-200" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-black text-slate-900">Quiet day?</h3>
                                <p className="mt-2 text-sm font-medium text-slate-400 max-w-xs mx-auto italic">
                                    No tasks found matching this view. Relax or pick something from the main board!
                                </p>
                                {filter === 'my-tasks' && (
                                    <button
                                        onClick={() => setFilter('all')}
                                        className="mt-8 px-10 py-4 bg-slate-900 hover:bg-black text-white text-[13px] font-black rounded-2xl shadow-xl transition-all tap-highlight"
                                    >
                                        BROWSE ALL JOBS
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

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
