import React from 'react';
import Sidebar from './Sidebar';

const AppLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-[#F7F8FA] flex flex-col md:flex-row w-full overflow-x-hidden pt-safe pb-safe">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 md:ml-56 w-full">
                {/* pb-16 on mobile to clear the 52px bottom nav */}
                <main className="flex-1 w-full mx-auto max-w-7xl pb-16 md:pb-6 pt-3 md:pt-6 px-3 sm:px-5 lg:px-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AppLayout;
