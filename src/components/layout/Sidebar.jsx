import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Logo from '../shared/Logo';
import { LayoutDashboard, BarChart3, Shield, CheckSquare, LogOut, User, Bell } from 'lucide-react';
import NotificationCenter from '../Notifications/NotificationCenter';

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
                <div className="p-8 flex items-center justify-between">
                    <Logo />
                    <NotificationCenter />
                </div>
                
                <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto mt-2">
                    {navItems.map((item) => {
                        const active = location.pathname.startsWith(item.path);
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-[14px] font-semibold transition-all duration-300 ${active ? 'bg-primary-50 text-primary-700 shadow-sm shadow-primary-100/50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                            >
                                <div className={`p-1 rounded-lg transition-colors ${active ? 'bg-primary-100' : 'bg-transparent'}`}>
                                    <item.icon size={19} className={active ? 'text-primary-600' : 'text-slate-400'} strokeWidth={active ? 2.5 : 2} />
                                </div>
                                {item.label}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-slate-100/60 bg-white/50">
                    <div className="flex items-center gap-3.5 w-full mb-6 px-2">
                        <div className="w-11 h-11 rounded-2xl bg-primary-100 flex items-center justify-center shrink-0 border border-primary-50 shadow-sm">
                            <User size={20} className="text-primary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-bold text-slate-800 truncate">{user?.email?.split('@')[0]}</p>
                            <p className="text-[12px] text-slate-500 font-medium capitalize tracking-tight">{role}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2.5 py-3.5 text-[14px] font-bold text-slate-600 hover:text-danger hover:bg-red-50 rounded-2xl transition-all duration-300 border border-transparent shadow-sm hover:border-red-100 tap-highlight"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Tab Bar (Redesigned Floating Native App Feel) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
                <nav className="nav-floating flex items-center justify-between">
                    {navItems.map((item) => {
                        const active = location.pathname.startsWith(item.path);
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={`flex flex-col items-center justify-center flex-1 py-1 space-y-1 relative transition-all duration-300 tap-highlight ${active ? 'text-primary-600 scale-110' : 'text-slate-400 opacity-70'}`}
                            >
                                <div className={`p-2 rounded-2xl transition-all duration-300 ${active ? 'bg-primary-100/80 shadow-sm' : ''}`}>
                                    <item.icon size={22} strokeWidth={active ? 2.5 : 2} />
                                </div>
                                {active && (
                                    <span className="text-[10px] font-bold tracking-tight animate-in fade-in slide-in-from-bottom-1 duration-200">
                                        {item.label}
                                    </span>
                                )}
                            </NavLink>
                        );
                    })}
                    
                    <div className="flex flex-col items-center justify-center flex-1 py-1 space-y-1">
                        <NotificationCenter />
                    </div>

                    <button
                        onClick={logout}
                        className="flex flex-col items-center justify-center flex-1 py-1 space-y-1 text-slate-400 hover:text-danger transition-all duration-300 tap-highlight"
                    >
                        <div className="p-2">
                            <LogOut size={22} strokeWidth={2} />
                        </div>
                    </button>
                </nav>
            </div>
        </>
    );
};

export default Sidebar;
