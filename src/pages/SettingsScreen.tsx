// App and account settings overview with navigation and logout.
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  User, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Settings as SettingsIcon
} from 'lucide-react';

export function SettingsScreen() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const settingsItems = [
    {
      icon: User,
      label: 'Edit Profile',
      description: 'Update your information and preferences',
      action: () => navigate('/profile/setup'),
    },
    {
      icon: Bell,
      label: 'Notifications',
      description: 'Manage your notification preferences',
      action: () => console.log('Navigate to notifications'),
    },
    {
      icon: Shield,
      label: 'Privacy & Safety',
      description: 'Control your privacy settings',
      action: () => console.log('Navigate to privacy'),
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      description: 'Get help and contact support',
      action: () => console.log('Navigate to help'),
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-secondary-50">
      <div className="bg-white shadow-sm border-b border-secondary-200 p-4">
        <h1 className="text-xl font-semibold text-center">Settings</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-2xl mx-auto p-4 space-y-4">
          {/* Settings Header */}
          <Card>
            <div className="text-center">
              <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <SettingsIcon className="h-6 w-6 text-primary-600" />
              </div>
              <h2 className="text-lg font-semibold text-secondary-900 mb-1">
                App Settings
              </h2>
              <p className="text-sm text-secondary-600">
                Manage your account and app preferences
              </p>
            </div>
          </Card>

          {/* Settings Items */}
          <Card padding="none">
            <div className="divide-y divide-secondary-200">
              {settingsItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.action}
                  className="w-full flex items-center justify-between p-4 hover:bg-secondary-50 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className="h-10 w-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-secondary-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-secondary-900">
                        {item.label}
                      </div>
                      <div className="text-sm text-secondary-600">
                        {item.description}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-secondary-400" />
                </button>
              ))}
            </div>
          </Card>

          {/* App Info */}
          <Card>
            <h3 className="font-semibold text-secondary-900 mb-3">About</h3>
            <div className="space-y-2 text-sm text-secondary-600">
              <div className="flex justify-between">
                <span>Version</span>
                <span>1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span>Build</span>
                <span>2024.01.001</span>
              </div>
            </div>
          </Card>

          {/* Logout */}
          <Card>
            <Button
              onClick={handleLogout}
              variant="danger"
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </Card>

          {/* Footer */}
          <div className="text-center text-xs text-secondary-500 pt-4">
            <p>Campus Connect v1.0.0</p>
            <p className="mt-1">
              Made with â¤ï¸ for college students
            </p>
          </div>
        </div>
      </div>
      
      
    </div>
  );
}
