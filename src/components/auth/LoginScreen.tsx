// Authentication screen with university SSO and email/password login.
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Heart, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';

export function LoginScreen() {
  const { login, loginWithUniversity, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await login(email, password);
    } catch (error) {
      // Error is handled in the auth context
    }
  };

  const handleUniversityLogin = async () => {
    try {
      await loginWithUniversity();
    } catch (error) {
      // Error is handled in the auth context
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center h-16 w-16 bg-primary-600 rounded-full mb-4"
          >
            <Heart className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Campus Connect
          </h1>
          <p className="text-secondary-600">
            Find your college friends and study buddies
          </p>
        </div>

        <Card animate className="mb-6">
          {/* University Login */}
          <div className="mb-6">
            <Button
              onClick={handleUniversityLogin}
              loading={loading}
              className="w-full"
              size="lg"
            >
              <GraduationCap className="h-5 w-5 mr-2" />
              Sign in with University
            </Button>
            <p className="text-xs text-secondary-500 text-center mt-2">
              Use your university email to verify your student status
            </p>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-secondary-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-secondary-500">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email Login Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <Input
              type="email"
              label="Email"
              placeholder="your.email@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <Input
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              variant="secondary"
            >
              {isLogin ? 'Sign In' : 'Sign Up'}
            </Button>
          </form>

          {/* Toggle Login/Signup */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </Card>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center space-y-2"
        >
          <div className="flex items-center justify-center space-x-6 text-sm text-secondary-600">
            <span>âœ“ Verified students only</span>
            <span>âœ“ Safe & secure</span>
            <span>âœ“ Free to use</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
