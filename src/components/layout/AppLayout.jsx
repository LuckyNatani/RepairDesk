import React from 'react';
import Sidebar from './Sidebar';

const AppLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-[#F9FAFB] flex flex-col md:flex-row w-full overflow-x-hidden pt-safe pb-safe">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 md:ml-64 w-full">
                {/* Extra padding bottom on mobile to account for the fixed bottom navigation bar */}
                <main className="flex-1 w-full mx-auto max-w-7xl pb-24 md:pb-8 pt-4 md:pt-8 px-4 sm:px-6 lg:px-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AppLayout;
