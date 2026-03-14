import React, { useState, useEffect } from 'react';
import { X, Clock, MapPin, Wrench, CheckCircle2, TrendingUp, CircleDashed } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import StatusBadge from '../shared/StatusBadge';

const CustomerHistoryModal = ({ isOpen, onClose, customerPhone, customerName }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && customerPhone) {
            fetchHistory();
        }
    }, [isOpen, customerPhone]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('customer_phone', customerPhone)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setHistory(data || []);
        } catch (error) {
            console.error('Error fetching customer history', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl ring-1 ring-slate-200/50 overflow-hidden animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white relative z-10 shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                            {customerName}
                        </h2>
                        <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-1.5">
                            Customer Service History <span className="opacity-50">•</span> {customerPhone}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 isolate">
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Clock className="animate-spin text-indigo-400" size={24} />
                        </div>
                    ) : history.length === 0 ? (
                        <div className="text-center p-8 text-slate-500">
                            No prior history found.
                        </div>
                    ) : (
                        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                            {history.map((task, idx) => {
                                const isCompleted = task.status === 'completed';
                                const Icon = isCompleted ? CheckCircle2 : (task.status === 'in_progress' ? TrendingUp : CircleDashed);
                                const iconColor = isCompleted ? 'text-emerald-500 bg-emerald-50 ring-emerald-500/20' : 
                                                (task.status === 'in_progress' ? 'text-amber-500 bg-amber-50 ring-amber-500/20' : 'text-slate-400 bg-slate-50 ring-slate-200');

                                return (
                                    <div key={task.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        
                                        {/* Icon */}
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white ring-1 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 ${iconColor}`}>
                                            <Icon size={16} />
                                        </div>

                                        {/* Card */}
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-indigo-200 transition-all">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-bold text-slate-400">
                                                    #{task.task_number}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                    {new Date(task.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})}
                                                </span>
                                            </div>
                                            <div className="mb-3">
                                                <StatusBadge status={task.status} />
                                            </div>
                                            
                                            <p className="text-sm font-medium text-slate-800 mb-2 line-clamp-2 leading-snug">
                                                {task.description}
                                            </p>
                                            
                                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                                                <MapPin size={12} className="shrink-0" />
                                                <span className="truncate">{task.customer_address}</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerHistoryModal;
