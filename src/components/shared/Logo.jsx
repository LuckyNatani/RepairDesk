import React from 'react';

const Logo = ({ className = "w-10 h-10", textClassName = "text-xl font-bold tracking-tight", textColor = "default" }) => (
    <div className="flex items-center gap-3 select-none group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-md">
        <div className={`${className} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300`}>
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* Slanted T */}
                <path 
                    d="M20 25 H65 L60 40 H48 L40 85 H25 L33 40 H20 Z" 
                    fill={textColor === 'white' ? 'white' : 'black'} 
                />
                
                {/* Slanted P (Teal) */}
                <path 
                    d="M48 25 H80 C90 25 92 38 90 48 C88 58 82 72 68 72 H53 L50 85 H36 L48 25 Z" 
                    fill="#00D1B2" 
                />
                
                {/* Cutout for P visibility (Matches background) */}
                <path 
                    d="M52 40 H74 C77 40 78 50 76 57 C74 62 68 62 65 62 H50 L52 40 Z" 
                    fill={textColor === 'white' ? '#0F172A' : '#FFFFFF'} 
                />
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
