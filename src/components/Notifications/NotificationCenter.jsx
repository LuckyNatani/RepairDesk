import React, { useState } from 'react';
import { Bell, Check, CheckCheck, X, Sparkles } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

const NotificationCenter = () => {
    const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50/50 rounded-2xl transition-all tap-highlight outline-none"
            >
                <Bell size={22} className={unreadCount > 0 ? "animate-pulse" : ""} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4.5 w-4.5 min-w-[18px] h-[18px] items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white border-2 border-white shadow-lg shadow-red-200">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-3 w-80 sm:w-[400px] bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                        
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50/50">
                            <div>
                                <h3 className="text-base font-black text-slate-900 tracking-tight">Notifications</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
                                    {unreadCount} UNREAD UPDATES
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <button 
                                        onClick={markAllRead}
                                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-xl transition-all tap-highlight"
                                        title="Mark all as read"
                                    >
                                        <CheckCheck size={18} />
                                    </button>
                                )}
                                <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* List */}
                        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar overscroll-contain pb-4">
                            {notifications.length === 0 ? (
                                <div className="py-20 text-center px-10">
                                    <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 border border-slate-100 italic">
                                        <Sparkles size={24} className="text-slate-200" />
                                    </div>
                                    <h4 className="text-[14px] font-black text-slate-400 uppercase tracking-widest">Inbox Zero</h4>
                                    <p className="text-[12px] font-semibold text-slate-300 mt-2">You're all caught up with the latest updates from the shop.</p>
                                </div>
                            ) : (
                                <div className="p-2 space-y-1">
                                    {notifications.map(notif => (
                                        <div 
                                            key={notif.id} 
                                            className={`group relative p-4 flex gap-4 rounded-[1.5rem] transition-all cursor-pointer ${
                                                !notif.is_read 
                                                ? 'bg-primary-50/40 hover:bg-primary-50/60' 
                                                : 'hover:bg-slate-50'
                                            }`}
                                            onClick={() => !notif.is_read && markRead(notif.id)}

                                        >
                                            <div className="shrink-0 pt-1">
                                                {!notif.is_read ? (
                                                    <div className="w-2.5 h-2.5 rounded-full bg-primary-500 shadow-[0_0_12px_rgba(59,130,246,0.5)] ring-4 ring-white" />
                                                ) : (
                                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-[14px] leading-relaxed transition-all ${
                                                    !notif.is_read 
                                                    ? 'font-black text-slate-900' 
                                                    : 'font-medium text-slate-500'
                                                }`}>
                                                    {notif.message}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                        {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    <span className="text-[10px] text-slate-200">•</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                        {new Date(notif.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>
                                            {!notif.is_read && (
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center shrink-0">
                                                    <div className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100">
                                                        <Check size={14} className="text-primary-500" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer Link */}
                        {notifications.length > 0 && (
                            <div className="p-4 bg-slate-50/50 border-t border-slate-50 text-center">
                                <button className="text-[11px] font-black text-primary-600 uppercase tracking-widest hover:text-primary-700 transition-colors tap-highlight">
                                    View Activity Dashboard
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export { NotificationCenter };

export function NotificationRow({ notification, onClick }) {
    return (
        <div 
            onClick={onClick} 
            className={`flex items-start gap-3 p-3 transition-colors cursor-pointer border-b border-slate-50 ${
                !notification.is_read ? 'bg-primary-50/30' : 'bg-white'
            }`}
        >
            <div className="mt-1 flex-shrink-0">
                {!notification.is_read ? (
                    <div className="w-2 h-2 rounded-full bg-primary-500" />
                ) : (
                    <div className="w-2 h-2 rounded-full bg-slate-200" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-sm leading-snug ${!notification.is_read ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                    {notification.message}
                </p>
                <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(notification.created_at).toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        </div>
    );
}

export default NotificationCenter;

