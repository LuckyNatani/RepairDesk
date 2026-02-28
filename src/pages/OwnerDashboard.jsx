import React, { useState } from 'react';
import Navbar from '../components/shared/Navbar';
import KanbanBoard from '../components/Kanban/KanbanBoard';
import NewTaskForm from '../components/Tasks/NewTaskForm';
import { useTasks } from '../hooks/useTasks';
import { useStaff } from '../hooks/useStaff';
import { useAuth } from '../hooks/useAuth';
import { Plus, RefreshCcw, Loader2 } from 'lucide-react';

const OwnerDashboard = () => {
    const { tasks, loading, createTask, updateTaskStatus, addRemark, refreshTasks } = useTasks();
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
            // Update selected task in modal to reflect change if it's open
            if (selectedTask?.id === taskId) {
                // We could just find the updated task in the tasks array,
                // but for now, we'll wait for the real-time refresh to handle it
                // and just close the modal or keep it consistent.
                setSelectedTask(null);
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

    const handleTaskClick = (task) => {
        setSelectedTask(task);
    };

    return (
        <div className="min-h-screen bg-gray-50/30">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-indigo-900 tracking-tight">Kanban Dashboard</h1>
                        <p className="text-gray-500 font-medium mt-1">Track and manage repair tasks in real-time</p>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button
                            onClick={refreshTasks}
                            className="p-3 bg-white border border-gray-200 text-gray-600 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm"
                            title="Refresh Data"
                        >
                            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button
                            onClick={() => setShowNewTaskForm(true)}
                            className="px-6 py-3 bg-indigo-900 text-white font-bold rounded-2xl flex items-center shadow-lg hover:bg-indigo-800 hover:-translate-y-0.5 transition-all"
                        >
                            <Plus size={20} className="mr-2" />
                            New Task
                        </button>
                    </div>
                </div>

                {loading && tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                        <Loader2 size={48} className="animate-spin mb-4 text-indigo-200" />
                        <p className="font-bold text-lg">Loading your tasks...</p>
                    </div>
                ) : (
                    <KanbanBoard
                        tasks={tasks}
                        onTaskClick={handleTaskClick}
                        isOwner={role === 'owner'}
                        staffMembers={staff}
                        onAssign={(taskId, assignedTo) => {
                            const newStatus = assignedTo ? 'in_progress' : 'unassigned';
                            handleUpdateStatus(taskId, newStatus, assignedTo);
                        }}
                        onTaskDragEnd={(taskId, newStatus) => {
                            const task = tasks.find(t => t.id === taskId);
                            if (task && task.status !== newStatus) {
                                // If unassigned and moving to in_progress, it needs an assignee.
                                // For now, the user has to assign via modal, but drag & drop sets status.
                                // If dropped in Unassigned, clear assignment.
                                const assignedTo = newStatus === 'unassigned' ? null : task.assigned_to;
                                handleUpdateStatus(taskId, newStatus, assignedTo);
                            }
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
                        onClose={() => setSelectedTask(null)}
                    />
                )}
            </main>
        </div>
    );
};

export default OwnerDashboard;
