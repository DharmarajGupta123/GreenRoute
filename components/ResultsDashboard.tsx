
import React, { useState, useMemo } from 'react';
import { TransportMode, CalculationResult, EmissionData, UserProfile } from '../types';
import { Car, Bus, Train, Bike, Footprints, Leaf, Timer, Flame, DollarSign, Users, AlertTriangle, Share2, Building2, MousePointerClick, Info, Trees, Ruler, ExternalLink, CheckCircle2 } from 'lucide-react';
import { ComparisonChart } from './ComparisonChart';
import { ImpactSummary } from './ImpactSummary';

interface ResultsDashboardProps {
  result: CalculationResult;
  onSelectRoute: (data: EmissionData) => void;
  userProfile: UserProfile;
  onOpenModal: (key: string) => void;
}

const ECO_TIPS = [
  "Properly inflating car tires improves mileage by 3%.",
  "Aggressive driving (speeding, rapid acceleration) lowers gas mileage by up to 33%.",
  "A generic bike commute burns ~300 calories every 30 minutes.",
  "Public transportation produces 95% less CO₂ per mile than driving alone.",
  "Idling your vehicle for more than 10 seconds uses more fuel than restarting it.",
  "Carrying 100 lbs of extra weight in your trunk reduces fuel economy by up to 2%.",
  "Walking is the most carbon-neutral way to travel—zero emissions!",
  "Using cruise control on the highway can save up to 14% on fuel."
];

const ModeIcon: React.FC<{ mode: TransportMode }> = ({ mode }) => {
  switch (mode) {
    case TransportMode.CAR: return <Car size={20} />;
    case TransportMode.BUS: return <Bus size={20} />;
    case TransportMode.TRAIN: return <Train size={20} />;
    case TransportMode.BIKE: return <Bike size={20} />;
    case TransportMode.WALK: return <Footprints size={20} />;
    default: return <Leaf size={20} />;
  }
};

const MetricCard: React.FC<{ data: EmissionData; onSelect: () => void }> = ({ data, onSelect }) => {
  const isEco = data.co2 === 0 || data.mode === TransportMode.TRAIN || data.mode === TransportMode.BUS;
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    setIsAnimating(true);
    onSelect();
    setTimeout(() => setIsAnimating(false), 500);
  };
  
  return (
    <div 
      className={`
        relative overflow-hidden rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl group flex flex-col h-full
        ${isEco 
          ? 'bg-slate-900/40 dark:bg-slate-800/40 border-green-500/30' 
          : 'bg-slate-900/40 dark:bg-slate-800/40 border-slate-700/50'}
      `}
      role="article"
      aria-labelledby={`mode-title-${data.mode}`}
    >
      {data.comparisonLabel === 'Recommended' && (
        <div className="absolute top-0 right-0 text-[10px] font-black px-3 py-1 bg-green-600 text-white rounded-bl-xl uppercase tracking-widest z-10">
          Recommended
        </div>
      )}
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isEco ? 'bg-green-600/20 text-green-400' : 'bg-slate-700 text-slate-300'}`}>
            <ModeIcon mode={data.mode} />
          </div>
          <div>
            <h4 id={`mode-title-${data.mode}`} className="font-black text-lg text-white tracking-tight">{data.mode}</h4>
          </div>
        </div>

        <div className="flex gap-2">
           {data.trafficLevel && data.mode === TransportMode.CAR && (
              <span className={`text-[10px] px-2 py-1 rounded-lg font-bold flex items-center gap-1.5 ${data.trafficLevel === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}`}>
                <AlertTriangle size={10} /> Traffic: {data.trafficLevel}
              </span>
           )}
           {data.crowdLevel && (data.mode === TransportMode.BUS || data.mode === TransportMode.TRAIN) && (
              <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded-lg font-bold flex items-center gap-1.5">
                <Users size={10} /> Crowd: {data.crowdLevel}
              </span>
           )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6 flex-grow">
        <div className="text-center p-3 bg-slate-950/40 rounded-xl border border-white/5">
          <p className="text-[10px] text-gray-400 mb-1 flex items-center justify-center gap-1 font-bold uppercase tracking-wider">
            <Leaf size={10} aria-hidden="true" /> CO₂
          </p>
          <p className="text-lg font-black text-white">
            {data.co2}<span className="text-xs text-gray-500 font-medium ml-0.5">kg</span>
          </p>
        </div>
        <div className="text-center p-3 bg-slate-950/40 rounded-xl border border-white/5">
          <p className="text-[10px] text-gray-400 mb-1 flex items-center justify-center gap-1 font-bold uppercase tracking-wider">
            <Timer size={10} aria-hidden="true" /> Time
          </p>
          <p className="text-lg font-black text-white">
            {data.durationMins}<span className="text-xs text-gray-500 font-medium ml-0.5">min</span>
          </p>
        </div>
        <div className="text-center p-3 bg-slate-950/40 rounded-xl border border-white/5">
          <p className="text-[10px] text-gray-400 mb-1 flex items-center justify-center gap-1 font-bold uppercase tracking-wider">
            <DollarSign size={10} aria-hidden="true" /> Cost
          </p>
          <p className="text-lg font-black text-white">
            ${data.cost}
          </p>
        </div>
      </div>

      <button 
        onClick={handleClick}
        className={`w-full py-3 rounded-xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95
          ${isEco 
            ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-600/20' 
            : 'bg-slate-700 hover:bg-slate-600 text-white shadow-lg shadow-black/20'
          }
          ${isAnimating ? 'animate-pulse scale-95' : ''}
        `}
        aria-label={`Confirm selection of ${data.mode} for your trip`}
      >
        <CheckCircle2 size={16} aria-hidden="true" />
        {data.mode === TransportMode.CAR ? 'Select Route' : "I'm taking this route!"}
      </button>
    </div>
  );
};

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ result, onSelectRoute, userProfile, onOpenModal }) => {
  const { estimation, emissions } = result;
  const [activeTab, setActiveTab] = useState<'personal' | 'city'>('personal');
  const [showShareToast, setShowShareToast] = useState(false);

  const dailyTip = useMemo(() => ECO_TIPS[Math.floor(Math.random() * ECO_TIPS.length)], []);

  const bestMode = emissions.reduce((prev, current) => (prev.co2 < current.co2) ? prev : current);
  const carMode = emissions.find(e => e.mode === TransportMode.CAR);
  const carCo2 = carMode?.co2 || 0;
  
  const peopleCount = 10000;
  const carbonSavedPerPerson = Math.max(0, carCo2 - bestMode.co2);
  const totalCitySaved = carbonSavedPerPerson * peopleCount;
  const treesEquivalent = Math.round(totalCitySaved / 22);

  const handleShare = () => {
    const text = `I just saved ${(carCo2 - bestMode.co2).toFixed(2)}kg of CO₂ on my commute from ${estimation.originFormatted} to ${estimation.destinationFormatted}! Check your impact at GreenRoute. 🌱`;
    navigator.clipboard.writeText(text);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in-up">
      
      {/* Header Info Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b border-white/5 pb-8 gap-6">
        <div>
          <h2 className="text-4xl font-black text-white mb-2 tracking-tight">
            Trip Impact
          </h2>
          <div className="flex flex-col gap-1">
            <p className="text-gray-400 font-medium">
              <span className="text-white font-bold">{estimation.originFormatted}</span> 
              <span className="mx-2 opacity-30 font-light">to</span>
              <span className="text-white font-bold">{estimation.destinationFormatted}</span>
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-4">
             <div className="bg-slate-800 px-4 py-1.5 rounded-full text-xs font-black text-gray-300 flex items-center gap-2 border border-white/5 shadow-sm">
               <Ruler size={14} className="text-slate-400" aria-hidden="true" /> {estimation.distanceKm} km
             </div>
             <div className="bg-green-600/10 border border-green-600/30 px-4 py-1.5 rounded-full text-xs font-bold text-green-400 flex items-center gap-2">
               💡 {estimation.greenTip}
             </div>
             {/* Only show the link if it exists, but don't show the redundant bubbles */}
             {estimation.sources && estimation.sources[0] && (
               <a 
                 href={estimation.sources[0].uri} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="bg-blue-600/10 border border-blue-600/30 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-2 hover:bg-blue-600/20 transition-colors"
                 aria-label="View original route data on Google Maps"
               >
                 <ExternalLink size={12} aria-hidden="true" /> Map Link
               </a>
             )}
          </div>
        </div>

        <div className="flex gap-2 items-center">
            <button 
                onClick={() => setActiveTab('personal')}
                className={`px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all focus:ring-2 focus:ring-white/20 outline-none ${activeTab === 'personal' ? 'bg-white text-slate-900 shadow-xl' : 'text-gray-400 hover:bg-slate-800 hover:text-white'}`}
                aria-label="View personal journey comparison"
            >
                My Impact
            </button>
            <button 
                onClick={() => setActiveTab('city')}
                className={`px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all focus:ring-2 focus:ring-white/20 outline-none ${activeTab === 'city' ? 'bg-white text-slate-900 shadow-xl' : 'text-gray-400 hover:bg-slate-800 hover:text-white'}`}
                aria-label="View potential city-wide environmental benefit"
            >
                City View
            </button>
            <button 
                onClick={handleShare}
                className="p-2.5 text-gray-400 hover:text-white transition-colors relative focus:ring-2 focus:ring-white/20 outline-none rounded-lg"
                title="Share your impact results"
                aria-label="Share your carbon saving results"
            >
                <Share2 size={24} aria-hidden="true" />
                {showShareToast && (
                    <div className="absolute top-full mt-2 right-0 w-32 bg-slate-900 text-white text-[10px] font-black uppercase py-1.5 px-3 rounded-lg text-center animate-fade-in z-20 border border-white/10 shadow-2xl">
                        Copied!
                    </div>
                )}
            </button>
        </div>
      </div>

      <ImpactSummary profile={userProfile} />

      {activeTab === 'personal' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {emissions.map((e) => (
              <MetricCard key={e.mode} data={e} onSelect={() => onSelectRoute(e)} />
            ))}
          </div>
          
          <div className="lg:col-span-1 space-y-6">
            <div className="relative group">
              <ComparisonChart data={emissions} />
              <button 
                onClick={() => onOpenModal('Methodology')}
                className="absolute top-6 right-6 text-gray-500 hover:text-green-400 transition-colors p-2 hover:bg-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                aria-label="View calculation methodology"
                title="View how we calculate these numbers"
              >
                <Info size={18} aria-hidden="true" />
              </button>
            </div>
            
            <div className="bg-gradient-to-br from-green-600 to-teal-700 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-black text-xl mb-3 tracking-tight">Why it matters?</h3>
                <p className="text-green-50 text-sm leading-relaxed mb-6 opacity-90 font-medium">
                   Choosing the <span className="font-black underline decoration-green-300">{bestMode.mode}</span> option saves roughly <span className="font-black text-white">{carbonSavedPerPerson.toFixed(2)}kg of CO₂</span> compared to driving.
                </p>
                <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/10 flex items-center gap-4">
                   <div className="text-3xl bg-white/10 p-2 rounded-xl" aria-hidden="true">🌳</div>
                   <div>
                       <p className="text-[10px] text-green-200 uppercase tracking-widest font-black mb-1">Environmental Equivalence</p>
                       <p className="font-black text-sm">Absorbed by a tree in 1 day</p>
                   </div>
                </div>
              </div>
              <div className="absolute -right-8 -bottom-8 text-[12rem] opacity-10 rotate-12 pointer-events-none" aria-hidden="true">
                  <Leaf />
              </div>
            </div>

            <div className="bg-slate-800/50 border border-white/5 rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-3 text-orange-400 font-black text-xs uppercase tracking-widest">
                <Leaf size={16} aria-hidden="true" /> Eco Tip of the Day
              </div>
              <p className="text-gray-300 text-sm italic leading-relaxed font-medium">
                "{dailyTip}"
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-slate-800/40 p-8 rounded-3xl border border-white/5 shadow-2xl">
                <div className="flex items-center gap-5 mb-8">
                    <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl text-blue-400">
                        <Building2 size={32} aria-hidden="true" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-white tracking-tight">Collective Action</h3>
                        <p className="text-gray-400 text-sm font-medium">If <strong>{peopleCount.toLocaleString()}</strong> people made this choice...</p>
                    </div>
                </div>
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-5 bg-slate-950/40 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl" aria-hidden="true">🌫️</span>
                            <span className="font-bold text-gray-300">CO₂ Avoided</span>
                        </div>
                        <span className="text-2xl font-black text-white">
                            {totalCitySaved.toLocaleString(undefined, { maximumFractionDigits: 0 })} kg
                        </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-5 bg-green-500/5 rounded-2xl border border-green-500/20">
                        <div className="flex items-center gap-3">
                            <Trees className="text-green-500" size={24} aria-hidden="true" />
                            <span className="font-bold text-gray-300">Trees Saved</span>
                        </div>
                        <span className="text-2xl font-black text-green-500">
                            {treesEquivalent.toLocaleString()}
                        </span>
                    </div>

                    <div className="flex items-center justify-between p-5 bg-slate-950/40 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl" aria-hidden="true">💰</span>
                            <span className="font-bold text-gray-300">Community Savings</span>
                        </div>
                        <span className="text-2xl font-black text-white">
                            ${(carMode?.cost || 0 * peopleCount).toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>
            
            <div className="flex flex-col justify-center items-center text-center p-8 text-gray-400">
                <p className="text-xl mb-6 italic font-medium leading-relaxed">"Small individual choices, when multiplied by millions, can transform the world."</p>
                <div className="w-16 h-1 bg-green-500 rounded-full mb-6"></div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">GreenRoute Impact Model</p>
            </div>
        </div>
      )}
    </div>
  );
};
