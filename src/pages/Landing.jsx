import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { PenTool, CheckCircle2, FileText, ClipboardList, MessageSquare, ArrowRight } from 'lucide-react';

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
        <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-primary-100 selection:text-primary-700">
            {/* TopAppBar */}
            <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="text-xl font-black tracking-tighter text-primary flex items-center gap-2 font-headline">
                        <PenTool className="w-6 h-6 text-primary" strokeWidth={2.5} />
                        RepairDesk
                    </div>
                    <nav className="hidden md:flex gap-8 items-center">
                        <a className="text-primary font-bold font-headline transition-opacity hover:opacity-80" href="#features">Features</a>
                        <a className="text-on-surface-variant font-headline transition-opacity hover:opacity-80" href="#pricing">Pricing</a>
                    </nav>
                    <Link
                        to="/login"
                        className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-6 py-2 rounded-full font-bold text-sm tracking-tight active:scale-95 duration-200 transition-opacity hover:opacity-90 shadow-md shadow-primary/20"
                    >
                        Try Now
                    </Link>
                </div>
            </header>

            <main className="pt-32 pb-20 overflow-hidden">
                {/* Hero Section */}
                <section className="max-w-7xl mx-auto px-6 mb-24">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <h1 className="font-headline text-5xl md:text-7xl font-extrabold text-on-surface leading-[1.1] tracking-tight">
                                Manage your repair shop <span className="text-primary">effortlessly</span>
                            </h1>
                            <p className="text-on-surface-variant text-lg md:text-xl leading-relaxed max-w-lg">
                                The all-in-one software for mobile, laptop, and electronics repair shops. Built for speed, designed for clarity.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Link
                                    to="/login"
                                    className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-10 py-4 rounded-full font-bold text-lg active:scale-95 duration-200 shadow-[0_8px_32px_rgba(36,56,156,0.2)] flex items-center justify-center"
                                >
                                    Start for Free
                                </Link>
                                <button className="bg-surface-container-highest text-on-surface px-10 py-4 rounded-full font-bold text-lg active:scale-95 duration-200">
                                    Book Demo
                                </button>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="aspect-square rounded-2xl bg-gradient-to-tr from-primary-container/20 to-tertiary-container/10 flex items-center justify-center relative overflow-hidden">
                                {/* Abstract Geometric Art */}
                                <div className="absolute inset-0 opacity-30">
                                    <div className="absolute top-10 left-10 w-32 h-32 bg-primary rounded-full blur-3xl"></div>
                                    <div className="absolute bottom-20 right-10 w-48 h-48 bg-primary-fixed-dim rounded-full blur-3xl"></div>
                                </div>
                                <div className="w-4/5 h-4/5 rounded-2xl bg-surface-container-lowest shadow-[0_8px_32px_rgba(13,30,37,0.08)] flex items-center justify-center p-8 relative z-10">
                                    <div className="w-full space-y-6">
                                        <div className="h-4 w-1/3 bg-surface-container-high rounded-full"></div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="h-24 bg-surface-container rounded-xl"></div>
                                            <div className="h-24 bg-surface-container rounded-xl"></div>
                                        </div>
                                        <div className="h-32 bg-primary-container/5 rounded-xl border border-primary/10 flex items-center justify-center">
                                            <PenTool className="text-primary w-10 h-10" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Bento Grid */}
                <section id="features" className="max-w-7xl mx-auto px-6 mb-32">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                        <div>
                            <span className="text-primary font-bold tracking-widest text-xs uppercase font-label">Capabilities</span>
                            <h2 className="font-headline text-4xl font-bold mt-2">Engineered for Precision</h2>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-[0_8px_32px_rgba(13,30,37,0.04)] group hover:bg-primary transition-colors duration-300">
                            <div className="w-14 h-14 rounded-full bg-primary-container/10 flex items-center justify-center mb-6 group-hover:bg-white/20">
                                <FileText className="text-primary group-hover:text-white transition-colors h-6 w-6" />
                            </div>
                            <h3 className="font-headline text-xl font-bold mb-4 group-hover:text-white transition-colors">Quick Billing</h3>
                            <p className="text-on-surface-variant group-hover:text-white/80 transition-colors">Generate professional invoices in seconds. Support for multiple tax brackets and discounts.</p>
                        </div>
                        {/* Feature 2 */}
                        <div className="bg-surface-container-low p-8 rounded-2xl group hover:bg-primary transition-colors duration-300">
                            <div className="w-14 h-14 rounded-full bg-primary-container/10 flex items-center justify-center mb-6 group-hover:bg-white/20">
                                <ClipboardList className="text-primary group-hover:text-white transition-colors h-6 w-6" />
                            </div>
                            <h3 className="font-headline text-xl font-bold mb-4 group-hover:text-white transition-colors">Job Card Management</h3>
                            <p className="text-on-surface-variant group-hover:text-white/80 transition-colors">Track every repair step. From intake to delivery, keep your workflow organized and transparent.</p>
                        </div>
                        {/* Feature 3 */}
                        <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-[0_8px_32px_rgba(13,30,37,0.04)] group hover:bg-primary transition-colors duration-300">
                            <div className="w-14 h-14 rounded-full bg-primary-container/10 flex items-center justify-center mb-6 group-hover:bg-white/20">
                                <MessageSquare className="text-primary group-hover:text-white transition-colors h-6 w-6" />
                            </div>
                            <h3 className="font-headline text-xl font-bold mb-4 group-hover:text-white transition-colors">Real-time SMS Alerts</h3>
                            <p className="text-on-surface-variant group-hover:text-white/80 transition-colors">Automatically notify customers when their device is ready. Reduce follow-up calls by 60%.</p>
                        </div>
                    </div>
                </section>

                {/* Pricing Card Section */}
                <section id="pricing" className="max-w-7xl mx-auto px-6 mb-32">
                    <div className="bg-primary-container rounded-[2rem] overflow-hidden relative shadow-[0_16px_40px_rgba(36,56,156,0.15)]">
                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 p-12 md:p-20">
                            <div className="flex flex-col justify-center text-on-primary">
                                <h2 className="font-headline text-4xl md:text-5xl font-bold mb-6">Simple Pricing</h2>
                                <p className="text-primary-fixed-dim text-lg mb-8 max-w-md">No hidden fees, no complicated tiers. One plan that grows with your business.</p>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <CheckCircle2 className="text-primary-fixed w-6 h-6" />
                                        <span className="text-on-primary-container mt-0.5">Unlimited Invoices</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <CheckCircle2 className="text-primary-fixed w-6 h-6" />
                                        <span className="text-on-primary-container mt-0.5">Customer Portal</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <CheckCircle2 className="text-primary-fixed w-6 h-6" />
                                        <span className="text-on-primary-container mt-0.5">Inventory Tracking</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-surface-container-lowest rounded-2xl p-10 flex flex-col items-center justify-center text-center shadow-[0_8px_32px_rgba(13,30,37,0.08)]">
                                <span className="bg-primary-container/10 text-primary font-bold px-4 py-1 rounded-full text-[10px] uppercase tracking-widest mb-4">Annual Plan</span>
                                <div className="mb-2">
                                    <span className="text-on-surface text-4xl md:text-6xl font-black font-headline">₹5000</span>
                                    <span className="text-on-surface-variant text-lg">/ year</span>
                                </div>
                                <p className="text-on-surface-variant font-medium mb-8">For up to 10 employees</p>
                                <Link to="/login" className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary py-4 rounded-full font-bold text-lg active:scale-95 duration-200 flex justify-center">
                                    Get Started Now
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="font-headline text-3xl sm:text-4xl font-bold mb-6 text-on-surface">Ready to grow your shop?</h2>
                    <p className="text-on-surface-variant text-base sm:text-lg mb-10">Join thousands of repair professionals who rely on RepairDesk every day.</p>
                    <button className="bg-surface-container-high text-on-surface px-12 py-4 rounded-full font-bold text-lg active:scale-95 duration-200 border-2 border-transparent hover:border-primary/20 transition-all">
                        Contact Us
                    </button>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-primary w-full py-12">
                <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between gap-8 items-center md:items-start">
                    <div className="flex flex-col gap-4">
                        <div className="text-on-primary font-black text-lg font-headline flex items-center gap-2">
                            <PenTool className="w-5 h-5 text-on-primary" strokeWidth={2.5} />
                            RepairDesk
                        </div>
                        <p className="text-primary-fixed-dim font-body text-sm leading-relaxed max-w-xs text-center md:text-left">
                            The Utility Editorial. Streamlining repair management for the modern technician.
                        </p>
                    </div>
                    <div className="flex gap-8 text-sm font-body">
                        <a className="text-primary-fixed-dim hover:text-on-primary transition-colors" href="#">Features</a>
                        <a className="text-primary-fixed-dim hover:text-on-primary transition-colors" href="#">Pricing</a>
                        <a className="text-primary-fixed-dim hover:text-on-primary transition-colors" href="#">Contact</a>
                    </div>
                    <div className="text-primary-fixed-dim text-sm font-body">
                        © 2026 RepairDesk.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
