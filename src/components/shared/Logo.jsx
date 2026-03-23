import React from 'react';

const Logo = ({ className = "w-10 h-10", textClassName = "text-xl font-bold tracking-tight", textColor = "default" }) => (
    <div className="flex items-center gap-3 select-none group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-md">
        <div className={`${className} bg-[#002B36] rounded-2xl p-1.5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-black/10`}>
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* 7 Shape (White) */}
                <path d="M22 30 H60 L48 80 H35 L45 38 H22 Z" fill="white" />
                
                {/* P Shape (Teal) */}
                <path d="M52 30 H75 C85 30 85 45 85 50 C85 55 85 70 75 70 H52 V30 Z" fill="#00D1B2" />
                <path d="M52 40 V60 H73 C76 60 76 40 73 40 H52 Z" fill="#002B36" />

                {/* Keyhole Cut (Navy) */}
                <circle cx="50" cy="50" r="8" fill="#002B36" />
                <path d="M50 50 L56 70 H44 L50 50 Z" fill="#002B36" />
            </svg>
        </div>
        {textClassName && (
            <span className={`${textClassName} tracking-tight`}>
                <span style={{ color: textColor === 'white' ? '#fff' : '#000000' }}>Task</span>
                <span style={{ color: '#00D1B2' }}>Pod</span>
            </span>
        )}
    </div>
);

export default Logo;
