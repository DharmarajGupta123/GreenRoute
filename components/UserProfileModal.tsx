import React from 'react';
import { X, Award, Zap, Leaf, TrendingUp } from 'lucide-react';
import { UserProfile } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, profile }) => {
  if (!isOpen) return null;

  const nextBadgeGoal = Math.ceil((profile.totalCo2Saved + 0.1) / 10) * 10;
  const progress = (profile.totalCo2Saved / nextBadgeGoal) * 100;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-100 dark:border-slate-700">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6 text-white relative overflow-hidden">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 p-2 rounded-full backdrop-blur-md">
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/50 text-3xl">
              🦸
            </div>
            <div>
              <h2 className="text-2xl font-bold">Eco Traveler</h2>
              <p className="text-green-100 text-sm">Level {Math.floor(profile.totalCo2Saved / 5) + 1}</p>
            </div>
          </div>
          
          {/* Decorative Circles */}
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </div>

        <div className="p-6 space-y-8">
          
          {/* Main Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <Leaf className="mx-auto text-green-600 dark:text-green-400 mb-2" size={24} />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{profile.totalCo2Saved.toFixed(1)}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">kg CO₂ Saved</div>
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
              <Zap className="mx-auto text-orange-600 dark:text-orange-400 mb-2" size={24} />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{profile.streak}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Day Streak</div>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <TrendingUp className="mx-auto text-blue-600 dark:text-blue-400 mb-2" size={24} />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{profile.totalTrips}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Trips Taken</div>
            </div>
          </div>

          {/* Progress to Next Badge */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-gray-700 dark:text-gray-300">Next Goal: {nextBadgeGoal}kg Saved</span>
              <span className="text-green-600 dark:text-green-400 font-bold">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-green-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Keep choosing green transport to level up!</p>
          </div>

          {/* Badges */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Award size={18} className="text-yellow-500" />
              Achievements
            </h3>
            <div className="flex flex-wrap gap-3">
              {profile.badges.length === 0 && (
                <p className="text-sm text-gray-400 italic">No badges yet. Save your first trip!</p>
              )}
              {profile.badges.map((badge, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-full">
                  <span className="text-lg">🏅</span>
                  <span className="text-xs font-bold text-yellow-800 dark:text-yellow-400">{badge}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};