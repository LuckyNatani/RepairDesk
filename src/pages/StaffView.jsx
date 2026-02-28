import React, { useState } from 'react';
import TaskCard from '../components/Kanban/TaskCard';
import TaskDetail from '../components/Tasks/TaskDetail';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../hooks/useAuth';
import { Search, Loader2, ListTodo } from 'lucide-react';

const StaffView = () => {
    const { user } = useAuth();
    const { tasks, loading, updateTaskStatus, addRemark } = useTasks();
    const [filter, setFilter] = useState('my-tasks');
    const [selectedTask, setSelectedTask] = useState(null);

    const filteredTasks = tasks.filter(task => {
        if (filter === 'my-tasks') return task.assigned_to === user.id && task.status !== 'completed';
        if (filter === 'completed') return task.assigned_to === user.id && task.status === 'completed';
        return true;
    });

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
        <div className="h-full">
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 md:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                        <ListTodo size={24} className="text-indigo-600 hidden sm:block" />
                        My Queue
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">Manage assignments and track progress.</p>
                </div>
            </div>

            <main className="max-w-4xl mx-auto p-6 md:p-8">
                {/* Filter Tabs */}
                <div className="flex p-1 bg-slate-100/80 rounded-lg mb-8 space-x-1 border border-slate-200/60 inline-flex">
                    <button
                        onClick={() => setFilter('my-tasks')}
                        className={`py-2 px-5 rounded-md text-sm font-medium transition-all duration-200 ${filter === 'my-tasks' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                    >
                        Active Jobs
                    </button>
                    <button
                        onClick={() => setFilter('completed')}
                        className={`py-2 px-5 rounded-md text-sm font-medium transition-all duration-200 ${filter === 'completed' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                    >
                        Completed
                    </button>
                    <button
                        onClick={() => setFilter('all')}
                        className={`py-2 px-5 rounded-md text-sm font-medium transition-all duration-200 ${filter === 'all' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                    >
                        All Tasks
                    </button>
                </div>

                {/* Task List */}
                {loading && tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                        <Loader2 size={32} className="animate-spin mb-4 text-indigo-400" />
                        <p className="font-medium text-sm">Syncing your queue...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map(task => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    onClick={() => setSelectedTask(task)}
                                />
                            ))
                        ) : (
                            <div className="col-span-full py-24 flex flex-col items-center justify-center text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white border border-slate-100 shadow-sm mb-4">
                                    <Search size={20} className="text-slate-400" />
                                </div>
                                <h3 className="text-sm font-medium text-slate-900">No tasks found</h3>
                                <p className="mt-1 text-sm text-slate-500 max-w-sm">There are no tasks available in this view right now.</p>
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
