import React from 'react';
import BottomNavigation from './Sidebar'; // It's actually BottomNavigation now
import { useAuth } from '../../hooks/useAuth';
import NotificationCenter from '../Notifications/NotificationCenter';

const AppLayout = ({ children }) => {
    const { user } = useAuth();
    
    return (
        <div className="min-h-screen bg-surface font-body text-on-surface antialiased pb-24 selection:bg-primary-100 selection:text-primary-700">
            {/* TopAppBar */}
            <header className="bg-surface/70 backdrop-blur-3xl sticky top-0 z-40 border-b border-transparent transition-all shadow-[0_8px_32px_rgba(25,28,30,0.04)]">
                <div className="flex justify-between items-center w-full px-6 py-4 max-w-2xl mx-auto">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary-container overflow-hidden active:scale-95 transition-transform duration-200 flex items-center justify-center text-primary font-headline font-bold">
                            {user?.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <h1 className="font-headline font-semibold text-lg tracking-tight text-primary">Hello!</h1>
                    </div>
                    <div className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors active:scale-95 duration-200">
                        <NotificationCenter />
                    </div>
                </div>
            </header>

            <main className="px-6 pt-6 space-y-8 max-w-2xl mx-auto w-full">
                {children}
            </main>

            <BottomNavigation />
        </div>
    );
};

export default AppLayout;
