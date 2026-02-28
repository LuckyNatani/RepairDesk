import React, { useState } from 'react';
import KanbanBoard from '../components/Kanban/KanbanBoard';
import NewTaskForm from '../components/Tasks/NewTaskForm';
import TaskDetail from '../components/Tasks/TaskDetail';
import { useTasks } from '../hooks/useTasks';
import { useStaff } from '../hooks/useStaff';
import { useAuth } from '../hooks/useAuth';
import { Plus, RefreshCcw, Loader2, LayoutGrid } from 'lucide-react';

const OwnerDashboard = () => {
    const { tasks, loading, createTask, updateTaskStatus, addRemark, deleteTask, refreshTasks } = useTasks();
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
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 md:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                        <LayoutGrid size={24} className="text-indigo-600 hidden sm:block" />
                        Service Dashboard
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">Manage assignments and track operations.</p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={refreshTasks}
                        className="p-2 border border-slate-200 text-slate-600 bg-white rounded-lg hover:bg-slate-50 active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 shadow-sm"
                        title="Refresh"
                    >
                        <RefreshCcw size={18} className={loading && tasks.length > 0 ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={() => setShowNewTaskForm(true)}
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white transition-all bg-indigo-600 rounded-lg hover:bg-indigo-700 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm"
                    >
                        <Plus size={18} className="mr-1.5" />
                        New Task
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
