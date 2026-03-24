import React from 'react';

const Logo = ({ className = "w-10 h-10", textClassName = "text-xl font-bold tracking-tight", textColor = "default" }) => (
    <div className="flex items-center gap-3 select-none group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-md">
        <div className={`${className} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300`}>
            <img 
                src="/taskpod_logo.png" 
                alt="TaskPod Logo" 
                className="w-full h-full object-contain"
            />
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
