// App root: providers and client-side routing.
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LoginScreen } from '@/components/auth/LoginScreen';
import { MatchScreen } from '@/pages/MatchScreen';
import { ConnectionsScreen } from '@/pages/ConnectionsScreen';
import { ProfileScreen } from '@/pages/ProfileScreen';
import { SettingsScreen } from '@/pages/SettingsScreen';
import { ProfileSetupScreen } from '@/pages/ProfileSetupScreen';
import { TestPage } from '@/pages/TestPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from '@/components/layout/PageTransition';
import { Navigation } from '@/components/layout/Navigation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Home route that redirects based on auth state
function HomeRedirect() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  return <Navigate to={user ? "/match" : "/login"} replace />;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/login" element={<PageTransition><LoginScreen /></PageTransition>} />
        <Route path="/test" element={<PageTransition><TestPage /></PageTransition>} />
        
        {/* Protected Routes */}
        <Route 
          path="/match" 
          element={
            <ProtectedRoute requireProfile={true}>
              <PageTransition><MatchScreen /></PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/connections" 
          element={
            <ProtectedRoute requireProfile={true}>
              <PageTransition><ConnectionsScreen /></PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute requireProfile={true}>
              <PageTransition><ProfileScreen /></PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile/setup" 
          element={
            <ProtectedRoute requireProfile={false}>
              <PageTransition><ProfileSetupScreen /></PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute requireProfile={true}>
              <PageTransition><SettingsScreen /></PageTransition>
            </ProtectedRoute>
          } 
        />
        
        {/* Home route - redirects based on auth state */}
        <Route path="/" element={<HomeRedirect />} />
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </AnimatePresence>
  );
}

// Main app wrapper that conditionally shows navigation
function AppContent() {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  // Don't show navigation on login page
  const showNavigation = user && !loading && location.pathname !== '/login';
  
  return (
    <div className="App">
      <AnimatedRoutes />
      
      {/* Toast notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      {showNavigation && <Navigation />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
