import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, User, LayoutDashboard, BarChart3, Shield } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const { user, role, logout } = useAuth();
    const location = useLocation();

    const isOwner = role === 'owner';

    const NavLink = ({ to, icon: Icon, label }) => {
        const active = location.pathname === to;
        return (
            <Link
                to={to}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-black transition-all ${active ? 'bg-indigo-900 text-white shadow-lg shadow-indigo-900/20' : 'text-gray-400 hover:text-indigo-900 hover:bg-gray-50'}`}
            >
                <Icon size={16} />
                <span className="hidden sm:inline">{label}</span>
            </Link>
        );
    };

    return (
        <nav className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-6">
                    <Link to={isOwner ? "/owner" : "/staff"} className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-indigo-900 rounded-lg flex items-center justify-center text-white font-black text-xs">RD</div>
                        <span className="font-extrabold text-indigo-900 tracking-tight text-lg">RepairDesk</span>
                    </Link>

                    {isOwner && (
                        <div className="hidden md:flex items-center space-x-2 border-l border-gray-100 pl-6 ml-2">
                            <NavLink to="/owner" icon={LayoutDashboard} label="DASHBOARD" />
                            <NavLink to="/analytics" icon={BarChart3} label="ANALYTICS" />
                            <NavLink to="/admin" icon={Shield} label="ADMIN" />
                        </div>
                    )}
                </div>

                <div className="flex items-center space-x-4">
                    <div className="hidden md:flex items-center space-x-1 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                        <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center">
                            <User size={12} className="text-indigo-600" />
                        </div>
                        <span className="text-xs font-bold text-gray-700 capitalize">{role}: {user?.email?.split('@')[0]}</span>
                    </div>

                    <button
                        onClick={logout}
                        className="p-2 hover:bg-red-50 hover:text-red-600 text-gray-400 rounded-lg transition-colors group"
                        title="Logout"
                    >
                        <LogOut size={20} className="group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
