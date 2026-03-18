import React, { useMemo } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useStaff } from '../hooks/useStaff';
import {
    BarChart3, TrendingUp, CheckCircle2, Clock,
    AlertCircle, Users, Calendar, LayoutGrid, Zap
} from 'lucide-react';

/* Compact stat card — Max ~90px tall on mobile */
const StatCard = ({ title, value, color, icon: Icon }) => (
    <div className={`bg-white rounded-lg border border-slate-100 px-3 py-2.5 flex items-center gap-3 hover:border-slate-200 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.04)]`}>
        <div className={`w-8 h-8 rounded-lg ${color.bg} ${color.text} flex items-center justify-center shrink-0`}>
            <Icon size={15} />
        </div>
        <div className="min-w-0">
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide leading-none mb-0.5">{title}</p>
            <p className="text-[20px] font-bold text-slate-900 leading-tight tracking-tight">{value}</p>
        </div>
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
            if (t.status === 'completed' && t.completed_at) return new Date(t.completed_at) > due;
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
            <div className="h-full w-full flex flex-col items-center justify-center py-24 text-slate-400">
                <BarChart3 size={20} className="animate-pulse mb-2 text-primary-500" />
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Loading analytics...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 pb-6">
            {/* Compact page header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-[15px] font-semibold text-slate-900 tracking-tight">Analytics</h1>
                    <p className="text-[11px] text-slate-400 mt-0.5">Performance &amp; Insights</p>
                </div>
                {/* Time range pills */}
                <div className="flex items-center gap-1 bg-slate-100/70 p-1 rounded-lg">
                    <button className="px-2.5 py-1 bg-white text-slate-800 text-[11px] font-semibold rounded-md shadow-sm transition-all">
                        This Month
                    </button>
                    <button className="px-2.5 py-1 text-slate-400 text-[11px] font-medium rounded-md hover:text-slate-700 transition-all">
                        Past Year
                    </button>
                </div>
            </div>

            {!stats ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg border border-slate-100 text-center px-6">
                    <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center mb-3 text-primary-500">
                        <BarChart3 size={18} />
                    </div>
                    <h2 className="text-[13px] font-semibold text-slate-900 mb-1">No data yet</h2>
                    <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
                        Metrics will populate once tasks are created and staff start logging repairs.
                    </p>
                </div>
            ) : (
                <>
                    {/* Summary stat cards — 2×2 on mobile, 4 on desktop */}
                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
                        <StatCard
                            title="Total Tickets"
                            value={stats.total}
                            color={{ bg: 'bg-primary-50', text: 'text-primary-600' }}
                            icon={LayoutGrid}
                        />
                        <StatCard
                            title="Closed Jobs"
                            value={stats.completedCount}
                            color={{ bg: 'bg-emerald-50', text: 'text-emerald-600' }}
                            icon={CheckCircle2}
                        />
                        <StatCard
                            title="Productivity"
                            value={`${Math.round((stats.completedCount / (stats.total || 1)) * 100)}%`}
                            color={{ bg: 'bg-blue-50', text: 'text-blue-600' }}
                            icon={TrendingUp}
                        />
                        <StatCard
                            title="Avg. Cycle"
                            value={`${stats.avgTime}h`}
                            color={{ bg: 'bg-amber-50', text: 'text-amber-600' }}
                            icon={Clock}
                        />
                    </div>

                    {/* Main grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
                        {/* Staff Performance */}
                        <div className="xl:col-span-2 bg-white rounded-lg border border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100">
                                <div>
                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Resource Utilization</p>
                                    <h3 className="text-[13px] font-semibold text-slate-900">Staff Efficiency</h3>
                                </div>
                                <Users size={14} className="text-slate-200" />
                            </div>

                            <div className="divide-y divide-slate-50">
                                {stats.staffImpact.length === 0 ? (
                                    <div className="py-10 text-center">
                                        <p className="text-[11px] text-slate-300 uppercase tracking-widest">No personnel data</p>
                                    </div>
                                ) : (
                                    stats.staffImpact.slice(0, 5).map((s) => (
                                        <div key={s.id} className="px-3.5 py-2.5">
                                            <div className="flex justify-between items-center mb-1.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-primary-600 text-[10px] shrink-0">
                                                        {s.name.charAt(0)}
                                                    </div>
                                                    <span className="text-[12px] font-semibold text-slate-800">{s.name}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-right">
                                                    <div>
                                                        <span className="text-[12px] font-bold text-slate-900 block">{s.completion}%</span>
                                                        <span className="text-[9px] text-slate-400 uppercase tracking-wide">Rate</span>
                                                    </div>
                                                    <div className="w-px h-6 bg-slate-100" />
                                                    <div>
                                                        <span className="text-[12px] font-bold text-slate-900 block">{s.avgTime}h</span>
                                                        <span className="text-[9px] text-slate-400 uppercase tracking-wide">Avg</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-700 ${
                                                        s.completion > 80 ? 'bg-primary-500' :
                                                        s.completion > 50 ? 'bg-blue-400' : 'bg-amber-400'
                                                    }`}
                                                    style={{ width: `${s.completion}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Right column: Health + Backlog */}
                        <div className="flex flex-col gap-3">
                            {/* Weekly Health */}
                            <div className="bg-primary-600 rounded-lg p-4 text-white shadow-lg shadow-primary-600/20 relative overflow-hidden">
                                <div className="absolute -bottom-6 -right-6 opacity-10">
                                    <TrendingUp size={80} />
                                </div>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
                                        <Calendar size={14} className="text-white" />
                                    </div>
                                    <h3 className="text-[13px] font-semibold">Weekly Health</h3>
                                </div>
                                <p className="text-primary-100/90 text-[11px] leading-relaxed mb-3">
                                    You've resolved <span className="text-white font-bold">{stats.completedCount} jobs</span> this period. SLA efficiency is trending <span className="text-white font-bold">upward</span> by ~8%.
                                </p>
                                <div className="inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-md">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-[9px] font-bold uppercase tracking-widest">System: Optimal</span>
                                </div>
                            </div>

                            {/* Attention Pool */}
                            <div className="bg-white rounded-lg border border-slate-100 p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center text-amber-500">
                                        <AlertCircle size={14} />
                                    </div>
                                    {stats.slaBreachCount > 0 && (
                                        <span className="bg-red-50 text-red-600 text-[9px] font-bold px-2 py-1 rounded-md border border-red-100 uppercase tracking-tight">
                                            {stats.slaBreachCount} Breach{stats.slaBreachCount > 1 ? 'es' : ''}
                                        </span>
                                    )}
                                </div>
                                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Attention Pool</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-[28px] font-bold text-slate-900 leading-none">{stats.pendingCount}</p>
                                    <p className="text-[11px] text-slate-400">waiting</p>
                                </div>
                                <button className="mt-3 w-full py-1.5 bg-slate-50 text-slate-600 font-semibold text-[11px] rounded-md border border-slate-100 hover:bg-slate-100 transition-all">
                                    Review Backlog
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AnalyticsDashboard;
