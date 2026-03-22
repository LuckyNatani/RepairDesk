import React, { useState } from 'react';
import NewTaskForm from '../components/Tasks/NewTaskForm';
import TaskDetail from '../components/Tasks/TaskDetail';
import { useTasks } from '../hooks/useTasks';
import { useStaff } from '../hooks/useStaff';
import { useAuth } from '../hooks/useAuth';
import { PlusCircle, UserPlus, Receipt, CreditCard, ChevronRight } from 'lucide-react';

const OwnerDashboard = () => {
    const { tasks, loading, createTask, updateTaskStatus, addRemark, deleteTask, editTask } = useTasks();
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

    const openTasksCount = tasks.filter(t => t.status !== 'completed').length;
    const recentTasks = [...tasks].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);

    const getStatusStyle = (status) => {
        switch(status) {
            case 'completed': return 'bg-primary-fixed text-primary font-bold';
            case 'in_progress': return 'bg-tertiary-fixed text-on-tertiary-fixed font-bold';
            default: return 'bg-surface-container-highest text-on-surface-variant font-bold';
        }
    };

    return (
        <div className="flex flex-col gap-8 pb-20">
            {/* Quick Actions Bento-style Grid */}
            <section>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <button onClick={() => setShowNewTaskForm(true)} className="group flex flex-col items-center justify-center p-5 bg-surface-container-lowest rounded-2xl shadow-[0_8px_32px_rgba(25,28,30,0.02)] active:scale-95 transition-all text-primary hover:bg-primary-50">
                        <div className="w-12 h-12 mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                            <PlusCircle size={24} />
                        </div>
                        <span className="font-headline font-semibold text-sm text-on-surface">New Ticket</span>
                    </button>
                    <button className="group flex flex-col items-center justify-center p-5 bg-surface-container-lowest rounded-2xl shadow-[0_8px_32px_rgba(25,28,30,0.02)] active:scale-95 transition-all text-secondary hover:bg-secondary-50">
                        <div className="w-12 h-12 mb-3 rounded-full bg-secondary-container/30 flex items-center justify-center">
                            <UserPlus size={24} />
                        </div>
                        <span className="font-headline font-semibold text-sm text-on-surface">Add Customer</span>
                    </button>
                    <button className="group flex flex-col items-center justify-center p-5 bg-surface-container-lowest rounded-2xl shadow-[0_8px_32px_rgba(25,28,30,0.02)] active:scale-95 transition-all text-tertiary hover:bg-tertiary-50">
                        <div className="w-12 h-12 mb-3 rounded-full bg-tertiary-fixed flex items-center justify-center">
                            <Receipt size={24} />
                        </div>
                        <span className="font-headline font-semibold text-sm text-on-surface">Quick Sale</span>
                    </button>
                    <button className="group flex flex-col items-center justify-center p-5 bg-surface-container-lowest rounded-2xl shadow-[0_8px_32px_rgba(25,28,30,0.02)] active:scale-95 transition-all text-error hover:bg-error-50">
                        <div className="w-12 h-12 mb-3 rounded-full bg-error-container/40 flex items-center justify-center">
                            <CreditCard size={24} />
                        </div>
                        <span className="font-headline font-semibold text-sm text-on-surface">Expenses</span>
                    </button>
                </div>
            </section>

            {/* Stats Row */}
            <section className="flex gap-4">
                <div className="flex-1 p-5 bg-surface-container-low rounded-2xl">
                    <p className="font-label text-xs uppercase tracking-wider text-on-surface-variant mb-1">Open Tickets</p>
                    <div className="flex items-baseline gap-2">
                        <span className="font-headline text-3xl font-bold text-on-surface">{openTasksCount}</span>
                    </div>
                </div>
                <div className="flex-1 p-5 bg-surface-container-low rounded-2xl">
                    <p className="font-label text-xs uppercase tracking-wider text-on-surface-variant mb-1">Today's Revenue</p>
                    <div className="flex items-baseline gap-1">
                        <span className="font-headline text-xl font-bold text-on-surface">₹</span>
                        <span className="font-headline text-2xl font-bold text-on-surface">0</span>
                    </div>
                </div>
            </section>

            {/* Recent Tickets List */}
            <section className="space-y-4">
                <div className="flex justify-between items-center px-1">
                    <h2 className="font-headline font-bold text-lg text-on-surface">Recent Tickets</h2>
                    <button className="text-sm font-semibold text-primary">View All <ChevronRight size={14} className="inline inline-block"/></button>
                </div>
                
                {loading && recentTasks.length === 0 ? (
                    <div className="text-center p-10 text-on-surface-variant">Loading tickets...</div>
                ) : recentTasks.length === 0 ? (
                    <div className="text-center p-10 text-on-surface-variant bg-surface-container-lowest rounded-2xl">No tickets found.</div>
                ) : (
                    <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(25,28,30,0.02)]">
                        {recentTasks.map(ticket => (
                            <div 
                                key={ticket.id} 
                                onClick={() => setSelectedTaskId(ticket.id)}
                                className="flex items-center gap-4 p-4 hover:bg-surface-container-low transition-colors cursor-pointer border-b border-outline-variant/10 last:border-0"
                            >
                                <div className="w-12 h-12 rounded-full bg-primary-container/10 flex items-center justify-center overflow-hidden shrink-0 text-primary font-bold">
                                    {ticket.customer_name?.substring(0, 2).toUpperCase() || 'CU'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-headline font-bold text-on-surface truncate">{ticket.customer_name || 'Walk-in'}</h3>
                                    </div>
                                    <p className="text-sm text-on-surface-variant truncate">{ticket.device_type} • {ticket.issue_summary}</p>
                                </div>
                                <div className="shrink-0 flex items-center gap-3">
                                    <span className={`px-3 py-1 font-label text-[10px] rounded-full uppercase ${getStatusStyle(ticket.status)}`}>
                                        {ticket.status.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Contextual Help Card */}
            <section className="pb-4">
                <div className="bg-primary p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
                    <div className="relative z-10 flex flex-col items-start">
                        <h3 className="font-headline font-bold text-white text-lg mb-2">Automate your billing</h3>
                        <p className="text-primary-fixed-dim text-sm mb-4 leading-relaxed">Send professional invoices to customers via WhatsApp in one click.</p>
                        <button className="bg-white text-primary font-headline font-bold text-xs px-6 py-3 rounded-full shadow-lg active:scale-95 transition-all">
                            Setup Invoicing
                        </button>
                    </div>
                </div>
            </section>

            {/* Modals */}
            {showNewTaskForm && (
                <NewTaskForm staffMembers={staff} onSubmit={handleCreateTask} onCancel={() => setShowNewTaskForm(false)} />
            )}

            {selectedTask && (
                <TaskDetail
                    task={selectedTask}
                    userRole={role}
                    currentUserId={user?.id}
                    staffMembers={staff}
                    onUpdateStatus={handleUpdateStatus}
                    onAddRemark={handleAddRemark}
                    onEdit={(role === 'owner') ? async (id, updates) => { await editTask(id, updates); } : undefined}
                    onDelete={(role === 'owner') ? async (id) => { await deleteTask(id); setSelectedTaskId(null); } : undefined}
                    onClose={() => setSelectedTaskId(null)}
                />
            )}
        </div>
    );
};

export default OwnerDashboard;
