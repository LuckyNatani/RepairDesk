import React from 'react';
import Sidebar from './Sidebar';

const AppLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 md:ml-64 pb-20 md:pb-0">
                {children}
            </div>
        </div>
    );
};

export default AppLayout;
