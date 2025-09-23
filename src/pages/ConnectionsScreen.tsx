// Shows the user's connections with stats, list, and empty state.
import { useConnections } from '@/hooks/useConnections';
import { Navigation } from '@/components/layout/Navigation';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Users, MessageCircle, Calendar, Star, BookOpen } from 'lucide-react';
import { formatRelativeTime } from '@/utils';

export function ConnectionsScreen() {
  const { connections, loading, refresh } = useConnections();

  // Avoid interstitial loading screen on navigation: render layout and, if needed,
  // show content based on existing data; only show empty state when not loading.

  if (!loading && connections.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="bg-white shadow-sm border-b border-secondary-200 p-4 dark:bg-secondary-900 dark:border-secondary-700 dark:text-secondary-50">
          <h1 className="text-xl font-semibold text-center">Your Connections</h1>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-sm">
            <div className="mb-6">
              <div className="h-16 w-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-secondary-800">
                <Users className="h-8 w-8 text-secondary-400 dark:text-secondary-300" />
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2 dark:text-secondary-50">
                No connections yet
              </h3>
              <p className="text-secondary-600 text-sm dark:text-secondary-300">
                Start swiping to find people and make your first connection!
              </p>
            </div>
            <Button onClick={refresh} className="w-full">
              Start Discovering
            </Button>
          </div>
        </div>
        <Navigation />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-secondary-50 dark:bg-secondary-900">
      <div className="bg-white shadow-sm border-b border-secondary-200 p-4 dark:bg-secondary-900 dark:border-secondary-700 dark:text-secondary-50">
        <h1 className="text-xl font-semibold text-center">Your Connections</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-2xl mx-auto p-4 space-y-4">
          {/* Stats */}
          <Card className="text-center">
            <div className="flex items-center justify-center space-x-6">
              <div>
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{connections.length}</div>
                <div className="text-sm text-secondary-600 dark:text-secondary-300">Connections</div>
              </div>
              <div className="h-8 w-px bg-secondary-300 dark:bg-secondary-700" />
              <div>
                <div className="text-2xl font-bold text-secondary-900 dark:text-secondary-50">
                  {connections.filter(c => c.lastMessageAt).length}
                </div>
                <div className="text-sm text-secondary-600 dark:text-secondary-300">Active Chats</div>
              </div>
            </div>
          </Card>

          {/* Connections List */}
          <div className="space-y-3">
            {connections.map((connection) => (
              <Card key={connection.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <Avatar
                    src={connection.user.profilePicture}
                    name={connection.user.name}
                    size="lg"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-secondary-900 truncate dark:text-secondary-50">
                          {connection.user.name}
                        </h3>
                        <p className="text-sm text-secondary-600 dark:text-secondary-300">
                          {connection.user.major} • {connection.user.year}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xs text-secondary-500 dark:text-secondary-400">
                          {formatRelativeTime(connection.matchedAt)}
                        </p>
                        {connection.lastMessageAt && (
                          <div className="h-2 w-2 bg-primary-500 rounded-full ml-auto mt-1" />
                        )}
                      </div>
                    </div>

                    {/* Shared Interests */}
                    {connection.sharedInterests.length > 0 && (
                      <div className="mt-2">
                        <div className="flex items-center space-x-1 mb-1">
                          <Star className="h-3 w-3 text-secondary-500 dark:text-secondary-400" />
                          <span className="text-xs text-secondary-600 dark:text-secondary-300">Shared Interests:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {connection.sharedInterests.slice(0, 3).map((interest) => (
                            <span
                              key={interest}
                              className="px-2 py-0.5 bg-secondary-100 text-secondary-700 text-xs rounded-full dark:bg-secondary-800 dark:text-secondary-200"
                            >
                              {interest}
                            </span>
                          ))}
                          {connection.sharedInterests.length > 3 && (
                            <span className="text-xs text-secondary-500 dark:text-secondary-400">
                              +{connection.sharedInterests.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Shared Classes */}
                    {connection.sharedClasses.length > 0 && (
                      <div className="mt-2">
                        <div className="flex items-center space-x-1 mb-1">
                          <BookOpen className="h-3 w-3 text-secondary-500 dark:text-secondary-400" />
                          <span className="text-xs text-secondary-600 dark:text-secondary-300">Shared Classes:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {connection.sharedClasses.map((className) => (
                            <span
                              key={className}
                              className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full dark:bg-secondary-800 dark:text-secondary-200"
                            >
                              {className}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 mt-3">
                      <Button size="sm" className="flex-1">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                      <Button size="sm" variant="secondary">
                        <Calendar className="h-4 w-4 mr-1" />
                        Meet Up
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
      
      <Navigation />
    </div>
  );
}
