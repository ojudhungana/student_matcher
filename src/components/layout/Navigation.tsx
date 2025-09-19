import React from 'react';
// Fixed bottom nav bar for primary app routes.

import { NavLink } from 'react-router-dom';
import { UserPlus, Users, User, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { path: '/match', icon: UserPlus, label: 'Discover' },
  { path: '/connections', icon: Users, label: 'Connections' },
  { path: '/profile', icon: User, label: 'Profile' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export function Navigation() {
  return (
    <nav className="fixed inset-x-0 bottom-0 bg-white/90 backdrop-blur border-t border-secondary-200 z-50">
      <div className="relative w-full">
        <div className="max-w-md mx-auto">
          <div className="flex justify-around py-2 px-2">
            {navItems.map(({ path, icon: Icon, label }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `relative flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                    isActive
                      ? 'text-primary-600'
                      : 'text-secondary-600 hover:text-secondary-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <motion.div
                      whileTap={{ scale: 0.96 }}
                      className="flex flex-col items-center"
                    >
                      <div className={`h-10 w-10 flex items-center justify-center rounded-full transition-colors ${
                        isActive ? 'bg-primary-50' : 'hover:bg-secondary-50'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-medium mt-0.5">{label}</span>
                    </motion.div>
                    <AnimatePresence>
                      {isActive && (
                        <motion.span
                          layoutId="nav-active-dot"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 0.2 }}
                          className="absolute -bottom-1 h-1 w-6 rounded-full bg-primary-500"
                        />
                      )}
                    </AnimatePresence>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
