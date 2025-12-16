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
      {/* Container is always white now */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-8 border border-white/20 ring-1 ring-black/5 transition-colors duration-300">
        <form onSubmit={handleSubmit}>
          
          {/* Mode Selection Pills */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-gray-100 p-1.5 rounded-full gap-2 shadow-inner">
              <button
                type="button"
                onClick={() => toggleMode('car')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  modes.car 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Car size={16} /> <span className="hidden sm:inline">Car</span>
              </button>
              <button
                type="button"
                onClick={() => toggleMode('transit')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  modes.transit
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Bus size={16} /> <span className="hidden sm:inline">Transit</span>
              </button>
              <button
                type="button"
                onClick={() => toggleMode('active')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  modes.active
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Bike size={16} /> <span className="hidden sm:inline">Active</span>
              </button>
            </div>
          </div>

          {/* Stacked Inputs with Visual Route Connector */}
          <div className="relative flex flex-col gap-4">
            
            {/* Visual Route Line */}
            <div className="absolute left-[26px] top-[26px] bottom-[26px] w-0.5 bg-gradient-to-b from-gray-300 via-gray-300 to-transparent z-0"></div>

            {/* Origin Input */}
            <div className="relative group z-10">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-green-600">
                <Circle size={20} strokeWidth={3} className="fill-white" />
              </div>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="Starting Point"
                className="block w-full pl-14 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl text-lg font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200"
                required
              />
            </div>

            {/* Swap Button */}
            <button
              type="button"
              onClick={handleSwap}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white border border-gray-100 shadow-md rounded-full text-gray-500 hover:text-green-600 hover:bg-gray-50 transition-all hover:rotate-180 duration-300"
              title="Swap locations"
            >
              <ArrowRightLeft size={16} className="rotate-90" />
            </button>

            {/* Destination Input */}
            <div className="relative group z-10">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-red-500">
                <MapPin size={22} className="fill-white" />
              </div>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Where to?"
                className="block w-full pl-14 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl text-lg font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-8 py-4 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 text-white font-bold text-lg rounded-2xl shadow-xl shadow-green-600/30 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={24} className="animate-spin" />
                <span>Finding Best Routes...</span>
              </>
            ) : (
              <>
                <Search size={24} strokeWidth={2.5} />
                <span>Calculate Footprint</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};