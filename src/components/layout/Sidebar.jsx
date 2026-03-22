import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LayoutDashboard, Users, CheckSquare, Settings, LogOut, Search } from 'lucide-react';
import NotificationCenter from '../Notifications/NotificationCenter';

const BottomNavigation = () => {
    const { role, user, logout } = useAuth();
    const location = useLocation();
    const isOwner = role === 'owner';
    const isSuperAdmin = role === 'superadmin';

    let navItems = [];
    if (isSuperAdmin) {
        navItems = [
            { path: '/superadmin', icon: LayoutDashboard, label: 'Admin' }
        ];
    } else if (isOwner) {
        navItems = [
            { path: '/owner', icon: LayoutDashboard, label: 'Home' },
            { path: '/analytics', icon: Search, label: 'Search' }, // Kept simple
            { path: '#', icon: Users, label: 'Customers' },
            { path: '/admin', icon: Settings, label: 'Settings' }
        ];
    } else {
        navItems = [
            { path: '/staff', icon: CheckSquare, label: 'Tasks' },
            { path: '/settings', icon: Settings, label: 'Settings' }
        ];
    }

    return (
        <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-2 pb-safe pt-2 bg-surface/80 backdrop-blur-3xl z-50 rounded-t-none border-t border-outline-variant/15 shadow-[0_-4px_24px_rgba(25,28,30,0.02)]">
            {navItems.map((item) => {
                const active = location.pathname.startsWith(item.path) && item.path !== '#';
                return (
                    <NavLink
                        key={item.label}
                        to={item.path}
                        className={`flex flex-col items-center justify-center px-4 py-2 active:scale-95 transition-all duration-200 ease-out rounded-2xl ${active ? 'bg-primary-container/20 text-primary font-bold' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'}`}
                    >
                        <item.icon size={22} fill={active ? "currentColor" : "none"} strokeWidth={active ? 2.5 : 2} />
                        <span className="font-label text-[10px] uppercase tracking-wider mt-1 font-medium">{item.label}</span>
                    </NavLink>
                );
            })}
        </nav>
    );
};

export default BottomNavigation;
