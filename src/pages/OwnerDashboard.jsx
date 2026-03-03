import React, { useState } from 'react';
import KanbanBoard from '../components/Kanban/KanbanBoard';
import NewTaskForm from '../components/Tasks/NewTaskForm';
import TaskDetail from '../components/Tasks/TaskDetail';
import { useTasks } from '../hooks/useTasks';
import { useStaff } from '../hooks/useStaff';
import { useAuth } from '../hooks/useAuth';
import { Plus, RefreshCcw, Loader2, LayoutGrid } from 'lucide-react';

const OwnerDashboard = () => {
    const { tasks, loading, createTask, updateTaskStatus, addRemark, deleteTask, editTask, refreshTasks } = useTasks();
    const { staff } = useStaff();
    const { user, role } = useAuth();
    const [showNewTaskForm, setShowNewTaskForm] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    const handleCreateTask = async (taskData) => {
        try {
            await createTask(taskData);
            setShowNewTaskForm(false);
        } catch (err) {
            alert('Failed to create task: ' + err.message);
        }
    };

    const handleUpdateStatus = async (taskId, status, assignedTo) => {
        try {
            await updateTaskStatus(taskId, status, assignedTo);
            if (selectedTask?.id === taskId) setSelectedTask(null);
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
            {/* Header Area */}
            <div className="glass-panel sticky top-0 z-30 px-4 py-3 md:px-8 md:py-5 flex items-center justify-between gap-3 border-b border-slate-100/60 shadow-sm transition-all pt-safe-offset-2">
                <div className="flex-1 min-w-0">
                    <h1 className="text-lg md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2 truncate">
                        <LayoutGrid size={20} className="text-indigo-600 hidden sm:block shrink-0" />
                        Service Dashboard
                    </h1>
                    <p className="text-xs md:text-sm text-slate-500 mt-0.5 truncate hidden sm:block">Manage assignments and track operations.</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={refreshTasks}
                        className="p-2 border border-slate-200 text-slate-600 bg-white rounded-xl hover:bg-slate-50 active:scale-95 transition-all focus:outline-none shadow-sm"
                        title="Refresh"
                    >
                        <RefreshCcw size={18} className={loading && tasks.length > 0 ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={() => setShowNewTaskForm(true)}
                        className="inline-flex items-center justify-center px-4 md:px-5 py-2 text-sm font-semibold text-white transition-all bg-indigo-600 rounded-xl hover:bg-indigo-700 active:scale-95 shadow-md shadow-indigo-600/20"
                    >
                        <Plus size={18} className="mr-1.5 hidden sm:block" />
                        <span className="sm:hidden"><Plus size={20} /></span>
                        <span className="hidden sm:inline">New Task</span>
                    </button>
                </div>
            </div>

            <main className="max-w-[1400px] mx-auto p-6 md:p-8">
                {loading && tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                        <Loader2 size={32} className="animate-spin mb-4 text-indigo-400" />
                        <p className="font-medium text-sm">Loading workspace...</p>
                    </div>
                ) : (
                    <KanbanBoard
                        tasks={tasks}
                        onTaskClick={setSelectedTask}
                        isOwner={role === 'owner'}
                        staffMembers={staff}
                        onAssign={(taskId, assignedTo) => {
                            const newStatus = assignedTo ? 'in_progress' : 'unassigned';
                            handleUpdateStatus(taskId, newStatus, assignedTo);
                        }}
                    />
                )}

                {showNewTaskForm && (
                    <NewTaskForm
                        staffMembers={staff}
                        onSubmit={handleCreateTask}
                        onCancel={() => setShowNewTaskForm(false)}
                    />
                )}

                {selectedTask && (
                    <TaskDetail
                        task={selectedTask}
                        userRole={role}
                        currentUserId={user?.id}
                        staffMembers={staff}
                        onUpdateStatus={handleUpdateStatus}
                        onAddRemark={handleAddRemark}
                        onEdit={
                            role === 'owner'
                                ? async (id, updates) => {
                                    const updatedTask = await editTask(id, updates);
                                    setSelectedTask(updatedTask);
                                }
                                : undefined
                        }
                        onDelete={
                            role === 'owner'
                                ? async (id) => {
                                    await deleteTask(id);
                                    setSelectedTask(null);
                                }
                                : undefined
                        }
                        onClose={() => setSelectedTask(null)}
                    />
                )}
            </main>
        </div>
    );
};

export default OwnerDashboard;
