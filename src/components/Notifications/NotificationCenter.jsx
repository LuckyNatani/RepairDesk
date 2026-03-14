import React, { useState } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

const NotificationCenter = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors focus:outline-none"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white border-2 border-white shadow-sm">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
                        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="font-bold text-slate-900 border-none outline-none">Notifications</h3>
                            {unreadCount > 0 && (
                                <button 
                                    onClick={markAllAsRead}
                                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                                >
                                    <CheckCheck size={14} /> Mark all read
                                </button>
                            )}
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto isolate overscroll-contain">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-slate-500 text-sm">
                                    <Bell className="mx-auto mb-3 opacity-20" size={32} />
                                    No new notifications
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {notifications.map(notif => (
                                        <div 
                                            key={notif.id} 
                                            className={`p-4 flex gap-3 transition-colors ${!notif.is_read ? 'bg-indigo-50/30' : 'hover:bg-slate-50'}`}
                                            onClick={() => !notif.is_read && markAsRead(notif.id)}
                                        >
                                            <div className="mt-0.5 shrink-0">
                                                {!notif.is_read ? (
                                                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shadow-[0_0_8px_rgba(99,102,241,0.6)] animate-pulse" />
                                                ) : (
                                                    <Check size={14} className="text-slate-300 mt-1" />
                                                )}
                                            </div>
                                            <div className="flex-1 cursor-pointer">
                                                <p className={`text-sm ${!notif.is_read ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                                                    {notif.message}
                                                </p>
                                                <span className="text-[10px] font-bold text-slate-400 mt-1.5 block uppercase tracking-wider">
                                                    {new Date(notif.created_at).toLocaleString(undefined, {
                                                        month: 'short', day: 'numeric', hour: 'numeric', minute:'2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationCenter;
