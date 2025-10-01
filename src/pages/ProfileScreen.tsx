// Displays the current user's profile with bio, details, interests, and stats.

import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  Edit3, 
  MapPin, 
  Calendar, 
  GraduationCap, 
  Star, 
  BookOpen,
  Camera,
  User
} from 'lucide-react';

export function ProfileScreen() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  // console.log('ProfileScreen render:', { hasProfile: !!profile, loading, isComplete: profile?.isProfileComplete });

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-secondary-50">
        <div className="bg-white shadow-sm border-b border-secondary-200 p-4">
          <h1 className="text-xl font-semibold text-center">Your Profile</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
        
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col min-h-screen bg-secondary-50">
        <div className="bg-white shadow-sm border-b border-secondary-200 p-4">
          <h1 className="text-xl font-semibold text-center">Your Profile</h1>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-sm">
            <div className="h-16 w-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-secondary-400" />
            </div>
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">
              Profile not found
            </h3>
            <p className="text-secondary-600 text-sm mb-4">
              There was an error loading your profile.
            </p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-secondary-50">
      <div className="bg-white shadow-sm border-b border-secondary-200 p-4">
        <h1 className="text-xl font-semibold text-center">Your Profile</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-2xl mx-auto p-4 space-y-4">
          {/* Profile Header */}
          <Card>
            <div className="flex flex-col items-center text-center">
              <div className="relative inline-flex items-center justify-center mb-4 mx-auto">
                <Avatar
                  src={profile.profilePicture}
                  name={profile.name}
                  size="xl"
                />
                <button className="absolute bottom-0 left-1/2 -translate-x-1/2 transform h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-primary-700 transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              
              <h1 className="text-2xl font-bold text-secondary-900 mb-1">
                {profile.name}
              </h1>
              
              <div className="flex items-center justify-center space-x-4 text-sm text-secondary-600 mb-4">
                <span>{profile.age} years old</span>
                <span>{'\u2022'}</span>
                <span>{profile.year}</span>
                <span>{'\u2022'}</span>
                <span>{profile.major}</span>
              </div>

              <Button
                onClick={() => navigate('/profile/setup')}
                variant="secondary"
                size="sm"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </Card>

          {/* Bio */}
          {profile.bio && (
            <Card>
              <h3 className="font-semibold text-secondary-900 mb-2">About Me</h3>
              <p className="text-secondary-700 leading-relaxed">{profile.bio}</p>
            </Card>
          )}

          {/* Basic Info */}
          <Card>
            <h3 className="font-semibold text-secondary-900 mb-4">Basic Information</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <GraduationCap className="h-5 w-5 text-secondary-500" />
                <div>
                  <div className="font-medium text-secondary-900">{profile.major}</div>
                  <div className="text-sm text-secondary-600">{profile.year}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-secondary-500" />
                <div>
                  <div className="font-medium text-secondary-900">{profile.university}</div>
                  <div className="text-sm text-secondary-600">University</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-secondary-500" />
                <div>
                  <div className="font-medium text-secondary-900">
                    {profile.ageRangeMin} - {profile.ageRangeMax} years
                  </div>
                  <div className="text-sm text-secondary-600">Looking for ages</div>
                </div>
              </div>
              
              {profile.pronouns && (
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-secondary-500" />
                  <div>
                    <div className="font-medium text-secondary-900">{profile.pronouns}</div>
                    <div className="text-sm text-secondary-600">Pronouns</div>
                  </div>
                </div>
              )}
              
              {profile.commuterStatus && (
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-secondary-500" />
                  <div>
                    <div className="font-medium text-secondary-900">
                      {profile.commuterStatus === 'on-campus' && 'On-Campus'}
                      {profile.commuterStatus === 'off-campus' && 'Off-Campus'}
                      {profile.commuterStatus === 'commuter' && 'Commuter'}
                    </div>
                    <div className="text-sm text-secondary-600">Living Status</div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Interests */}
          {profile.interests.length > 0 && (
            <Card>
              <div className="flex items-center space-x-2 mb-3">
                <Star className="h-5 w-5 text-secondary-500" />
                <h3 className="font-semibold text-secondary-900">Interests</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Classes */}
          {profile.classes.length > 0 && (
            <Card>
              <div className="flex items-center space-x-2 mb-3">
                <BookOpen className="h-5 w-5 text-secondary-500" />
                <h3 className="font-semibold text-secondary-900">Current Classes</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.classes.map((className) => (
                  <span
                    key={className}
                    className="px-3 py-1 bg-secondary-100 text-secondary-800 text-sm rounded-full"
                  >
                    {className}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Profile Completion */}
          <Card>
            <h3 className="font-semibold text-secondary-900 mb-3">Profile Completion</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Profile completeness</span>
                <span className="font-medium">
                  {profile.isProfileComplete ? '100%' : '75%'}
                </span>
              </div>
              <div className="w-full bg-secondary-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: profile.isProfileComplete ? '100%' : '75%' }}
                />
              </div>
              {!profile.isProfileComplete && (
                <p className="text-sm text-secondary-600 mt-2">
                  Complete your profile to get better matches!
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
      
      
    </div>
  );
}
