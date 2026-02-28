import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Logo from '../shared/Logo';
import { LayoutDashboard, BarChart3, Shield, CheckSquare, LogOut, User } from 'lucide-react';

const Sidebar = () => {
    const { role, user, logout } = useAuth();
    const location = useLocation();
    const isOwner = role === 'owner';

    const navItems = isOwner ? [
        { path: '/owner', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/analytics', icon: BarChart3, label: 'Analytics' },
        { path: '/admin', icon: Shield, label: 'Team Admin' }
    ] : [
        { path: '/staff', icon: CheckSquare, label: 'My Tasks' }
    ];

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-white border-r border-slate-200 z-50">
                <div className="p-6 border-b border-slate-100 flex items-center justify-center">
                    <Logo />
                </div>
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const active = location.pathname.startsWith(item.path);
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                            >
                                <item.icon size={18} className={active ? 'text-indigo-600' : 'text-slate-400'} />
                                {item.label}
                            </NavLink>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-slate-100">
                    <div className="flex items-center gap-3 w-full mb-4">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                            <User size={14} className="text-slate-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{user?.email?.split('@')[0]}</p>
                            <p className="text-xs text-slate-500 capitalize">{role}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-slate-200 hover:border-red-100 shadow-sm"
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 flex items-center justify-around drop-shadow-2xl">
                {navItems.map((item) => {
                    const active = location.pathname.startsWith(item.path);
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center justify-center w-full py-3 space-y-1 ${active ? 'text-indigo-600' : 'text-slate-500'}`}
                        >
                            <item.icon size={20} className={active ? 'text-indigo-600' : 'text-slate-400'} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </NavLink>
                    );
                })}
                <button
                    onClick={logout}
                    className="flex flex-col items-center justify-center w-full py-3 space-y-1 text-slate-500 hover:text-red-600"
                >
                    <LogOut size={20} className="text-slate-400" />
                    <span className="text-[10px] font-medium">Logout</span>
                </button>
            </nav>
        </>
    );
};

export default Sidebar;
