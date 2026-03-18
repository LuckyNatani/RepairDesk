import React, { useState } from 'react';
import KanbanBoard from '../components/Kanban/KanbanBoard';
import NewTaskForm from '../components/Tasks/NewTaskForm';
import TaskDetail from '../components/Tasks/TaskDetail';
import { useTasks } from '../hooks/useTasks';
import { useStaff } from '../hooks/useStaff';
import { useAuth } from '../hooks/useAuth';
import { Plus, RefreshCcw, Loader2 } from 'lucide-react';

const OwnerDashboard = () => {
    const { tasks, loading, createTask, updateTaskStatus, addRemark, deleteTask, editTask, refreshTasks } = useTasks();
    const { staff } = useStaff();
    const { user, role } = useAuth();
    const [showNewTaskForm, setShowNewTaskForm] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const selectedTask = tasks.find(t => t.id === selectedTaskId);

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
        <div className="h-full flex flex-col gap-2.5">
            {/* Compact Header */}
            <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                    <h1 className="text-[15px] font-semibold text-slate-900 tracking-tight truncate">
                        Service Board
                    </h1>
                    <p className="text-[11px] text-slate-400 mt-0.5 hidden sm:block">
                        {tasks.length} total tickets
                    </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                    <button
                        onClick={refreshTasks}
                        className="p-1.5 border border-slate-200 text-slate-500 bg-white rounded-lg hover:bg-slate-50 active:scale-95 transition-all focus:outline-none"
                        title="Refresh"
                    >
                        <RefreshCcw size={14} className={loading && tasks.length > 0 ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={() => setShowNewTaskForm(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:scale-95 shadow-sm shadow-indigo-600/20 transition-all"
                    >
                        <Plus size={14} />
                        <span className="hidden sm:inline">New Task</span>
                    </button>
                </div>
            </div>

            {/* Board */}
            {loading && tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <Loader2 size={24} className="animate-spin mb-3 text-indigo-400" />
                    <p className="text-[11px] font-medium">Loading workspace...</p>
                </div>
            ) : (
                <KanbanBoard
                    tasks={tasks}
                    onTaskClick={(task) => setSelectedTaskId(task.id)}
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
                        (role === 'owner')
                            ? async (id, updates) => { await editTask(id, updates); }
                            : undefined
                    }
                    onDelete={
                        (role === 'owner')
                            ? async (id) => {
                                await deleteTask(id);
                                setSelectedTaskId(null);
                            }
                            : undefined
                    }
                    onClose={() => setSelectedTaskId(null)}
                />
            )}
        </div>
    );
};

export default OwnerDashboard;
