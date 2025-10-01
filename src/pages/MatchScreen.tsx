// Swipeable discovery interface to connect or skip suggested matches.
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMatches } from '@/hooks/useMatches';
import { MatchCard } from '@/components/match/MatchCard';
import { Button } from '@/components/ui/Button';
import { X, UserPlus } from 'lucide-react';

export function MatchScreen() {
  const navigate = useNavigate();
  const { suggestions, loading, sendMatch, skipMatch } = useMatches();

  // Always show the first match since we remove matches from the array
  const currentMatch = suggestions[0];
  const nextMatch = suggestions[1];

  const handleSkip = async () => {
    if (!currentMatch) return;
    await skipMatch(currentMatch.user.id);
    // No need to update index since the match is removed from the array
  };

  const handleConnect = async () => {
    if (!currentMatch) return;
    await sendMatch(currentMatch.user.id);
    // No need to update index since the match is removed from the array
  };



  // Show empty state when there are no matches (regardless of loading state)
  if (!currentMatch && suggestions.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="bg-white shadow-sm border-b border-secondary-200 p-4">
          <h1 className="text-xl font-semibold text-center">Discover People</h1>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-sm">
            <div className="mb-6">
               <div className="h-20 w-20 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <UserPlus className="h-10 w-10 text-primary-500" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                All caught up!
              </h3>
              <p className="text-secondary-600 text-sm mb-4">
                You've seen all available matches in your area. New students join daily, so check back soon!
              </p>
              <div className="bg-secondary-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-secondary-600">
                  💡 <strong>Tip:</strong> Update your interests in your profile to discover more compatible matches
                </p>
              </div>
            </div>
             <div className="space-y-3">
               <button
                 onClick={() => navigate('/profile')}
                 className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
               >
                 Update Profile Settings
               </button>
               <button
                 onClick={() => navigate('/connections')}
                 className="w-full text-primary-600 text-sm hover:text-primary-700"
               >
                 View Your Connections
               </button>
             </div>
          </div>
        </div>
        
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col min-h-screen bg-secondary-50"
    >
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white shadow-sm border-b border-secondary-200 p-4"
      >
        <h1 className="text-xl font-semibold text-center">Discover People</h1>
      </motion.div>
      
      {/* Match Info Bar */}
      <motion.div 
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white border-b border-secondary-200 p-3"
      >
        <div className="max-w-sm mx-auto">
           {currentMatch ? (
             <motion.div 
               key={currentMatch.id}
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.3 }}
               className="flex items-center justify-between text-sm"
             >
               <span className="text-secondary-600">
                 {suggestions.length} matches found
               </span>
               <span className="text-primary-600 font-medium">
                 {currentMatch.compatibilityScore}% match
               </span>
               <span className="text-secondary-600">
                 {(currentMatch.sharedInterests?.length || 0) + (currentMatch.sharedClasses?.length || 0)} in common
               </span>
             </motion.div>
          ) : (
            <div className="text-center text-secondary-500 text-sm">
              No more profiles to show
            </div>
          )}
        </div>
      </motion.div>

      <div className="flex-1 flex flex-col pb-24">
        {/* Match Cards */}
        <div className="flex-1 p-4 relative">
          <div className="max-w-sm mx-auto h-full relative">
            <AnimatePresence mode="wait">
              {nextMatch && (
                <MatchCard
                  key={`next-${nextMatch.id}`}
                  match={nextMatch}
                  onSwipeLeft={() => {}}
                  onSwipeRight={() => {}}
                  isTop={false}
                />
              )}
              {currentMatch && (
                <MatchCard
                  key={`current-${currentMatch.id}`}
                  match={currentMatch}
                  onSwipeLeft={handleSkip}
                  onSwipeRight={handleConnect}
                  isTop={true}
                />
              )}
            </AnimatePresence>
          </div>
        </div>

         {/* Action Buttons - Fixed position */}
         <motion.div 
           initial={{ y: 50, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ duration: 0.5, delay: 0.4 }}
           className="fixed bottom-20 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-secondary-200"
         >
           <div className="max-w-sm mx-auto">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 0.3, delay: 0.6 }}
               className="text-center mb-3"
             >
               <div className="text-xs text-secondary-500">
                 {currentMatch ? `${suggestions.length - 1} more` : 'All done!'}
               </div>
             </motion.div>
             <div className="flex items-center justify-center space-x-16">
               <motion.div 
                 initial={{ x: -30, opacity: 0 }}
                 animate={{ x: 0, opacity: 1 }}
                 transition={{ duration: 0.4, delay: 0.5 }}
                 whileHover={{ scale: 1.1 }} 
                 whileTap={{ scale: 0.9 }}
               >
                <Button
                   onClick={handleSkip}
                   variant="secondary"
                   size="lg"
                   className="h-16 w-16 rounded-full p-0 shadow-lg bg-white border-2 border-red-200 hover:border-red-300"
                  disabled={!currentMatch}
                 >
                   <X className="h-6 w-6 text-red-500" />
                 </Button>
               </motion.div>
               
               <motion.div 
                 initial={{ x: 30, opacity: 0 }}
                 animate={{ x: 0, opacity: 1 }}
                 transition={{ duration: 0.4, delay: 0.5 }}
                 whileHover={{ scale: 1.1 }} 
                 whileTap={{ scale: 0.9 }}
               >
                <Button
                   onClick={handleConnect}
                   variant="primary"
                   size="lg"
                   className="h-16 w-16 rounded-full p-0 shadow-lg bg-gradient-to-br from-primary-500 to-primary-600"
                  disabled={!currentMatch || loading}
                 >
                   <UserPlus className="h-6 w-6" />
                 </Button>
               </motion.div>
             </div>
           </div>
           
           <div className="text-center mt-3">
            <p className="text-xs text-secondary-500">
              Swipe left to skip • Tap 🤝 to connect
            </p>
           </div>
         </motion.div>
      </div>
      
      
    </motion.div>
  );
}
