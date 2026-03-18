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
            {/* Desktop Sidebar — narrower, tighter */}
            <aside className="hidden md:flex flex-col w-56 fixed inset-y-0 left-0 bg-white border-r border-slate-100 z-50">
                <div className="px-4 py-4 flex items-center justify-between border-b border-slate-100">
                    <Logo />
                    <NotificationCenter />
                </div>

                <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
                    {navItems.map((item) => {
                        const active = location.pathname.startsWith(item.path);
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${active ? 'bg-primary-50 text-primary-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                            >
                                <item.icon
                                    size={16}
                                    className={active ? 'text-primary-600' : 'text-slate-400'}
                                    strokeWidth={active ? 2.5 : 2}
                                />
                                {item.label}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Footer — user info + logout */}
                <div className="px-3 py-3 border-t border-slate-100">
                    <div className="flex items-center gap-2.5 mb-2.5 px-1">
                        <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                            <User size={14} className="text-primary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-semibold text-slate-800 truncate">{user?.email?.split('@')[0]}</p>
                            <p className="text-[10px] text-slate-400 capitalize">{role}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 py-2 text-[12px] font-medium text-slate-500 hover:text-danger hover:bg-red-50 rounded-lg transition-all duration-200 border border-transparent hover:border-red-100 tap-highlight"
                    >
                        <LogOut size={13} />
                        Sign out
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Tab Bar — compact 52px height */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
                <nav className="nav-floating flex items-stretch">
                    {navItems.map((item) => {
                        const active = location.pathname.startsWith(item.path);
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={`flex flex-col items-center justify-center flex-1 gap-0.5 transition-all duration-200 tap-highlight ${active ? 'text-primary-600' : 'text-slate-400'}`}
                            >
                                <div className={`p-1.5 rounded-xl transition-all duration-200 ${active ? 'bg-primary-100/80' : ''}`}>
                                    <item.icon size={18} strokeWidth={active ? 2.5 : 2} />
                                </div>
                                <span className="text-[9px] font-semibold tracking-tight">{item.label}</span>
                            </NavLink>
                        );
                    })}

                    <div className="flex flex-col items-center justify-center flex-1 gap-0.5">
                        <NotificationCenter />
                    </div>

                    <button
                        onClick={logout}
                        className="flex flex-col items-center justify-center flex-1 gap-0.5 text-slate-400 hover:text-danger transition-all duration-200 tap-highlight"
                    >
                        <div className="p-1.5">
                            <LogOut size={18} strokeWidth={2} />
                        </div>
                        <span className="text-[9px] font-semibold tracking-tight">Out</span>
                    </button>
                </nav>
            </div>
        </>
    );
};

export default Sidebar;
