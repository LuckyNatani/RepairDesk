import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Landing from './pages/Landing';
import Login from './pages/Login';
import OwnerDashboard from './pages/OwnerDashboard';
import StaffView from './pages/StaffView';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import AdminPanel from './pages/AdminPanel';
import SuperAdminPanel from './pages/SuperAdminPanel';
import AppLayout from './components/layout/AppLayout';

// Helper to get the correct home route for a role
const getRoleHome = (role) => {
    if (role === 'superadmin') return '/superadmin';
    if (role === 'owner') return '/owner';
    if (role === 'staff') return '/staff';
    return '/login';
};

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
    // Redirect to correct home page instead of login to avoid loops
    if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to={getRoleHome(role)} replace />;

    return children;
};

const AppContent = () => {
    return (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />

            <Route path="/superadmin" element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                    <AppLayout>
                        <SuperAdminPanel />
                    </AppLayout>
                </ProtectedRoute>
            } />

            <Route path="/owner" element={
                <ProtectedRoute allowedRoles={['owner']}>
                    <AppLayout>
                        <OwnerDashboard />
                    </AppLayout>
                </ProtectedRoute>
            } />

            <Route path="/staff" element={
                <ProtectedRoute allowedRoles={['staff']}>
                    <AppLayout>
                        <StaffView />
                    </AppLayout>
                </ProtectedRoute>
            } />

            <Route path="/analytics" element={
                <ProtectedRoute allowedRoles={['owner']}>
                    <AppLayout>
                        <AnalyticsDashboard />
                    </AppLayout>
                </ProtectedRoute>
            } />

            <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['owner']}>
                    <AppLayout>
                        <AdminPanel />
                    </AppLayout>
                </ProtectedRoute>
            } />

            {/* Catch-all route for unknown URLs */}
            <Route path="*" element={<Navigate to="/" replace />} />
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
