import React from 'react';

const Logo = ({ className = "w-8 h-8", textClassName = "text-xl font-semibold tracking-tight text-slate-900" }) => (
    <div className="flex items-center gap-2 select-none group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-md">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className={`shrink-0 ${className} group-hover:scale-105 transition-transform duration-200`}>
            <rect width="100" height="100" rx="24" fill="#6366F1" />
            <path d="M32 40 L32 68" stroke="#FFFFFF" strokeWidth="12" strokeLinecap="round" />
            <path d="M32 32 L68 32" stroke="#FFFFFF" strokeWidth="12" strokeLinecap="round" />
            <path d="M68 32 L68 56 C68 62.627 62.627 68 56 68 L48 68" stroke="#FFFFFF" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
        {textClassName && <span className={textClassName}>TaskPod</span>}
    </div>
);

export default Logo;
