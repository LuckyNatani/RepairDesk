import React from 'react';
import { Search } from 'lucide-react';

const EmptyState = ({ title, message, icon: Icon = Search }) => (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-gray-200 mb-6 border border-gray-100/50 shadow-inner">
            <Icon size={40} strokeWidth={1.5} />
        </div>
        <h3 className="text-xl font-black text-indigo-900 mb-2 tracking-tight uppercase">{title}</h3>
        <p className="text-gray-400 font-medium max-w-[240px] leading-relaxed text-sm">
            {message}
        </p>
    </div>
);

export default EmptyState;
