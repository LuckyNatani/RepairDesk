import React from 'react';

const Logo = ({ className = "w-10 h-10", textClassName = "text-xl font-bold tracking-tight" }) => (
    <div className="flex items-center gap-2 select-none group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-md">
        <div className={`${className} bg-[#002B36] rounded-lg p-1.5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200 shadow-sm shadow-black/10`}>
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* Modern TP letters using cuts like X/Anthropic style */}
                <path d="M20 25 H80 V38 H56 V85 H44 V38 H20 V25Z" fill="white" />
                <path d="M55 45 H75 C85 45 85 55 85 60 C85 65 85 75 75 75 H55 V45ZM55 55 V65 H75 C78 65 78 55 75 55 H55Z" fill="#00D1B2" />
                {/* Abstract cut/slash */}
                <rect x="52" y="20" width="4" height="70" transform="rotate(15 54 45)" fill="#002B36" />
            </svg>
        </div>
        {textClassName && (
            <span className={textClassName}>
                <span style={{ color: '#002B36' }}>Task</span>
                <span style={{ color: '#00D1B2' }}>Pod</span>
            </span>
        )}
    </div>
);

export default Logo;
