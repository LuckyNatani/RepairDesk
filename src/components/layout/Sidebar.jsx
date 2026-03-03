import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Logo from '../shared/Logo';
import { LayoutDashboard, BarChart3, Shield, CheckSquare, LogOut, User } from 'lucide-react';

const Sidebar = () => {
    const { role, user, logout } = useAuth();
    const location = useLocation();
    const isOwner = role === 'owner';
    const isSuperAdmin = role === 'superadmin';

    let navItems = [];
    if (isSuperAdmin) {
        navItems = [
            { path: '/superadmin', icon: Shield, label: 'Super Admin' }
        ];
    } else if (isOwner) {
        navItems = [
            { path: '/owner', icon: LayoutDashboard, label: 'Home' },
            { path: '/analytics', icon: BarChart3, label: 'Analytics' },
            { path: '/admin', icon: Shield, label: 'Admin' }
        ];
    } else {
        navItems = [
            { path: '/staff', icon: CheckSquare, label: 'Tasks' }
        ];
    }

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-white border-r border-slate-100/60 z-50">
                <div className="p-6 flex items-center justify-center">
                    <Logo />
                </div>
                <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-4">
                    {navItems.map((item) => {
                        const active = location.pathname.startsWith(item.path);
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${active ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                            >
                                <item.icon size={20} className={active ? 'text-indigo-600' : 'text-slate-400'} strokeWidth={active ? 2.5 : 2} />
                                {item.label}
                            </NavLink>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-slate-100/60 bg-white/50">
                    <div className="flex items-center gap-3 w-full mb-4 px-2">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 border border-indigo-50">
                            <User size={16} className="text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{user?.email?.split('@')[0]}</p>
                            <p className="text-xs text-slate-500 capitalize tracking-wide">{role}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent shadow-sm hover:border-red-100"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Tab Bar (Native App Feel) */}
            <nav className="md:hidden glass-panel fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around pb-safe pt-2 px-2 border-t border-slate-200/50 rounded-t-3xl shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.1)]">
                {navItems.map((item) => {
                    const active = location.pathname.startsWith(item.path);
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center justify-center w-full py-2 space-y-1 relative transition-colors ${active ? 'text-indigo-600' : 'text-slate-400'}`}
                        >
                            <div className={`p-1.5 rounded-full ${active ? 'bg-indigo-50' : ''}`}>
                                <item.icon size={22} strokeWidth={active ? 2.5 : 2} className={active ? 'text-indigo-600' : 'text-slate-400'} />
                            </div>
                            <span className="text-[10px] font-semibold tracking-wide">{item.label}</span>
                        </NavLink>
                    );
                })}
                <button
                    onClick={logout}
                    className="flex flex-col items-center justify-center w-full py-2 space-y-1 text-slate-400 hover:text-red-500 transition-colors"
                >
                    <div className="p-1.5">
                        <LogOut size={22} strokeWidth={2} />
                    </div>
                    <span className="text-[10px] font-semibold tracking-wide">Logout</span>
                </button>
            </nav>
        </>
    );
};

export default Sidebar;
