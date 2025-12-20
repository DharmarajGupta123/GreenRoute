
import React, { useState } from 'react';
import { Search, MapPin, ArrowRightLeft, Loader2, Car, Bus, Bike, Circle } from 'lucide-react';
import { SearchFilters } from '../types';

interface TripInputProps {
  onCalculate: (origin: string, destination: string, filters: SearchFilters) => void;
  isLoading: boolean;
}

export const TripInput: React.FC<TripInputProps> = ({ onCalculate, isLoading }) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  
  const [modes, setModes] = useState({
    car: true,
    transit: true,
    active: true,
  });

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const toggleMode = (key: keyof typeof modes) => {
    setModes(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (origin.trim() && destination.trim()) {
      onCalculate(origin, destination, { modes });
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto -mt-10 relative z-10 px-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-8 border border-white/20 ring-1 ring-black/5 dark:bg-slate-800/95 dark:border-slate-700">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Origin Input */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                <Circle size={22} className="fill-white" />
              </div>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="Where from?"
                className="block w-full pl-14 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl text-lg font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 dark:bg-slate-900/50 dark:text-white dark:focus:bg-slate-900"
                required
              />
            </div>

            {/* Swap Button */}
            <div className="absolute left-8 z-10 -ml-3 -mt-3 hidden md:block">
              <div className="w-0.5 h-8 bg-gray-200 ml-3 dark:bg-slate-700"></div>
            </div>
            
            <div className="flex justify-center md:hidden -my-2 relative z-10">
               <button 
                type="button" 
                onClick={handleSwap}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-500 transition-colors dark:bg-slate-700 dark:text-gray-400"
              >
                <ArrowRightLeft size={18} />
              </button>
            </div>

            {/* Destination Input */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                <MapPin size={22} className="fill-white" />
              </div>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Where to?"
                className="block w-full pl-14 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl text-lg font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 dark:bg-slate-900/50 dark:text-white dark:focus:bg-slate-900"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-8 py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={24} className="animate-spin" />
                <span>Finding Best Routes...</span>
              </>
            ) : (
              <>
                <Search size={24} strokeWidth={2.5} />
                <span>Find Best Routes</span>
              </>
            )}
          </button>
        </form>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => toggleMode('car')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              modes.car 
                ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/20 dark:bg-emerald-900/30 dark:text-emerald-400' 
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-slate-700/50 dark:text-gray-400'
            }`}
          >
            <Car size={16} />
            <span>Car</span>
          </button>
          <button
            type="button"
            onClick={() => toggleMode('transit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              modes.transit 
                ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/20 dark:bg-emerald-900/30 dark:text-emerald-400' 
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-slate-700/50 dark:text-gray-400'
            }`}
          >
            <Bus size={16} />
            <span>Transit</span>
          </button>
          <button
            type="button"
            onClick={() => toggleMode('active')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              modes.active 
                ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/20 dark:bg-emerald-900/30 dark:text-emerald-400' 
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-slate-700/50 dark:text-gray-400'
            }`}
          >
            <Bike size={16} />
            <span>Active</span>
          </button>
        </div>
      </div>
    </div>
  );
};
