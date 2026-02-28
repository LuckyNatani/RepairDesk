import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const styles = {
        success: 'bg-green-600 text-white shadow-green-600/20',
        error: 'bg-red-600 text-white shadow-red-600/20',
    };

    return (
        <div className={`fixed bottom-6 right-6 flex items-center p-4 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 z-[60] ${styles[type]}`}>
            <div className="mr-3">
                {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            </div>
            <p className="font-bold text-sm pr-4">{message}</p>
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                <X size={16} />
            </button>
        </div>
    );
};

export default Toast;
