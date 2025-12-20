
import React from 'react';
import { Leaf, User, Moon, Sun} from 'lucide-react';

interface HeaderProps {
  onOpenProfile: () => void;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenProfile, toggleTheme, isDarkMode }) => {
  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-emerald-100 dark:border-slate-700 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
            <div className="bg-emerald-500 p-2 rounded-lg text-white shadow-lg shadow-emerald-500/30 ring-1 ring-emerald-400/50 transition-all duration-300">
              <Leaf size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">GreenRoute</h1>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Carbon Footprint Planner</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 transition-colors"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              onClick={onOpenProfile}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-all text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              <User size={16} />
              <span>My Impact</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
