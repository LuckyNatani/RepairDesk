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
    LayoutGrid
} from 'lucide-react';

const StatCard = ({ title, value, color, icon: Icon, trend }) => (
    <div className="bg-white p-5 md:p-6 rounded-xl border border-slate-200 flex flex-col justify-between hover:border-indigo-300 transition-colors shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-2.5 rounded-lg ${color.bg} ${color.text} ring-1 ring-inset ${color.ring}`}>
                <Icon size={18} />
            </div>
            {trend && (
                <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md tracking-wide">
                    {trend}
                </span>
            )}
        </div>
        <div>
            <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">{title}</h3>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
        </div>
        {/* Subtle decorative accent */}
        <div className={`absolute -right-4 -bottom-4 w-16 h-16 rounded-full opacity-[0.03] ${color.decorationBg}`}></div>
    </div>
);

const AnalyticsDashboard = () => {
    const { tasks, loading } = useTasks();
    const { staff } = useStaff();

    const stats = useMemo(() => {
        if (!tasks.length) return null;

        const completed = tasks.filter(t => t.status === 'completed');
        const inProgress = tasks.filter(t => t.status === 'in_progress');
        const unassigned = tasks.filter(t => t.status === 'unassigned');

        let avgCompletionHrs = 0;
        if (completed.length > 0) {
            const times = completed
                .filter(t => t.assigned_at && t.completed_at)
                .map(t => (new Date(t.completed_at) - new Date(t.assigned_at)) / (1000 * 60 * 60));

            if (times.length > 0) {
                avgCompletionHrs = times.reduce((a, b) => a + b, 0) / times.length;
            }
        }

        const staffImpact = staff.map(s => {
            const staffTasks = tasks.filter(t => t.assigned_to === s.id);
            const done = staffTasks.filter(t => t.status === 'completed').length;
            return {
                name: s.name,
                total: staffTasks.length,
                completion: staffTasks.length > 0 ? Math.round((done / staffTasks.length) * 100) : 0
            };
        }).sort((a, b) => b.total - a.total);

        return {
            total: tasks.length,
            completedCount: completed.length,
            progressCount: inProgress.length,
            pendingCount: unassigned.length,
            avgTime: avgCompletionHrs.toFixed(1),
            staffImpact
        };
    }, [tasks, staff]);

    if (loading || !stats) {
        return (
            <div className="h-full w-full">
                <div className="flex flex-col items-center justify-center h-[70vh] text-slate-400">
                    <Clock className="animate-spin mb-4 text-indigo-400" size={32} />
                    <p className="font-medium text-sm">Calculating insights...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full">
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 md:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                        <BarChart3 size={24} className="text-indigo-600 hidden sm:block" />
                        Performance Analytics
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">Key metrics and operational health overview</p>
                </div>
            </div>

            <main className="max-w-[1400px] mx-auto p-6 md:p-8">
                {/* Primary Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                    <StatCard
                        title="Total Jobs"
                        value={stats.total}
                        color={{ bg: 'bg-indigo-50', text: 'text-indigo-600', ring: 'ring-indigo-500/10', decorationBg: 'bg-indigo-600' }}
                        icon={LayoutGrid}
                        trend="+12% weekly"
                    />
                    <StatCard
                        title="Completed"
                        value={stats.completedCount}
                        color={{ bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-500/10', decorationBg: 'bg-emerald-600' }}
                        icon={CheckCircle2}
                    />
                    <StatCard
                        title="In Progress"
                        value={stats.progressCount}
                        color={{ bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-500/10', decorationBg: 'bg-blue-600' }}
                        icon={TrendingUp}
                    />
                    <StatCard
                        title="Avg Resolve Time"
                        value={`${stats.avgTime}h`}
                        color={{ bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-500/10', decorationBg: 'bg-amber-600' }}
                        icon={Clock}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                    {/* Staff Performance Chart */}
                    <div className="lg:col-span-2 bg-white rounded-xl p-6 md:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Users size={120} />
                        </div>
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center mb-8 relative z-10">
                            <Users size={14} className="mr-2 text-indigo-600" />
                            Staff Productivity
                        </h3>

                        <div className="space-y-6 relative z-10">
                            {stats.staffImpact.slice(0, 5).map((s, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex justify-between items-center text-xs font-semibold tracking-wide">
                                        <span className="text-slate-800">{s.name}</span>
                                        <span className="text-slate-500">{s.completion}% Success • {s.total} Jobs</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${s.completion}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                            {stats.staffImpact.length === 0 && (
                                <div className="py-8 text-center text-sm text-slate-500">
                                    No staff data available
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Insights */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl p-6 md:p-8 text-white shadow-xl shadow-indigo-600/10">
                            <Calendar size={28} className="mb-4 text-indigo-200 opacity-80" />
                            <h3 className="text-lg font-semibold mb-2">Weekly Summary</h3>
                            <p className="text-indigo-100 text-sm leading-relaxed mb-6 font-medium opacity-90">
                                You have resolved {stats.completedCount} tasks this month. Completion rate is {Math.round((stats.completedCount / stats.total) * 100)}%.
                            </p>
                            <div className="flex items-center text-[10px] font-bold space-x-2">
                                <span className="bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-md uppercase tracking-wider border border-white/10">
                                    Operational Health: GOOD
                                </span>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 md:p-8 border border-slate-200 shadow-sm flex items-start gap-4 hover:border-amber-300 transition-colors">
                            <div className="p-3 bg-amber-50 rounded-lg text-amber-500 ring-1 ring-inset ring-amber-500/10 shrink-0">
                                <AlertCircle size={20} />
                            </div>
                            <div>
                                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Attention Required</h3>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-3xl font-bold text-slate-900 tracking-tight">{stats.pendingCount}</p>
                                    <p className="text-xs text-slate-500 font-medium">unassigned tickets</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AnalyticsDashboard;
