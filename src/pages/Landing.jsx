import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, CheckCircle, Zap } from 'lucide-react';

const Landing = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header / Nav */}
            <header className="px-6 py-4 flex items-center justify-between bg-white border-b border-gray-100 sticky top-0 z-50">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                        <Layers size={18} strokeWidth={2.5} />
                    </div>
                    <span className="font-extrabold text-gray-900 tracking-tight text-xl">TaskPod</span>
                </div>
                <div>
                    <Link
                        to="/login"
                        className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm"
                    >
                        Login
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 pb-32">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-8 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                    <span>The Operating System for Work</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight max-w-4xl mb-6">
                    Manage Tasks,<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                        Deliver Outcomes
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-gray-500 max-w-2xl mb-12 leading-relaxed">
                    A unified task management platform that helps your team stay aligned, track progress instantly, and execute faster from anywhere.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        to="/login"
                        className="px-8 py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all duration-200 flex items-center group w-full sm:w-auto justify-center"
                    >
                        Sign in to Workspace
                        <Zap size={18} className="ml-2 group-hover:scale-110 transition-transform text-yellow-400" />
                    </Link>
                </div>

                {/* Features Quick Look */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mt-24">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-left">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                            <Layers size={20} />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">Real-time Kanban</h3>
                        <p className="text-gray-500 text-sm">Visualize your team's workflow and move tasks across stages instantly without refreshing.</p>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-left">
                        <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                            <Zap size={20} />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">Push Notifications</h3>
                        <p className="text-gray-500 text-sm">Keep your field agents and team members informed instantly on their devices.</p>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-left">
                        <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4">
                            <CheckCircle size={20} />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">Role-based Access</h3>
                        <p className="text-gray-500 text-sm">Secure your workspace. Managers assign, while workers focus purely on execution.</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Landing;
