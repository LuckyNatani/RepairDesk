import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Layers, Activity, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Landing = () => {
    const { user, role, loading } = useAuth();

    // While checking session, show nothing (prevents flash of landing page)
    if (loading) return null;

    // Auto-redirect logged-in users to their role-based dashboard
    if (user && role) {
        if (role === 'superadmin') return <Navigate to="/superadmin" replace />;
        if (role === 'owner') return <Navigate to="/owner" replace />;
        if (role === 'staff') return <Navigate to="/staff" replace />;
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-50 flex flex-col font-sans selection:bg-rose-500/30 selection:text-rose-100 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-rose-600/20 blur-[120px] mix-blend-screen" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-orange-600/10 blur-[150px] mix-blend-screen" />
                <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-rose-800/20 blur-[100px] mix-blend-screen" />
                {/* Subtle noise texture */}
                <div className="absolute inset-0 bg-[#0a0a0a] opacity-50 mix-blend-overlay"></div>
            </div>

            {/* Header / Nav */}
            <header className="px-6 py-5 flex items-center justify-between z-50">
                <div className="flex items-center space-x-3 group">
                    <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-600/30 group-hover:scale-105 transition-transform duration-300 border border-rose-500/50">
                        <Layers size={20} strokeWidth={2.5} />
                    </div>
                    <span className="font-bold text-white tracking-tight text-2xl">TaskPod</span>
                </div>
                <div>
                    <Link
                        to="/login"
                        className="px-6 py-2.5 text-sm font-semibold text-neutral-900 bg-white hover:bg-neutral-200 rounded-full transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
                    >
                        Sign In
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 z-10">
                <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-neutral-900/50 border border-neutral-800/80 text-neutral-300 text-xs font-medium mb-10 backdrop-blur-md">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                    <span>Task Management Reimagined</span>
                </div>

                <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[1.1] max-w-5xl mb-8 mix-blend-plus-lighter">
                    Execute Faster.<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-rose-500 to-orange-400">
                        Deliver More.
                    </span>
                </h1>

                <p className="text-lg md:text-2xl text-neutral-400 max-w-2xl mb-12 leading-relaxed font-light">
                    The ultimate task operating system tailored to keep your team completely aligned, instantly updated, and always moving forward.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full sm:w-auto">
                    <Link
                        to="/login"
                        className="px-8 py-4 bg-rose-600 text-white font-bold rounded-full shadow-[0_0_40px_rgba(225,29,72,0.4)] hover:shadow-[0_0_60px_rgba(225,29,72,0.6)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center group w-full sm:w-auto text-lg border border-rose-500/50"
                    >
                        Enter Workspace
                        <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </main>

            {/* Feature Highlights - Glassmorphism style */}
            <div className="relative z-10 flex flex-col md:flex-row gap-6 max-w-6xl mx-auto px-6 w-full pb-20">
                <div className="flex-1 bg-neutral-900/40 backdrop-blur-xl p-8 rounded-3xl border border-neutral-800/50 hover:border-neutral-700/50 hover:bg-neutral-900/60 transition-all group">
                    <div className="w-12 h-12 bg-neutral-800/80 rounded-2xl flex items-center justify-center text-rose-400 mb-6 border border-neutral-700 group-hover:scale-110 transition-transform">
                        <Activity size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Real-time Sync</h3>
                    <p className="text-neutral-400 leading-relaxed font-light">Watch tasks move across your board instantly. Perfect synchronization across your entire team.</p>
                </div>

                <div className="flex-1 bg-neutral-900/40 backdrop-blur-xl p-8 rounded-3xl border border-neutral-800/50 hover:border-neutral-700/50 hover:bg-neutral-900/60 transition-all group lg:-translate-y-8">
                    <div className="w-12 h-12 bg-neutral-800/80 rounded-2xl flex items-center justify-center text-rose-400 mb-6 border border-neutral-700 group-hover:scale-110 transition-transform">
                        <Zap size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Lightning Fast</h3>
                    <p className="text-neutral-400 leading-relaxed font-light">Built for speed. Navigate between boards, update statuses, and add remarks with zero latency.</p>
                </div>

                <div className="flex-1 bg-neutral-900/40 backdrop-blur-xl p-8 rounded-3xl border border-neutral-800/50 hover:border-neutral-700/50 hover:bg-neutral-900/60 transition-all group">
                    <div className="w-12 h-12 bg-neutral-800/80 rounded-2xl flex items-center justify-center text-rose-400 mb-6 border border-neutral-700 group-hover:scale-110 transition-transform">
                        <ShieldCheck size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Role-based Security</h3>
                    <p className="text-neutral-400 leading-relaxed font-light">Granular permissions ensure clients see only their data, with dedicated staff views.</p>
                </div>
            </div>

        </div>
    );
};

export default Landing;
