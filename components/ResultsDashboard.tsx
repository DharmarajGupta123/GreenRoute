import React, { useState } from 'react';
import { TransportMode, CalculationResult, EmissionData } from '../types';
import { Car, Bus, Train, Bike, Footprints, Leaf, Timer, Flame, DollarSign, Users, AlertTriangle, Share2, Building2, MousePointerClick } from 'lucide-react';
import { ComparisonChart } from './ComparisonChart';

interface ResultsDashboardProps {
  result: CalculationResult;
  onSelectRoute: (data: EmissionData) => void;
}

const ModeIcon: React.FC<{ mode: TransportMode }> = ({ mode }) => {
  switch (mode) {
    case TransportMode.CAR: return <Car className="text-red-500" size={24} />;
    case TransportMode.BUS: return <Bus className="text-orange-500" size={24} />;
    case TransportMode.TRAIN: return <Train className="text-blue-500" size={24} />;
    case TransportMode.BIKE: return <Bike className="text-green-600" size={24} />;
    case TransportMode.WALK: return <Footprints className="text-green-700" size={24} />;
    default: return <Leaf size={24} />;
  }
};

const MetricCard: React.FC<{ data: EmissionData; onSelect: () => void }> = ({ data, onSelect }) => {
  const isEco = data.co2 === 0 || data.mode === TransportMode.TRAIN || data.mode === TransportMode.BUS;
  
  return (
    <div className={`
      relative overflow-hidden rounded-xl p-5 border transition-all duration-300 hover:shadow-lg group
      ${isEco ? 'bg-green-50/40 dark:bg-green-900/10 border-green-200 dark:border-green-800' : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700'}
    `}>
      {data.comparisonLabel && (
        <div className={`absolute top-0 right-0 text-[10px] font-bold px-3 py-1 rounded-bl-lg shadow-sm
          ${data.comparisonLabel === 'Recommended' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}
        `}>
          {data.comparisonLabel.toUpperCase()}
        </div>
      )}
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isEco ? 'bg-green-100 dark:bg-green-800/30' : 'bg-gray-100 dark:bg-slate-700'}`}>
            <ModeIcon mode={data.mode} />
          </div>
          <div>
            <h4 className="font-bold text-gray-800 dark:text-gray-200">{data.mode}</h4>
            <div className="flex gap-2 mt-1">
               {data.trafficLevel && data.mode === TransportMode.CAR && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 ${data.trafficLevel === 'High' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                    <AlertTriangle size={8} /> Traffic: {data.trafficLevel}
                  </span>
               )}
               {data.crowdLevel && (data.mode === TransportMode.BUS || data.mode === TransportMode.TRAIN) && (
                  <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded flex items-center gap-1">
                    <Users size={8} /> Crowd: {data.crowdLevel}
                  </span>
               )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 bg-white/50 dark:bg-slate-900/50 rounded-lg">
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 flex items-center justify-center gap-1">
            <Leaf size={10} /> CO₂
          </p>
          <p className={`text-base font-bold ${isEco ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-gray-300'}`}>
            {data.co2}<span className="text-[10px] text-gray-400">kg</span>
          </p>
        </div>
        <div className="text-center p-2 bg-white/50 dark:bg-slate-900/50 rounded-lg">
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 flex items-center justify-center gap-1">
            <Timer size={10} /> Time
          </p>
          <p className="text-base font-bold text-gray-900 dark:text-gray-300">
            {data.durationMins}<span className="text-[10px] text-gray-400">min</span>
          </p>
        </div>
        <div className="text-center p-2 bg-white/50 dark:bg-slate-900/50 rounded-lg">
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 flex items-center justify-center gap-1">
            <DollarSign size={10} /> Cost
          </p>
          <p className="text-base font-bold text-gray-900 dark:text-gray-300">
            ${data.cost}
          </p>
        </div>
      </div>

      <button 
        onClick={onSelect}
        className={`w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95
          ${isEco 
            ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20' 
            : 'bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200'
          }`}
      >
        <MousePointerClick size={16} />
        {isEco ? 'I\'m taking this route!' : 'Select Route'}
      </button>
    </div>
  );
};

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ result, onSelectRoute }) => {
  const { estimation, emissions } = result;
  const [activeTab, setActiveTab] = useState<'personal' | 'city'>('personal');
  const [showShareToast, setShowShareToast] = useState(false);

  const bestMode = emissions.reduce((prev, current) => (prev.co2 < current.co2) ? prev : current);

  const handleShare = () => {
    const text = `I'm going green with GreenRoute! 🌱 Traveling from ${estimation.originFormatted} to ${estimation.destinationFormatted} saves CO2. Try it out!`;
    navigator.clipboard.writeText(text);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in-up">
      
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-gray-200 dark:border-slate-700 pb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Trip Impact
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-gray-900 dark:text-gray-200">{estimation.originFormatted}</span> 
            {' '} to {' '} 
            <span className="font-semibold text-gray-900 dark:text-gray-200">{estimation.destinationFormatted}</span>
          </p>
          <div className="flex gap-4 mt-3">
             <span className="bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300">
               📏 {estimation.distanceKm} km
             </span>
             <span className="bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full text-xs font-medium text-green-800 dark:text-green-400 flex items-center gap-1">
               💡 {estimation.greenTip}
             </span>
          </div>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setActiveTab('personal')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'personal' ? 'bg-gray-900 text-white dark:bg-white dark:text-slate-900' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800'}`}
            >
                My Impact
            </button>
            <button 
                onClick={() => setActiveTab('city')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'city' ? 'bg-gray-900 text-white dark:bg-white dark:text-slate-900' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800'}`}
            >
                City View
            </button>
            <button 
                onClick={handleShare}
                className="p-2 text-gray-500 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors relative"
                title="Share Results"
            >
                <Share2 size={20} />
                {showShareToast && (
                    <div className="absolute top-full mt-2 right-0 w-32 bg-gray-900 text-white text-xs py-1 px-2 rounded text-center animate-fade-in">
                        Copied!
                    </div>
                )}
            </button>
        </div>
      </div>

      {activeTab === 'personal' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {emissions.map((e) => (
              <MetricCard key={e.mode} data={e} onSelect={() => onSelectRoute(e)} />
            ))}
          </div>
          <div className="lg:col-span-1 space-y-6">
            <ComparisonChart data={emissions} />
            
            <div className="bg-gradient-to-br from-green-600 to-teal-700 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-bold text-lg mb-2">Why it matters?</h3>
                <p className="text-green-50 text-sm leading-relaxed mb-4">
                   Choosing the <strong>{bestMode.mode}</strong> option saves roughly <strong>{(emissions.find(e => e.mode === TransportMode.CAR)?.co2 || 0) - bestMode.co2}kg of CO₂</strong> compared to driving.
                </p>
                <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                   <div className="text-2xl">🌳</div>
                   <div>
                       <p className="text-xs text-green-200">Environmental Equivalence</p>
                       <p className="font-bold text-sm">Absorbed by a tree in 1 day</p>
                   </div>
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 text-9xl opacity-10 rotate-12">
                  <Leaf />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-4 mb-6">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full text-blue-600 dark:text-blue-400">
                        <Building2 size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">The Power of Collective Action</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">If 1,000 people in your city made this choice...</p>
                    </div>
                </div>
                
                <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🌫️</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">CO₂ Avoided</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                            {((emissions.find(e => e.mode === TransportMode.CAR)?.co2 || 0) * 1000).toLocaleString()} kg
                        </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">⛽</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Fuel Saved</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                            {(estimation.distanceKm * 0.08 * 1000).toFixed(0)} Liters
                        </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">💰</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Community Savings</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                            ${(emissions.find(e => e.mode === TransportMode.CAR)?.cost || 0 * 1000).toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>
            
            <div className="flex flex-col justify-center items-center text-center p-8 text-gray-600 dark:text-gray-400">
                <p className="text-lg mb-4">"Small individual choices, when multiplied by millions, can transform the world."</p>
                <div className="w-24 h-1 bg-green-500 rounded-full mb-4"></div>
                <p className="text-sm">GreenRoute Prototype Data Estimate</p>
            </div>
        </div>
      )}
    </div>
  );
};