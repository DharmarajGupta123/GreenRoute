
import React from 'react';
import { Leaf, Flame, Zap} from 'lucide-react';
import { UserProfile } from '../types';

interface ImpactSummaryProps {
  profile: UserProfile;
}

export const ImpactSummary: React.FC<ImpactSummaryProps> = ({ profile }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-4 transition-all hover:shadow-md">
        <div className="bg-emerald-100 dark:bg-emerald-900/40 p-3 rounded-xl text-emerald-600 dark:text-emerald-400">
          <Leaf size={24} />
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Total CO₂ Saved</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {profile.totalCo2Saved.toFixed(1)} <span className="text-sm font-normal text-gray-400">kg</span>
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-orange-100 dark:border-orange-900/30 flex items-center gap-4 transition-all hover:shadow-md">
        <div className="bg-orange-100 dark:bg-orange-900/40 p-3 rounded-xl text-orange-500 dark:text-orange-400">
          <Flame size={24} />
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Calories Burned</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {profile.totalCaloriesBurned.toLocaleString()} <span className="text-sm font-normal text-gray-400">kcal</span>
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-cyan-100 dark:border-cyan-900/30 flex items-center gap-4 transition-all hover:shadow-md">
        <div className="bg-cyan-100 dark:bg-cyan-900/40 p-3 rounded-xl text-cyan-600 dark:text-cyan-400">
          <Zap size={24} />
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Green Streak</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {profile.streak} <span className="text-sm font-normal text-gray-400">days</span>
          </p>
        </div>
      </div>
    </div>
  );
};
