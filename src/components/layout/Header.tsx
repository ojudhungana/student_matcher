import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Heart, Settings, LogOut } from 'lucide-react';

interface HeaderProps { title?: string; showProfile?: boolean; }

export function Header({ title = 'Campus Connect', showProfile = true }: HeaderProps) {
  const { user, profile, logout } = useAuth();
  const handleLogout = async () => { try { await logout(); } catch (e) { console.error(e); } };

  return (
    <header className="bg-white shadow-sm border-b border-secondary-200 dark:bg-secondary-900 dark:border-secondary-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center h-8 w-8 bg-primary-600 rounded-lg">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-secondary-900 dark:text-secondary-50">{title}</h1>
          </div>
          {showProfile && user && profile && (
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3">
                <span className="text-sm text-secondary-700 dark:text-secondary-200">Hi, {profile.name.split(' ')[0]}!</span>
                <Avatar src={profile.profilePicture} name={profile.name} size="sm" />
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="p-2" title="Settings"><Settings className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" className="p-2" onClick={handleLogout} title="Logout"><LogOut className="h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

