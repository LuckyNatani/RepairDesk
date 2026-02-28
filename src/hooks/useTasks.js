import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('tasks')
                .select(`
          *,
          assigned_user:users!tasks_assigned_to_fkey(name),
          remarks(id, remark_text, created_at, staff_id)
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTasks(data || []);
        } catch (err) {
            console.error('Error fetching tasks:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();

        // Subscribe to real-time changes
        const channel = supabase
            .channel('tasks-realtime')
            .on(
                'postgres_changes',
                { event: '*', table: 'tasks', schema: 'public' },
                (payload) => {
                    console.log('Real-time task change:', payload);
                    // Re-fetch to get nested user/remarks data correctly or update locally
                    fetchTasks();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const createTask = async (taskData) => {
        const { data, error } = await supabase
            .from('tasks')
            .insert([taskData])
            .select()
            .single();

        if (error) {
            console.error('Error creating task:', error);
            throw error;
        }
        return data;
    };

    const updateTaskStatus = async (taskId, status, assignedTo = undefined) => {
        // Optimistic UI update
        const previousTasks = [...tasks];

        setTasks(currentTasks => currentTasks.map(task => {
            if (task.id === taskId) {
                return {
                    ...task,
                    status,
                    // Only update assigned_to if explicitly provided (even if null)
                    assigned_to: assignedTo !== undefined ? assignedTo : task.assigned_to,
                };
            }
            return task;
        }));

        // Using simple object for updates
        const cleanUpdates = { status };
        if (assignedTo !== undefined) cleanUpdates.assigned_to = assignedTo;
        if (status === 'in_progress' && assignedTo) cleanUpdates.assigned_at = new Date().toISOString();
        if (status === 'completed') cleanUpdates.completed_at = new Date().toISOString();

        const { data, error } = await supabase
            .from('tasks')
            .update(cleanUpdates)
            .eq('id', taskId)
            .select()
            .single();

        if (error) {
            console.error('Error updating task:', error);
            // Revert UI on error
            setTasks(previousTasks);
            throw error;
        }
        return data;
    };

    const addRemark = async (taskId, staffId, remarkText) => {
        const { data, error } = await supabase
            .from('remarks')
            .insert([{ task_id: taskId, staff_id: staffId, remark_text: remarkText }])
            .select()
            .single();

        if (error) {
            console.error('Error adding remark:', error);
            throw error;
        }
        return data;
    };

    const deleteTask = async (taskId) => {
        // Optimistic UI update
        const previousTasks = [...tasks];
        setTasks(currentTasks => currentTasks.filter(task => task.id !== taskId));

        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', taskId);

        if (error) {
            console.error('Error deleting task:', error);
            // Revert UI on error
            setTasks(previousTasks);
            throw error;
        }
    };

    return { tasks, loading, error, createTask, updateTaskStatus, addRemark, deleteTask, refreshTasks: fetchTasks };
};
