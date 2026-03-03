import React from 'react';
import { Search } from 'lucide-react';

const EmptyState = ({ title, message, icon: Icon = Search }) => (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6 border border-slate-100/50 shadow-sm">
            <Icon size={40} strokeWidth={1.5} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">{title}</h3>
        <p className="text-slate-500 font-medium max-w-[240px] leading-relaxed text-sm">
            {message}
        </p>
    </div>
);

export default EmptyState;
