import React from 'react';

const Logo = ({ className = "w-8 h-8", textClassName = "text-xl font-bold tracking-tight" }) => (
    <div className="flex items-center gap-2 select-none group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-md">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className={`shrink-0 ${className} group-hover:scale-105 transition-transform duration-200`}>
            {/* Hexagonal shape with abstract S/link */}
            <path d="M50 5 L89 27 L89 72 L50 95 L11 72 L11 27 Z" fill="#00D1B2" />
            <path d="M30 45 L50 35 L70 45 L70 55 L50 65 L30 55 Z" fill="white" fillOpacity="0.2" />
            <path d="M35 50 C35 40, 65 40, 65 50 C65 60, 35 60, 35 70 C35 80, 65 80, 65 70" 
                  stroke="white" strokeWidth="8" strokeLinecap="round" fill="none" />
        </svg>
        {textClassName && (
            <span className={textClassName}>
                <span style={{ color: '#002B36' }}>Task</span>
                <span style={{ color: '#00D1B2' }}>Pod</span>
            </span>
        )}
    </div>
);

export default Logo;
