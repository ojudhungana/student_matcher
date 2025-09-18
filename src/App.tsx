// App root: providers and client-side routing.
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { LoginScreen } from '@/components/auth/LoginScreen';
import { MatchScreen } from '@/pages/MatchScreen';
import { ConnectionsScreen } from '@/pages/ConnectionsScreen';
import { ProfileScreen } from '@/pages/ProfileScreen';
import { SettingsScreen } from '@/pages/SettingsScreen';
import { ProfileSetupScreen } from '@/pages/ProfileSetupScreen';
import { TestPage } from '@/pages/TestPage';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from '@/components/layout/PageTransition';
import { Navigation } from '@/components/layout/Navigation';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/login" element={<PageTransition><LoginScreen /></PageTransition>} />
        <Route path="/test" element={<PageTransition><TestPage /></PageTransition>} />
        
        {/* Protected Routes - Temporarily remove protection for development */}
        <Route path="/match" element={<PageTransition><MatchScreen /></PageTransition>} />
        <Route path="/connections" element={<PageTransition><ConnectionsScreen /></PageTransition>} />
        <Route path="/profile" element={<PageTransition><ProfileScreen /></PageTransition>} />
        <Route path="/profile/setup" element={<PageTransition><ProfileSetupScreen /></PageTransition>} />
        <Route path="/settings" element={<PageTransition><SettingsScreen /></PageTransition>} />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/match" replace />} />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/match" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
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
          <Navigation />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
