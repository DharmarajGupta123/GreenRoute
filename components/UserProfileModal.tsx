import React, { useState } from 'react';
import { X, Award, Zap, Leaf, TrendingUp, History, Calendar, MapPin } from 'lucide-react';
import { UserProfile } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, profile }) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'history'>('stats');
  
  if (!isOpen) return null;

  const nextBadgeGoal = Math.ceil((profile.totalCo2Saved + 0.1) / 10) * 10;
  const progress = (profile.totalCo2Saved / nextBadgeGoal) * 100;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity cursor-pointer" 
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-100 dark:border-slate-800 flex flex-col"
      >
        
        {/* Header */}
        <div className="bg-gradient-to-br from-green-600 to-teal-700 p-8 text-white relative overflow-hidden">
          {/* Enhanced Close Button */}
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }} 
            className="absolute top-5 right-5 z-50 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full backdrop-blur-md transition-all cursor-pointer active:scale-90"
            aria-label="Close Profile"
          >
            <X size={22} strokeWidth={2.5} />
          </button>
          
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center border-2 border-white/40 text-4xl shadow-2xl backdrop-blur-sm rotate-3 group hover:rotate-0 transition-transform duration-300">
              🦸
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight">Eco Traveler</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                  Level {Math.floor(profile.totalCo2Saved / 5) + 1}
                </span>
                <span className="text-green-100 text-xs font-bold opacity-80">
                  Carbon Guardian
                </span>
              </div>
            </div>
          </div>

          <div className="flex mt-8 p-1 bg-black/10 rounded-2xl backdrop-blur-md w-fit">
            <button 
              onClick={() => setActiveTab('stats')}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'stats' ? 'bg-white text-green-700 shadow-lg' : 'text-white hover:bg-white/10'}`}
            >
              Stats & Badges
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-white text-green-700 shadow-lg' : 'text-white hover:bg-white/10'}`}
            >
              Trip History
            </button>
          </div>
          
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-slate-900/50">
          
          {activeTab === 'stats' ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Main Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-green-100 dark:border-green-900/20">
                  <Leaf className="mx-auto text-green-600 dark:text-green-400 mb-2" size={24} />
                  <div className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">{profile.totalCo2Saved.toFixed(1)}</div>
                  <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">kg Saved</div>
                </div>
                <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-orange-100 dark:border-orange-900/20">
                  <Zap className="mx-auto text-orange-600 dark:text-orange-400 mb-2" size={24} />
                  <div className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">{profile.streak}</div>
                  <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Day Streak</div>
                </div>
                <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-blue-100 dark:border-blue-900/20">
                  <TrendingUp className="mx-auto text-blue-600 dark:text-blue-400 mb-2" size={24} />
                  <div className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">{profile.totalTrips}</div>
                  <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Trips</div>
                </div>
              </div>

              {/* Progress to Next Badge */}
              <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between text-xs mb-3 font-black uppercase tracking-widest">
                  <span className="text-gray-500">Next Goal: {nextBadgeGoal}kg Saved</span>
                  <span className="text-green-600 dark:text-green-400">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-4 p-1 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-teal-500 h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400 mt-3 font-medium text-center">Every choice counts. Keep going!</p>
              </div>

              {/* Badges */}
              <div>
                <h3 className="font-black text-gray-900 dark:text-white mb-5 flex items-center gap-2 text-xs uppercase tracking-widest">
                  <Award size={16} className="text-yellow-500" />
                  Achievements
                </h3>
                <div className="flex flex-wrap gap-3">
                  {profile.badges.length === 0 && (
                    <div className="w-full py-8 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-gray-400">
                       <Award size={32} className="opacity-20 mb-2" />
                       <p className="text-xs font-bold">No badges earned yet</p>
                    </div>
                  )}
                  {profile.badges.map((badge, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-2xl shadow-sm transition-transform hover:scale-105">
                      <span className="text-xl">🏅</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-yellow-800 dark:text-yellow-400">{badge}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h3 className="font-black text-gray-900 dark:text-white mb-2 flex items-center gap-2 text-xs uppercase tracking-widest">
                <History size={16} className="text-blue-500" />
                Recent Journeys
              </h3>
              {profile.history.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-800 flex flex-col items-center">
                   <div className="w-16 h-16 bg-gray-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                     <History size={24} className="text-gray-300" />
                   </div>
                   <p className="text-gray-400 text-sm font-bold">No trips recorded yet.</p>
                   <p className="text-xs text-gray-400 mt-1">Start your first journey to see it here!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {profile.history.slice().reverse().map((trip) => (
                    <div key={trip.id} className="p-5 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl transition-all hover:border-green-200 dark:hover:border-green-900/50 hover:shadow-xl hover:-translate-y-0.5 group">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full">
                          {trip.mode}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold">
                          <Calendar size={12} /> {new Date(trip.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-800 dark:text-gray-200 font-black mb-4 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                         {trip.origin} <MapPin size={14} className="text-gray-400 shrink-0" /> {trip.destination}
                      </div>
                      <div className="flex gap-4 pt-4 border-t border-gray-50 dark:border-slate-700/50">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">Saved</span>
                          <span className="text-sm font-black text-green-600 dark:text-green-400">{trip.co2Saved.toFixed(2)}kg</span>
                        </div>
                        <div className="flex flex-col border-l border-gray-100 dark:border-slate-700/50 pl-4">
                          <span className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">Distance</span>
                          <span className="text-sm font-black text-gray-900 dark:text-white">{trip.distanceKm}km</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Footer info in Modal */}
        <div className="p-6 bg-gray-50 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 text-center">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">GreenRoute Profile • 2024</p>
        </div>
      </div>
    </div>
  );
};