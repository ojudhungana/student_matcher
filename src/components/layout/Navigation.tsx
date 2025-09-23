import { NavLink } from 'react-router-dom';
import { UserPlus, Users, User, Settings } from 'lucide-react';

const navItems = [
  { path: '/match', icon: UserPlus, label: 'Discover' },
  { path: '/connections', icon: Users, label: 'Connections' },
  { path: '/profile', icon: User, label: 'Profile' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export function Navigation() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 border-t bg-white text-secondary-700
                 dark:bg-secondary-900 dark:text-secondary-200 dark:border-secondary-700"
    >
      <div className="max-w-md mx-auto">
        <div className="flex justify-around py-2">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  isActive
                    ? 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-secondary-800/50'
                    : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50 dark:text-secondary-300 dark:hover:text-secondary-50 dark:hover:bg-secondary-800/60'
                }`
              }
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}

