import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Landing from './pages/Landing';
import Login from './pages/Login';
import OwnerDashboard from './pages/OwnerDashboard';
import StaffView from './pages/StaffView';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import AdminPanel from './pages/AdminPanel';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, role, loading } = useAuth();

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-900 rounded-full animate-spin mb-4"></div>
            <p className="font-bold text-gray-500 animate-pulse">Loading...</p>
        </div>
    );

    if (!user) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/login" replace />;

    return children;
};

const AppContent = () => {
    return (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />

            <Route path="/owner" element={
                <ProtectedRoute allowedRoles={['owner']}>
                    <OwnerDashboard />
                </ProtectedRoute>
            } />

            <Route path="/staff" element={
                <ProtectedRoute allowedRoles={['staff']}>
                    <StaffView />
                </ProtectedRoute>
            } />

            <Route path="/analytics" element={
                <ProtectedRoute allowedRoles={['owner']}>
                    <AnalyticsDashboard />
                </ProtectedRoute>
            } />

            <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['owner']}>
                    <AdminPanel />
                </ProtectedRoute>
            } />
        </Routes>
    );
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppContent />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
