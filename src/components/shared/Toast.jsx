import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const styles = {
        success: 'bg-emerald-600/95 text-white',
        error: 'bg-red-600/95 text-white',
    };

    return (
        <div className={`fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 flex items-center px-4 py-3 rounded-full shadow-[0_8px_30px_-12px_rgba(0,0,0,0.2)] backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300 z-[100] border border-white/20 min-w-[300px] justify-between ${styles[type]}`}>
            <div className="flex items-center">
                <div className="mr-3 shrink-0">
                    {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                </div>
                <p className="font-semibold text-sm tracking-wide">{message}</p>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full transition-colors shrink-0 ml-4">
                <X size={16} />
            </button>
        </div>
    );
};

export default Toast;
