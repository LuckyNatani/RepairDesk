import React, { useState } from 'react';
import TaskCard from '../components/Kanban/TaskCard';
import TaskDetail from '../components/Tasks/TaskDetail';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../hooks/useAuth';
import { Search, Loader2, ListTodo, MapPin, CheckCircle2, CircleDashed } from 'lucide-react';

const StaffView = () => {
    const { user } = useAuth();
    const { tasks, loading, updateTaskStatus, addRemark } = useTasks();
    const [filter, setFilter] = useState('my-tasks');
    const [selectedTask, setSelectedTask] = useState(null);

    const filteredTasks = tasks.filter(task => {
        if (filter === 'my-tasks') return task.assigned_to === user.id && task.status !== 'completed';
        if (filter === 'completed') return task.assigned_to === user.id && task.status === 'completed';
        return true; // for "all" tasks if needed
    });

    const activeCount = tasks.filter(task => task.assigned_to === user.id && task.status !== 'completed').length;
    const statsProgress = tasks.filter(task => task.assigned_to === user.id).length > 0
        ? Math.round((tasks.filter(task => task.assigned_to === user.id && task.status === 'completed').length / tasks.filter(task => task.assigned_to === user.id).length) * 100)
        : 0;

    const handleUpdateStatus = async (taskId, status, assignedTo) => {
        try {
            await updateTaskStatus(taskId, status, assignedTo);
            if (selectedTask?.id === taskId) {
                setSelectedTask(prev => ({ ...prev, status, assigned_to: assignedTo }));
            }
        } catch (err) {
            alert('Failed to update task: ' + err.message);
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
        <div className="min-h-screen bg-[#FAFAFC]">
            {/* Elegant Header with decorative gradient */}
            <div className="relative overflow-hidden bg-white border-b border-gray-100">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-400"></div>

                {/* Decorative background blobs */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
                <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

                <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100/50 text-indigo-700 text-xs font-semibold tracking-wide uppercase mb-4 shadow-sm">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                </span>
                                Field Operations
                            </div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                                Hello, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Staff'}
                            </h1>
                            <p className="mt-2 text-gray-500 font-medium max-w-lg">
                                You have <strong className="text-gray-900">{activeCount} active tasks</strong> in your queue today.
                            </p>
                        </div>

                        {/* Mini Stats Card */}
                        <div className="hidden sm:flex shrink-0 items-center justify-center p-4 bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] gap-6">
                            <div className="text-center">
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Completion</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${statsProgress}%` }}></div>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">{statsProgress}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Premium Tab Navigation */}
                <div className="flex p-1.5 bg-gray-100/80 backdrop-blur-md rounded-2xl mb-8 border border-gray-200/60 w-full sm:max-w-md mx-auto sm:mx-0 shadow-inner">
                    <button
                        onClick={() => setFilter('my-tasks')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${filter === 'my-tasks' ? 'bg-white text-indigo-900 shadow-[0_2px_10px_rgb(0,0,0,0.06)]' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'}`}
                    >
                        <CircleDashed size={16} className={filter === 'my-tasks' ? 'text-indigo-500' : 'text-gray-400'} />
                        Active Queue
                    </button>
                    <button
                        onClick={() => setFilter('completed')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${filter === 'completed' ? 'bg-white text-emerald-900 shadow-[0_2px_10px_rgb(0,0,0,0.06)]' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'}`}
                    >
                        <CheckCircle2 size={16} className={filter === 'completed' ? 'text-emerald-500' : 'text-gray-400'} />
                        Completed
                    </button>
                    <button
                        onClick={() => setFilter('all')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${filter === 'all' ? 'bg-white text-gray-900 shadow-[0_2px_10px_rgb(0,0,0,0.06)]' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'}`}
                    >
                        <ListTodo size={16} className={filter === 'all' ? 'text-gray-500' : 'text-gray-400'} />
                        All Tasks
                    </button>
                </div>

                {/* Task Grid */}
                {loading && tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-gray-400">
                        <Loader2 size={40} className="animate-spin mb-4 text-indigo-400" />
                        <p className="font-semibold text-sm tracking-wide">Syncing operations...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map(task => (
                                <div key={task.id} className="transform transition duration-300 hover:-translate-y-1 hover:shadow-xl rounded-2xl">
                                    <TaskCard
                                        task={task}
                                        onClick={() => setSelectedTask(task)}
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-24 flex flex-col items-center justify-center text-center rounded-3xl bg-white border border-gray-100 shadow-sm relative overflow-hidden">
                                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none"></div>
                                <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 shadow-sm mb-5 relative z-10">
                                    <Search size={24} className="text-gray-400" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 relative z-10">No tasks in this view</h3>
                                <p className="mt-2 text-sm text-gray-500 max-w-sm relative z-10">You're all caught up! There are no tasks matching your current filter.</p>

                                {filter === 'my-tasks' && (
                                    <button
                                        onClick={() => setFilter('all')}
                                        className="mt-6 px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all relative z-10"
                                    >
                                        View All Tasks
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Detail Modal */}
                {selectedTask && (
                    <TaskDetail
                        task={selectedTask}
                        userRole="staff"
                        currentUserId={user.id}
                        onUpdateStatus={handleUpdateStatus}
                        onAddRemark={handleAddRemark}
                        onClose={() => setSelectedTask(null)}
                    />
                )}
            </main>
        </div>
    );
};

export default StaffView;
