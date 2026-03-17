import React, { useMemo } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useStaff } from '../hooks/useStaff';
import {
    BarChart3,
    TrendingUp,
    CheckCircle2,
    Clock,
    AlertCircle,
    Users,
    Calendar,
    LayoutGrid,
    ChevronRight,
    Zap
} from 'lucide-react';

const StatCard = ({ title, value, color, icon: Icon, trend }) => (
    <div className="bg-white p-7 rounded-[2.5rem] border border-slate-100 flex flex-col justify-between hover:border-primary-200 transition-all hover:-translate-y-1 shadow-sm hover:shadow-xl hover:shadow-primary-100/20 relative overflow-hidden group">
        <div className="flex items-center justify-between mb-6">
            <div className={`w-12 h-12 rounded-2xl ${color.bg} ${color.text} flex items-center justify-center border border-white shadow-sm transition-transform group-hover:scale-110`}>
                <Icon size={22} />
            </div>
            {trend && (
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg tracking-widest uppercase mb-1">
                        {trend}
                    </span>
                    <TrendingUp size={12} className="text-emerald-400" />
                </div>
            )}
        </div>
        <div>
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2 leading-none">{title}</h3>
            <p className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{value}</p>
        </div>
        {/* Subtle decorative accent */}
        <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-[0.04] ${color.decorationBg} group-hover:scale-150 transition-transform duration-700`}></div>
    </div>
);

const AnalyticsDashboard = () => {
    const { tasks, loading } = useTasks();
    const { staff } = useStaff();

    const stats = useMemo(() => {
        if (!tasks.length && !staff.length) return null;

        const completed = tasks.filter(t => t.status === 'completed');
        const inProgress = tasks.filter(t => t.status === 'in_progress');
        const unassigned = tasks.filter(t => t.status === 'unassigned');

        let avgCompletionHrs = 0;
        let slaBreachCount = 0;

        if (completed.length > 0) {
            const times = completed
                .filter(t => t.started_work_at && t.completed_at)
                .map(t => (new Date(t.completed_at) - new Date(t.started_work_at)) / (1000 * 60 * 60));

            if (times.length > 0) {
                avgCompletionHrs = times.reduce((a, b) => a + b, 0) / times.length;
            }
        }

        slaBreachCount = tasks.filter(t => {
            if (!t.due_date) return false;
            const due = new Date(t.due_date);
            if (t.status === 'completed' && t.completed_at) {
                return new Date(t.completed_at) > due;
            }
            return new Date() > due;
        }).length;

        const staffImpact = staff.map(s => {
            const staffTasks = tasks.filter(t => t.assigned_to === s.id);
            const done = staffTasks.filter(t => t.status === 'completed').length;
            
            const staffTimes = staffTasks
                .filter(t => t.status === 'completed' && t.started_work_at && t.completed_at)
                .map(t => (new Date(t.completed_at) - new Date(t.started_work_at)) / (1000 * 60 * 60));
            
            const avgTime = staffTimes.length > 0 ? (staffTimes.reduce((a, b) => a + b, 0) / staffTimes.length).toFixed(1) : 0;

            return {
                id: s.id,
                name: s.name,
                total: staffTasks.length,
                completion: staffTasks.length > 0 ? Math.round((done / staffTasks.length) * 100) : 0,
                avgTime
            };
        }).sort((a, b) => b.total - a.total);

        return {
            total: tasks.length,
            completedCount: completed.length,
            progressCount: inProgress.length,
            pendingCount: unassigned.length,
            avgTime: avgCompletionHrs.toFixed(1),
            slaBreachCount,
            staffImpact
        };
    }, [tasks, staff]);

    if (loading) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center py-40">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-primary-100 border-t-primary-600 rounded-[2rem] animate-spin" />
                    <BarChart3 className="absolute inset-0 m-auto text-primary-600" size={24} />
                </div>
                <p className="mt-8 font-black text-slate-400 uppercase tracking-[0.3em] text-[10px]">Crunching Analytics...</p>
            </div>
        );
    }

    return (
        <div className="h-full pb-20">
            {/* Header / Top Bar */}
            <div className="px-6 py-8 md:px-10 md:py-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-200">
                            <Zap size={20} className="text-white" />
                        </div>
                        <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter">
                            Overview
                        </h1>
                    </div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 md:ml-12">Performance & Insights</p>
                </div>
                
                <div className="flex items-center gap-3 bg-white p-2 rounded-[1.5rem] border border-slate-100 shadow-sm">
                    <button className="px-5 py-2.5 bg-slate-50 text-slate-900 text-xs font-black rounded-xl border border-slate-100 transition-all hover:bg-white shadow-sm">
                        This Month
                    </button>
                    <button className="px-5 py-2.5 text-slate-400 text-xs font-black rounded-xl hover:text-slate-900 transition-all">
                        Past Year
                    </button>
                </div>
            </div>

            <main className="max-w-[1600px] mx-auto px-6 md:px-10 space-y-10">
                {!stats ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-slate-100 shadow-sm text-center px-10">
                        <div className="w-20 h-20 bg-primary-50 rounded-[2rem] flex items-center justify-center mb-6 text-primary-500 border border-primary-100">
                            <BarChart3 size={32} />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 mb-3 tracking-tight">Deployment Ready</h2>
                        <p className="text-slate-400 font-medium text-sm max-w-sm leading-relaxed mb-8">Metrics will populate once tasks are created and staff members begin logging repairs.</p>
                        <button className="px-10 py-4 bg-primary-600 text-white font-black text-sm rounded-[1.2rem] shadow-xl shadow-primary-200 hover:-translate-y-1 transition-all active:translate-y-0">
                            Create First Ticket
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                            <StatCard
                                title="Active Tickets"
                                value={stats.total}
                                color={{ bg: 'bg-primary-50', text: 'text-primary-600', decorationBg: 'bg-primary-600' }}
                                icon={LayoutGrid}
                                trend="+12%"
                            />
                            <StatCard
                                title="Closed Jobs"
                                value={stats.completedCount}
                                color={{ bg: 'bg-emerald-50', text: 'text-emerald-700', decorationBg: 'bg-emerald-600' }}
                                icon={CheckCircle2}
                            />
                            <StatCard
                                title="Productivity"
                                value={`${Math.round((stats.completedCount / (stats.total || 1)) * 100)}%`}
                                color={{ bg: 'bg-blue-50', text: 'text-blue-600', decorationBg: 'bg-blue-600' }}
                                icon={TrendingUp}
                            />
                            <StatCard
                                title="Avg. Cycle"
                                value={`${stats.avgTime}h`}
                                color={{ bg: 'bg-amber-50', text: 'text-amber-700', decorationBg: 'bg-amber-600' }}
                                icon={Clock}
                            />
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                            {/* Staff Performance */}
                            <div className="xl:col-span-2 bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-sm relative overflow-hidden group">
                                <div className="absolute -top-10 -right-10 opacity-5 transition-transform duration-1000 group-hover:scale-110">
                                    <Users size={240} className="text-primary-900" />
                                </div>
                                
                                <div className="flex items-center justify-between mb-12 relative z-10">
                                    <div>
                                        <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Resource Utilization</h3>
                                        <p className="text-xl font-black text-slate-900 tracking-tight">Staff Efficiency</p>
                                    </div>
                                    <button className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 transition-all border border-slate-100">
                                        <ChevronRight size={20} />
                                    </button>
                                </div>

                                <div className="space-y-10 relative z-10">
                                    {stats.staffImpact.slice(0, 5).map((s) => (
                                        <div key={s.id} className="group/item">
                                            <div className="flex justify-between items-center mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-primary-600 text-sm">
                                                        {s.name.charAt(0)}
                                                    </div>
                                                    <span className="text-[15px] font-black text-slate-800 tracking-tight">{s.name}</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <span className="text-[13px] font-black text-slate-900 block">{s.completion}%</span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Success Rate</span>
                                                    </div>
                                                    <div className="w-[1px] h-6 bg-slate-100" />
                                                    <div className="text-right min-w-[70px]">
                                                        <span className="text-[13px] font-black text-slate-900 block">{s.avgTime}h</span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Avg Resp</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden p-0.5 border border-slate-100">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${
                                                        s.completion > 80 ? 'bg-primary-500 shadow-primary-200' : 
                                                        s.completion > 50 ? 'bg-blue-400 shadow-blue-200' : 'bg-amber-400 shadow-amber-200'
                                                    }`}
                                                    style={{ width: `${s.completion}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                    {stats.staffImpact.length === 0 && (
                                        <div className="py-20 text-center">
                                            <p className="font-black text-slate-300 uppercase tracking-widest text-xs italic">No personnel metrics found</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Weekly Insights & Health */}
                            <div className="space-y-8">
                                <div className="bg-primary-600 rounded-[3rem] p-10 text-white shadow-2xl shadow-primary-600/20 relative overflow-hidden group">
                                    <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-125 transition-transform duration-700">
                                        <TrendingUp size={180} />
                                    </div>
                                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/10">
                                        <Calendar size={28} className="text-white" />
                                    </div>
                                    <h3 className="text-2xl font-black mb-4 tracking-tight">Weekly Health</h3>
                                    <p className="text-primary-100/90 text-sm font-medium leading-relaxed mb-10">
                                        You've resolved <span className="text-white font-black underline decoration-primary-300 underline-offset-4">{stats.completedCount} jobs</span> this period. Your sla efficiency is trending <span className="text-white font-black">UPWARD</span> by ~8%.
                                    </p>
                                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/10">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">System Health: Optimal</span>
                                    </div>
                                </div>

                                <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm flex flex-col gap-6 hover:border-amber-200 transition-all">
                                    <div className="flex items-center justify-between">
                                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-100">
                                            <AlertCircle size={24} />
                                        </div>
                                        {stats.slaBreachCount > 0 && (
                                            <span className="bg-red-50 text-red-600 text-[10px] font-black px-3 py-1.5 rounded-xl border border-red-100 uppercase tracking-tighter">
                                                {stats.slaBreachCount} CRITICAL BREACHES
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Attention Pool</h3>
                                        <div className="flex items-end gap-3">
                                            <p className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{stats.pendingCount}</p>
                                            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Waiting Assignment</p>
                                        </div>
                                    </div>
                                    <button className="w-full py-4 bg-slate-50 text-slate-600 font-black text-xs rounded-2xl border border-slate-100 hover:bg-slate-100 hover:text-slate-900 transition-all">
                                        Review Backlog
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default AnalyticsDashboard;
