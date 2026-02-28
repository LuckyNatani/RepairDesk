import React, { useMemo } from 'react';
import Navbar from '../components/shared/Navbar';
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
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-2xl ${color.bg} ${color.text}`}>
                <Icon size={20} />
            </div>
            {trend && (
                <span className="text-[10px] font-black px-2 py-1 bg-green-50 text-green-600 rounded-full tracking-tighter">
                    {trend}
                </span>
            )}
        </div>
        <div>
            <h3 className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">{title}</h3>
            <p className="text-3xl font-black text-indigo-900 tracking-tighter">{value}</p>
        </div>
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

        // Average completion time in hours
        let avgCompletionHrs = 0;
        if (completed.length > 0) {
            const times = completed
                .filter(t => t.assigned_at && t.completed_at)
                .map(t => (new Date(t.completed_at) - new Date(t.assigned_at)) / (1000 * 60 * 60));

            if (times.length > 0) {
                avgCompletionHrs = times.reduce((a, b) => a + b, 0) / times.length;
            }
        }

        // Tasks by staff member
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
            <div className="min-h-screen bg-gray-50/30">
                <Navbar />
                <div className="flex flex-col items-center justify-center h-[70vh] text-gray-400">
                    <Clock className="animate-pulse mb-4 text-indigo-100" size={48} />
                    <p className="font-bold">Calculating insights...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/30">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 py-8">
                <header className="mb-10">
                    <div className="flex items-center space-x-2 text-indigo-900 mb-1">
                        <BarChart3 size={24} strokeWidth={3} />
                        <h1 className="text-2xl font-black tracking-tight uppercase">Performance Analytics</h1>
                    </div>
                    <p className="text-gray-500 font-medium text-sm">Key metrics and operational health overview</p>
                </header>

                {/* Primary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <StatCard
                        title="Total Jobs"
                        value={stats.total}
                        color={{ bg: 'bg-indigo-50', text: 'text-indigo-600' }}
                        icon={LayoutGrid}
                        trend="+12% weekly"
                    />
                    <StatCard
                        title="Completed"
                        value={stats.completedCount}
                        color={{ bg: 'bg-green-50', text: 'text-green-600' }}
                        icon={CheckCircle2}
                    />
                    <StatCard
                        title="In Progress"
                        value={stats.progressCount}
                        color={{ bg: 'bg-blue-50', text: 'text-blue-600' }}
                        icon={TrendingUp}
                    />
                    <StatCard
                        title="Avg Resolve Time"
                        value={`${stats.avgTime}h`}
                        color={{ bg: 'bg-amber-50', text: 'text-amber-600' }}
                        icon={Clock}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Staff Performance Chart (Simplified) */}
                    <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center mb-8">
                            <Users size={16} className="mr-2 text-indigo-900" />
                            Staff Productivity
                        </h3>

                        <div className="space-y-6">
                            {stats.staffImpact.slice(0, 5).map((s, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-tight">
                                        <span className="text-gray-900">{s.name}</span>
                                        <span className="text-gray-400">{s.completion}% Success Rate • {s.total} Jobs</span>
                                    </div>
                                    <div className="w-full h-3 bg-gray-50 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-900 rounded-full transition-all duration-1000"
                                            style={{ width: `${s.completion}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Insights */}
                    <div className="space-y-6">
                        <div className="bg-indigo-900 rounded-3xl p-8 text-white shadow-xl shadow-indigo-900/20">
                            <Calendar size={32} className="mb-4 text-indigo-400" />
                            <h3 className="text-xl font-bold mb-2">Weekly Summary</h3>
                            <p className="text-indigo-200 text-sm leading-relaxed mb-6 font-medium">
                                You have resolved {stats.completedCount} tasks this month. Completion rate is {Math.round((stats.completedCount / stats.total) * 100)}%.
                            </p>
                            <div className="flex items-center text-[10px] font-black space-x-2">
                                <span className="bg-white/10 px-2 py-1 rounded-full uppercase">Operational Health: GOOD</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                            <AlertCircle size={24} className="mb-4 text-amber-500" />
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-1">Attention Required</h3>
                            <p className="text-3xl font-black text-indigo-900 tracking-tighter mb-1">{stats.pendingCount}</p>
                            <p className="text-xs text-gray-400 font-bold uppercase">Unassigned Tickets</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AnalyticsDashboard;
