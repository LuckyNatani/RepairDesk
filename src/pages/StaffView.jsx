import React, { useState } from 'react';
import Navbar from '../components/shared/Navbar';
import TaskCard from '../components/Kanban/TaskCard';
import TaskDetail from '../components/Tasks/TaskDetail';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../hooks/useAuth';
import { Search, Filter, Loader2, ListTodo } from 'lucide-react';

const StaffView = () => {
    const { user } = useAuth();
    const { tasks, loading, updateTaskStatus, addRemark } = useTasks();
    const [filter, setFilter] = useState('my-tasks'); // 'my-tasks' | 'all' | 'completed'
    const [selectedTask, setSelectedTask] = useState(null);

    const filteredTasks = tasks.filter(task => {
        if (filter === 'my-tasks') return task.assigned_to === user.id && task.status !== 'completed';
        if (filter === 'completed') return task.assigned_to === user.id && task.status === 'completed';
        return true; // 'all'
    });

    const handleUpdateStatus = async (taskId, status, assignedTo) => {
        try {
            await updateTaskStatus(taskId, status, assignedTo);
            // Update selected task in modal to reflect change
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
        <div className="min-h-screen bg-gray-50/30">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 py-8">
                <header className="mb-8">
                    <div className="flex items-center space-x-2 text-indigo-900 mb-2">
                        <ListTodo size={24} strokeWidth={3} />
                        <h1 className="text-2xl font-black tracking-tight">Service Tasks</h1>
                    </div>
                    <p className="text-gray-500 font-medium">Manage your assignments and update job status</p>
                </header>

                {/* Filter Tabs */}
                <div className="flex p-1.5 bg-gray-100 rounded-2xl mb-8 space-x-1">
                    <button
                        onClick={() => setFilter('my-tasks')}
                        className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all ${filter === 'my-tasks' ? 'bg-white text-indigo-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        ACTIVE JOBS
                    </button>
                    <button
                        onClick={() => setFilter('all')}
                        className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all ${filter === 'all' ? 'bg-white text-indigo-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        ALL TASKS
                    </button>
                    <button
                        onClick={() => setFilter('completed')}
                        className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all ${filter === 'completed' ? 'bg-white text-indigo-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        COMPLETED
                    </button>
                </div>

                {/* Task List */}
                {loading && tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                        <Loader2 size={40} className="animate-spin mb-4 text-indigo-100" />
                        <p className="font-bold">Syncing your tasks...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map(task => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    onClick={() => setSelectedTask(task)}
                                />
                            ))
                        ) : (
                            <div className="py-24 text-center space-y-3">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full text-gray-200">
                                    <Search size={32} />
                                </div>
                                <p className="text-gray-400 font-bold">No tasks found in this view</p>
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
