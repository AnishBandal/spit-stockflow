import { useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './lib/auth';
import { permissions } from './lib/permissions';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute as RoleProtectedRoute } from './components/ProtectedRoute';

// Auth pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';

// App pages
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Stock from './pages/Stock';
import Receipts from './pages/Receipts';
import Deliveries from './pages/Deliveries';
import Transfers from './pages/Transfers';
import Adjustments from './pages/Adjustments';
import MoveHistory from './pages/MoveHistory';
import Warehouses from './pages/Warehouses';
import Locations from './pages/Locations';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuth = authService.isAuthenticated();
  return isAuth ? <AppLayout>{children}</AppLayout> : <Navigate to="/login" replace />;
};

// Public Route Component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuth = authService.isAuthenticated();
  return isAuth ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

const App = () => {
  useEffect(() => {
    // Check auth on mount and redirect if needed
    const isAuth = authService.isAuthenticated();
    if (!isAuth && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup') && !window.location.pathname.includes('/forgot-password')) {
      window.location.href = '/login';
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            
            {/* Manager/Admin Only Routes */}
            <Route path="/products" element={<ProtectedRoute><RoleProtectedRoute requirePermission={permissions.canViewProducts}><Products /></RoleProtectedRoute></ProtectedRoute>} />
            <Route path="/receipts" element={<ProtectedRoute><RoleProtectedRoute requirePermission={(role) => ['Inventory Manager', 'Admin'].includes(role)}><Receipts /></RoleProtectedRoute></ProtectedRoute>} />
            <Route path="/deliveries" element={<ProtectedRoute><RoleProtectedRoute requirePermission={(role) => ['Inventory Manager', 'Admin'].includes(role)}><Deliveries /></RoleProtectedRoute></ProtectedRoute>} />
            <Route path="/move-history" element={<ProtectedRoute><RoleProtectedRoute requirePermission={(role) => ['Inventory Manager', 'Admin'].includes(role)}><MoveHistory /></RoleProtectedRoute></ProtectedRoute>} />
            <Route path="/warehouses" element={<ProtectedRoute><RoleProtectedRoute requirePermission={(role) => ['Inventory Manager', 'Admin'].includes(role)}><Warehouses /></RoleProtectedRoute></ProtectedRoute>} />
            <Route path="/locations" element={<ProtectedRoute><RoleProtectedRoute requirePermission={(role) => ['Inventory Manager', 'Admin'].includes(role)}><Locations /></RoleProtectedRoute></ProtectedRoute>} />
            
            {/* All Roles Routes */}
            <Route path="/stock" element={<ProtectedRoute><Stock /></ProtectedRoute>} />
            <Route path="/transfers" element={<ProtectedRoute><Transfers /></ProtectedRoute>} />
            <Route path="/adjustments" element={<ProtectedRoute><Adjustments /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
