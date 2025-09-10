import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { MatchSuggestion } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { MapPin, BookOpen, Star } from 'lucide-react';

interface MatchCardProps {
  match: MatchSuggestion;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isTop?: boolean;
}

export function MatchCard({ match, onSwipeLeft, onSwipeRight, isTop = false }: MatchCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = () => {
    const threshold = 100;
    if (x.get() > threshold) {
      onSwipeRight();
    } else if (x.get() < -threshold) {
      onSwipeLeft();
    }
  };

  const { user, sharedInterests, sharedClasses, compatibilityScore } = match;

  return (
    <motion.div
      className={`absolute inset-0 ${isTop ? 'z-10' : 'z-0'}`}
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05 }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
    >
      <Card className="h-full overflow-hidden cursor-grab active:cursor-grabbing" padding="none">
        {/* Profile Image */}
        <div className="relative h-64 bg-gradient-to-br from-primary-100 to-secondary-100">
          {user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Avatar name={user.name} size="xl" />
            </div>
          )}
          
          {/* Compatibility Score */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1 shadow-sm">
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
            <span className="text-sm font-medium">{compatibilityScore}%</span>
          </div>
          
          {/* Quick Info Overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-lg">{user.name}</div>
                  <div className="text-sm opacity-90">{user.age} • {user.year} • {user.major}</div>
                </div>
                {(sharedInterests.length > 0 || sharedClasses.length > 0) && (
                  <div className="text-right">
                    <div className="text-xs opacity-75">In common</div>
                    <div className="text-sm font-medium">
                      {sharedInterests.length + sharedClasses.length} things
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="p-6 space-y-4">
          {/* Name and Basic Info */}
          <div>
            <h3 className="text-xl font-bold text-secondary-900">{user.name}</h3>
            <div className="flex items-center space-x-4 text-sm text-secondary-600 mt-1">
              <span>{user.age} years old</span>
              <span>•</span>
              <span>{user.year}</span>
              <span>•</span>
              <span>{user.major}</span>
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="text-secondary-700 text-sm leading-relaxed">{user.bio}</p>
          )}

          {/* Shared Classes */}
          {sharedClasses.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <BookOpen className="h-4 w-4 text-primary-600" />
                <span className="text-sm font-medium text-secondary-900">Shared Classes</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {sharedClasses.map((className) => (
                  <span
                    key={className}
                    className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full"
                  >
                    {className}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Shared Interests */}
          {sharedInterests.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Star className="h-4 w-4 text-secondary-600" />
                <span className="text-sm font-medium text-secondary-900">Shared Interests</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {sharedInterests.map((interest) => (
                  <span
                    key={interest}
                    className="px-2 py-1 bg-secondary-100 text-secondary-800 text-xs rounded-full"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* University */}
          <div className="flex items-center space-x-2 text-sm text-secondary-600">
            <MapPin className="h-4 w-4" />
            <span>{user.university}</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
