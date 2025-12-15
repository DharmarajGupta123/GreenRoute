import React, { useState } from 'react';
import { Search, MapPin, ArrowRightLeft, Loader2, Calendar, Clock, Car, Bus, Bike } from 'lucide-react';
import { SearchFilters } from '../types';

interface TripInputProps {
  onCalculate: (origin: string, destination: string, filters: SearchFilters) => void;
  isLoading: boolean;
}

export const TripInput: React.FC<TripInputProps> = ({ onCalculate, isLoading }) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  
  // New State for filters
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00');
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
      onCalculate(origin, destination, { date, time, modes });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto -mt-10 relative z-10 px-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100 dark:border-slate-700 transition-colors duration-300">
        <form onSubmit={handleSubmit}>
          
          {/* Section 1: Mode Filters */}
          <div className="mb-6">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 block">
              Transport Preferences
            </label>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => toggleMode('car')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  modes.car 
                    ? 'bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-900/30 dark:text-red-400 dark:ring-red-900/50' 
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100 dark:bg-slate-700 dark:text-gray-400 dark:hover:bg-slate-600'
                }`}
              >
                <Car size={16} /> Car
              </button>
              <button
                type="button"
                onClick={() => toggleMode('transit')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  modes.transit
                    ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-900/50' 
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100 dark:bg-slate-700 dark:text-gray-400 dark:hover:bg-slate-600'
                }`}
              >
                <Bus size={16} /> Public Transit
              </button>
              <button
                type="button"
                onClick={() => toggleMode('active')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  modes.active
                    ? 'bg-green-50 text-green-700 ring-1 ring-green-200 dark:bg-green-900/30 dark:text-green-400 dark:ring-green-900/50' 
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100 dark:bg-slate-700 dark:text-gray-400 dark:hover:bg-slate-600'
                }`}
              >
                <Bike size={16} /> Walk / Bike
              </button>
            </div>
          </div>

          <hr className="border-gray-100 dark:border-slate-700 mb-6" />

          {/* Section 2: Locations & Swap */}
          <div className="flex flex-col md:flex-row gap-4 items-center relative mb-4">
            <div className="w-full space-y-2">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
                From
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500 group-focus-within:text-green-600 dark:group-focus-within:text-green-500">
                  <MapPin size={20} />
                </div>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="e.g. Times Square, NY"
                  className="block w-full pl-10 pr-3 py-4 border border-gray-200 dark:border-slate-600 rounded-xl leading-5 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Swap Button */}
            <button
              type="button"
              onClick={handleSwap}
              className="mt-6 md:mt-0 p-3 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-600 dark:text-gray-300 rounded-full transition-all hover:scale-110 active:scale-95 z-20"
              title="Swap locations"
              aria-label="Swap origin and destination"
            >
              <ArrowRightLeft size={18} className="md:rotate-0 rotate-90" />
            </button>

            <div className="w-full space-y-2">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
                To
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500 group-focus-within:text-green-600 dark:group-focus-within:text-green-500">
                  <MapPin size={20} />
                </div>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Central Park"
                  className="block w-full pl-10 pr-3 py-4 border border-gray-200 dark:border-slate-600 rounded-xl leading-5 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Date, Time & Submit */}
          <div className="flex flex-col md:flex-row gap-4">
             <div className="flex gap-4 w-full md:w-auto flex-1">
                <div className="relative group flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                    <Calendar size={18} />
                  </div>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="block w-full pl-10 pr-3 py-4 border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-green-500 transition-all text-sm [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
                <div className="relative group w-32">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                    <Clock size={18} />
                  </div>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="block w-full pl-10 pr-3 py-4 border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-green-500 transition-all text-sm [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
             </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full md:w-auto px-8 py-4 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500 text-white font-bold rounded-xl shadow-lg shadow-green-600/30 dark:shadow-green-900/50 transition-all duration-200 transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed min-h-[56px]"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Search size={20} />
                  <span>Calculate Impact</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};