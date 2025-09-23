// App root: providers and client-side routing.
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { LoginScreen } from '@/components/auth/LoginScreen';
import { MatchScreen } from '@/pages/MatchScreen';
import { ConnectionsScreen } from '@/pages/ConnectionsScreen';
import { ProfileScreen } from '@/pages/ProfileScreen';
import { SettingsScreen } from '@/pages/SettingsScreen';
import { TestPage } from '@/pages/TestPage';
import { Navigation } from '@/components/layout/Navigation';
import { FloatingThemeToggle } from '@/components/ui/FloatingThemeToggle';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">

          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/test" element={<TestPage />} />
            
            {/* Protected Routes - Temporarily remove protection for development */}
            <Route path="/match" element={<MatchScreen />} />
            <Route path="/connections" element={<ConnectionsScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/match" replace />} />
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/match" replace />} />
          </Routes>
          
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
+       <FloatingThemeToggle />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
