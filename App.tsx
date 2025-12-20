
import { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { TripInput } from './components/TripInput';
import { ResultsDashboard } from './components/ResultsDashboard';
import { getRouteDetails } from './services/geminiService';
import { CalculationResult, TransportMode, EmissionData, SearchFilters, UserProfile, TripHistoryItem } from './types';
import { 
  Shield, Info, Mail, ArrowLeft, AlertCircle, 
  FileText, Database, Lock, FileCheck, Cookie,
  Leaf, Activity, BarChart3, X, CheckCircle, HelpCircle
} from 'lucide-react';
import { InfoModal } from './components/InfoModal';
import { UserProfileModal } from './components/UserProfileModal';
import { ChatBot } from './components/ChatBot';

// Emission factors (kg CO2 per km)
const FACTORS = {
  [TransportMode.CAR]: 0.170,  // Average petrol car
  [TransportMode.BUS]: 0.100,  // Average bus
  [TransportMode.TRAIN]: 0.035, // Electric train
  [TransportMode.BIKE]: 0,
  [TransportMode.WALK]: 0,
};

// Speed assumptions (km/h) for estimating time if not driving
const SPEEDS = {
  [TransportMode.BUS]: 0.6, // Ratio to driving speed
  [TransportMode.TRAIN]: 1.2, // Ratio to driving speed
  [TransportMode.BIKE]: 20, // km/h
  [TransportMode.WALK]: 5,  // km/h
};

// Type for modal state
type ModalState = {
  title: string;
  content: React.ReactNode;
  icon: React.ReactNode;
} | null;

// Extracted Content Configuration
const MODAL_CONTENT: Record<string, { icon: React.ReactNode, colorClass: string, content: React.ReactNode }> = {
  'Methodology': {
    icon: <FileText size={24} />,
    colorClass: "bg-purple-100 text-purple-600",
    content: (
      <div className="space-y-4 font-medium">
        <p>Our carbon footprint calculation follows the widely accepted <strong>Distance × Emission Factor</strong> methodology defined by the Greenhouse Gas Protocol.</p>
        <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg border border-gray-100 dark:border-slate-700 text-sm">
          <p className="font-mono text-gray-700 dark:text-gray-300 mb-2 font-black uppercase tracking-widest">Formula:</p>
          <p className="font-bold text-gray-900 dark:text-white">Total CO₂ = Distance (km) × Factor (kg/km)</p>
        </div>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <li className="flex gap-2"><span className="font-black text-red-500 min-w-[60px] uppercase">Car:</span> Based on average petrol passenger vehicles (~0.170 kg CO₂/km).</li>
          <li className="flex gap-2"><span className="font-black text-orange-500 min-w-[60px] uppercase">Bus:</span> Average city bus occupancy emissions (~0.100 kg CO₂/km).</li>
          <li className="flex gap-2"><span className="font-black text-blue-500 min-w-[60px] uppercase">Train:</span> Electric rail regional averages (~0.035 kg CO₂/km).</li>
          <li className="flex gap-2"><span className="font-black text-green-600 min-w-[60px] uppercase">Active:</span> Walking and Cycling assume zero direct carbon emissions.</li>
        </ul>
      </div>
    )
  },
  'Data Sources': {
    icon: <Database size={24} />,
    colorClass: "bg-blue-100 text-blue-600",
    content: (
      <div className="space-y-4 font-medium">
        <p>We aggregate data from reputable open-source environmental databases and AI geographic modeling to ensure accuracy.</p>
        <div className="space-y-3">
          <div>
            <h4 className="font-black text-gray-900 dark:text-white text-xs uppercase tracking-widest mb-1">Emission Factors</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">Derived from the <strong>UK DEFRA 2024 Guidelines</strong> and <strong>US EPA GHG Inventory</strong>, representing standard global averages for transport types.</p>
          </div>
          <div>
            <h4 className="font-black text-gray-900 dark:text-white text-xs uppercase tracking-widest mb-1">Routing & Distances</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">Distance estimation and location processing are powered by <strong>Gemini 3 Pro</strong>, utilizing its extensive internal geographic knowledge to provide precise world-wide travel routes.</p>
          </div>
        </div>
      </div>
    )
  },
  'FAQ': {
    icon: <HelpCircle size={24} />,
    colorClass: "bg-yellow-100 text-yellow-600",
    content: (
      <div className="space-y-4">
        <div>
          <h4 className="font-bold text-gray-900 dark:text-white">Is this app free?</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">Yes! GreenRoute is a free tool to help you make sustainable travel choices.</p>
        </div>
        <div>
          <h4 className="font-bold text-gray-900 dark:text-white">How accurate is the data?</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">We use standard emission factors (UK DEFRA/EPA). However, real-world conditions like traffic and vehicle type can vary.</p>
        </div>
        <div>
          <h4 className="font-bold text-gray-900 dark:text-white">Can I use this for navigation?</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">No. This tool is for estimation and planning purposes only, not for real-time navigation.</p>
        </div>
      </div>
    )
  },
  'Terms of Service': {
    icon: <FileCheck size={24} />,
    colorClass: "bg-teal-100 text-teal-600",
    content: (
      <div className="space-y-4 font-medium">
        <p>By using GreenRoute, you agree to the following terms:</p>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
          <p><strong>1. Informational Purpose:</strong> The carbon footprint data provided is an estimate based on average emission factors. It should not be used for official carbon accounting or regulatory compliance.</p>
          <p><strong>2. Accuracy:</strong> While we strive for accuracy, we cannot guarantee the precision of AI-driven distance calculations for every specific vehicle or route.</p>
          <p><strong>3. Usage:</strong> This tool is provided "as-is" for personal, non-commercial use to encourage sustainable travel habits.</p>
        </div>
      </div>
    )
  },
  'Cookie Policy': {
    icon: <Cookie size={24} />,
    colorClass: "bg-orange-100 text-orange-600",
    content: (
      <div className="space-y-4 font-medium">
        <p>GreenRoute uses essential local storage to improve your experience.</p>
        <p className="text-sm text-gray-600 dark:text-gray-300">We do not use third-party tracking cookies or sell your data to advertisers. Our "cookies" are strictly limited to technical functionality required to store your profile and theme preferences.</p>
      </div>
    )
  },
  'Privacy Policy': {
    icon: <Lock size={24} />,
    colorClass: "bg-red-100 text-red-600",
    content: (
      <div className="space-y-4 font-medium">
        <p>Your privacy is important to us. GreenRoute operates as a client-side application prototype.</p>
        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <li><strong>No Data Storage:</strong> We do not store your search history or personal information on our servers.</li>
          <li><strong>Local Profile:</strong> Your gamification stats (scores, badges) are stored only on your device (LocalStorage).</li>
          <li><strong>API Usage:</strong> Trip data is processed temporarily by Google Gemini to calculate distances, but is not retained by us.</li>
        </ul>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">Last updated: May 2024</p>
      </div>
    )
  },
  'Eco Awareness': {
    icon: <Leaf size={24} />,
    colorClass: "bg-green-100 text-green-600",
    content: (
      <div className="space-y-4 font-medium">
        <p>Calculating your carbon footprint is the first step towards a sustainable lifestyle.</p>
        <p>Transport emissions are a significant contributor to global greenhouse gases. By understanding the impact of your daily commute, you can make informed decisions that collectively reduce our global carbon footprint.</p>
      </div>
    )
  },
  'Compare Modes': {
    icon: <BarChart3 size={24} />,
    colorClass: "bg-blue-100 text-blue-600",
    content: (
      <div className="space-y-4 font-medium">
        <p>Different modes of transport have vastly different environmental impacts.</p>
        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li><strong>Private Cars:</strong> Often the least efficient per person.</li>
            <li><strong>Public Transit:</strong> Buses and trains significantly reduce per-person emissions by sharing the load.</li>
            <li><strong>Active Travel:</strong> Walking and biking produce zero direct emissions and are the gold standard.</li>
        </ul>
      </div>
    )
  },
  'Health Benefits': {
    icon: <Activity size={24} />,
    colorClass: "bg-orange-100 text-orange-600",
    content: (
      <div className="space-y-4 font-medium">
        <p>Choosing active transport isn't just good for the planet—it's great for your body.</p>
        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li><strong>Biking:</strong> Can burn 400+ calories per hour and improves cardiovascular health.</li>
            <li><strong>Walking:</strong> Even walking to the bus stop contributes to your daily activity goals and boosts mental well-being.</li>
        </ul>
      </div>
    )
  },
  'Contact Support': {
    icon: <Mail size={24} />,
    colorClass: "bg-gray-100 text-gray-600",
    content: (
      <div className="space-y-4 font-medium">
        <p>For support inquiries, feedback, or professional collaboration, please reach out directly via email:</p>
        <p className="font-bold text-gray-900 dark:text-white text-lg">dharmarajlgupta@gmail.com</p>
      </div>
    )
  },
  'default': {
    icon: <Info size={24} />,
    colorClass: "bg-gray-100 text-gray-600",
    content: "This page is coming soon! We are currently working on this feature to bring you more value."
  }
};

const DEFAULT_PROFILE: UserProfile = {
  totalCo2Saved: 0,
  totalCaloriesBurned: 0,
  totalTrips: 0,
  badges: [],
  streak: 0,
  lastTripDate: null,
  history: []
};

export default function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ModalState>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem('greenRoute_profile');
    if (savedProfile) {
      setUserProfile(prev => ({ ...prev, ...JSON.parse(savedProfile) }));
    }
    
    const savedTheme = localStorage.getItem('greenRoute_theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
       setIsDarkMode(true);
       document.documentElement.classList.add('dark');
    }
    
    const hasVisited = localStorage.getItem('greenRoute_visited');
    if (!hasVisited) {
      setShowWelcomeBanner(true);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveModal(null);
        setShowProfile(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('greenRoute_theme', newMode ? 'dark' : 'light');
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const dismissWelcome = () => {
    setShowWelcomeBanner(false);
    localStorage.setItem('greenRoute_visited', 'true');
  };

  const handleCalculate = useCallback(async (origin: string, destination: string, filters: SearchFilters) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const estimation = await getRouteDetails(origin, destination);
      const dist = estimation.distanceKm;
      const driveTime = estimation.durationMins;

      const allEmissions: EmissionData[] = [];

      if (filters.modes.car) {
        allEmissions.push({
          mode: TransportMode.CAR,
          co2: Number((dist * FACTORS[TransportMode.CAR]).toFixed(2)),
          calories: 0,
          durationMins: driveTime,
          distanceKm: dist,
          color: '#ef4444',
          cost: Number((dist * 0.15 + 2).toFixed(2)),
          trafficLevel: Math.random() > 0.5 ? 'High' : 'Medium',
          comparisonLabel: ''
        });
      }

      if (filters.modes.transit) {
        // BUS CALCULATION
        const busCost = 2.00 + (dist * 0.10); 
        allEmissions.push({
          mode: TransportMode.BUS,
          co2: Number((dist * FACTORS[TransportMode.BUS]).toFixed(2)),
          calories: 15,
          durationMins: Math.round(driveTime / SPEEDS[TransportMode.BUS]),
          distanceKm: dist,
          color: '#f97316',
          cost: Number(busCost.toFixed(2)),
          crowdLevel: Math.random() > 0.6 ? 'High' : 'Low'
        });

        // TRAIN CALCULATION
        const trainCost = 4.00 + (dist * 0.08);
        allEmissions.push({
          mode: TransportMode.TRAIN,
          co2: Number((dist * FACTORS[TransportMode.TRAIN]).toFixed(2)),
          calories: 20,
          durationMins: Math.round(driveTime / 0.8),
          distanceKm: dist,
          color: '#3b82f6',
          cost: Number(trainCost.toFixed(2)),
          crowdLevel: 'Medium'
        });
      }

      if (filters.modes.active) {
        allEmissions.push({
          mode: TransportMode.BIKE,
          co2: 0,
          calories: Math.round(dist * 30),
          durationMins: Math.round((dist / SPEEDS[TransportMode.BIKE]) * 60),
          distanceKm: dist,
          color: '#16a34a',
          cost: 0,
          comparisonLabel: 'Recommended'
        });
        allEmissions.push({
          mode: TransportMode.WALK,
          co2: 0,
          calories: Math.round(dist * 50),
          durationMins: Math.round((dist / SPEEDS[TransportMode.WALK]) * 60),
          distanceKm: dist,
          color: '#15803d',
          cost: 0
        });
      }

      if (allEmissions.length === 0) {
        throw new Error("Please select at least one transport mode preference.");
      }

      setResult({ estimation, emissions: allEmissions });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectRoute = (data: EmissionData) => {
    const carEmission = result?.emissions.find(e => e.mode === TransportMode.CAR)?.co2 || data.co2;
    const saved = Math.max(0, carEmission - data.co2);
    
    const today = new Date().toISOString().split('T')[0];
    const newProfile = { ...userProfile };
    newProfile.totalCo2Saved += saved;
    newProfile.totalCaloriesBurned += (data.calories || 0);
    newProfile.totalTrips += 1;
    
    const historyItem: TripHistoryItem = {
       id: crypto.randomUUID(),
       origin: result?.estimation.originFormatted || 'Unknown',
       destination: result?.estimation.destinationFormatted || 'Unknown',
       date: new Date().toISOString(),
       mode: data.mode,
       co2Saved: saved,
       distanceKm: data.distanceKm
    };
    newProfile.history = [...(newProfile.history || []), historyItem];

    if (newProfile.lastTripDate !== today) {
        newProfile.streak = newProfile.lastTripDate === new Date(Date.now() - 86400000).toISOString().split('T')[0] 
          ? newProfile.streak + 1 
          : 1;
        newProfile.lastTripDate = today;
    }

    if (newProfile.totalTrips === 1 && !newProfile.badges.includes("First Step")) newProfile.badges.push("First Step");
    if (newProfile.totalCo2Saved > 10 && !newProfile.badges.includes("Carbon Crusader")) newProfile.badges.push("Carbon Crusader");
    if (data.mode === TransportMode.BIKE && !newProfile.badges.includes("Pedal Power")) newProfile.badges.push("Pedal Power");

    setUserProfile(newProfile);
    localStorage.setItem('greenRoute_profile', JSON.stringify(newProfile));

    setToastMessage(`You saved ${saved.toFixed(2)}kg CO₂ today! 🌱`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const openModal = (key: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const data = MODAL_CONTENT[key] || MODAL_CONTENT['default'];
    let content = data.content;
    
    if (!MODAL_CONTENT[key]) {
       content = `The ${key} page is coming soon! We are currently working on this feature to bring you more value.`;
    }

    setActiveModal({
      title: key,
      content: content,
      icon: <div className={`${data.colorClass} w-12 h-12 rounded-full flex items-center justify-center shadow-sm`}>{data.icon}</div>
    });
  };

  return (
    <div className="font-inter transition-colors duration-300">
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col relative transition-colors duration-300">
        
        {showWelcomeBanner && (
          <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-3 relative z-[60]">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="bg-white/20 p-1.5 rounded-full">👋</span>
                <p className="text-sm font-bold">Welcome to GreenRoute! Compare your commute, save carbon, and track your streak!</p>
              </div>
              <button onClick={dismissWelcome} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        {toastMessage && (
          <div className="fixed top-24 right-4 z-[70] animate-in slide-in-from-right fade-in duration-300">
             <div className="bg-white dark:bg-slate-800 border-l-4 border-green-500 shadow-2xl rounded-r-xl p-4 flex items-center gap-4 max-w-sm">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full text-green-600 dark:text-green-400">
                   <CheckCircle size={24} />
                </div>
                <div>
                   <p className="font-black text-gray-900 dark:text-white uppercase text-xs tracking-widest">Trip Logged!</p>
                   <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{toastMessage}</p>
                </div>
                <button onClick={() => setToastMessage(null)} className="ml-auto text-gray-400 hover:text-gray-600">
                   <X size={16} />
                </button>
             </div>
          </div>
        )}

        <Header onOpenProfile={() => setShowProfile(true)} toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
        
        <div className="bg-gradient-to-r from-green-800 to-teal-900 dark:from-teal-950 dark:to-green-950 text-white pt-20 pb-24 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden transition-colors duration-500">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 relative z-10">
              Travel Smarter. <span className="text-green-400 dark:text-green-300 underline underline-offset-8 decoration-white/20">Live Greener.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-green-50 dark:text-green-100 relative z-10 font-medium opacity-90 leading-relaxed">
              Compare the carbon footprint of your daily commute and discover the impact of your choices with AI-powered geographic estimation.
            </p>
        </div>

        <main className="flex-grow">
            {/* Fixed: removed non-existent onViewHistory prop to resolve TypeScript error */}
            <TripInput onCalculate={handleCalculate} isLoading={loading} />

            {error && (
            <div className="max-w-2xl mx-auto mt-12 px-4 animate-fade-in">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-red-100 dark:border-red-900/30 p-8 text-center">
                    <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="text-red-500" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tighter">Calculation Error</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 font-medium leading-relaxed">{error}</p>
                    <button onClick={() => setError(null)} className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl font-black uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-gray-100 transition-all shadow-xl active:scale-95">
                      <ArrowLeft size={18} strokeWidth={3} /> Try Again
                    </button>
                </div>
            </div>
            )}

            {result && <ResultsDashboard result={result} onSelectRoute={handleSelectRoute} userProfile={userProfile} onOpenModal={openModal} />}

            {!result && !loading && !error && (
            <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                <div onClick={() => openModal("Eco Awareness")} className="cursor-pointer p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group border border-gray-100 dark:border-slate-800">
                    <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-green-600 text-3xl group-hover:scale-110 transition-transform shadow-sm">🌱</div>
                    <h3 className="font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tighter">Eco Awareness</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">Understand exactly how much CO2 your vehicle emits per trip.</p>
                </div>
                
                <div onClick={() => openModal("Compare Modes")} className="cursor-pointer p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group border border-gray-100 dark:border-slate-800">
                    <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600 text-3xl group-hover:scale-110 transition-transform shadow-sm">📊</div>
                    <h3 className="font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tighter">Compare Modes</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">Visualize the difference between driving, public transit, and active travel.</p>
                </div>
                
                <div onClick={() => openModal("Health Benefits")} className="cursor-pointer p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group border border-gray-100 dark:border-slate-800">
                    <div className="bg-orange-100 dark:bg-orange-900/30 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-orange-600 text-3xl group-hover:scale-110 transition-transform shadow-sm">💪</div>
                    <h3 className="font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tighter">Health Benefits</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">See how many calories you could burn by biking or walking instead.</p>
                </div>
                </div>
            </div>
            )}
        </main>

        <InfoModal isOpen={!!activeModal} onClose={() => setActiveModal(null)} title={activeModal?.title || ''} content={activeModal?.content || ''} icon={activeModal?.icon} />
        <UserProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} profile={userProfile} />
        <ChatBot />

        <footer className="bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 mt-20 pt-16 pb-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                    <div className="bg-green-600 p-2 rounded-xl text-white shadow-lg shadow-green-600/20">
                      <Shield size={20} />
                    </div>
                    <span className="font-black text-gray-900 dark:text-white text-xl uppercase tracking-tighter">GreenRoute</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                    Empowering commuters to make sustainable travel choices through AI-driven insights and geographic intelligence.
                </p>
                </div>
                
                <div>
                <h4 className="font-black text-gray-900 dark:text-white mb-6 uppercase tracking-widest text-xs">Resources</h4>
                <ul className="space-y-4 text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                    <li><a href="#" onClick={(e) => openModal('FAQ', e)} className="hover:text-green-600 transition-colors">FAQ</a></li>
                    <li><a href="#" onClick={(e) => openModal('Methodology', e)} className="hover:text-green-600 transition-colors">Methodology</a></li>
                    <li><a href="#" onClick={(e) => openModal('Data Sources', e)} className="hover:text-green-600 transition-colors">Data Sources</a></li>
                </ul>
                </div>

                <div>
                <h4 className="font-black text-gray-900 dark:text-white mb-6 uppercase tracking-widest text-xs">Legal</h4>
                <ul className="space-y-4 text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                    <li className="flex items-center gap-2"><Shield size={14} /><a href="#" onClick={(e) => openModal('Privacy Policy', e)} className="hover:text-green-600 transition-colors">Privacy</a></li>
                    <li className="flex items-center gap-2"><Info size={14} /><a href="#" onClick={(e) => openModal('Terms of Service', e)} className="hover:text-green-600 transition-colors">Terms</a></li>
                    <li className="flex items-center gap-2"><Cookie size={14} /><a href="#" onClick={(e) => openModal('Cookie Policy', e)} className="hover:text-green-600 transition-colors">Cookies</a></li>
                </ul>
                </div>

                <div>
                <h4 className="font-black text-gray-900 dark:text-white mb-6 uppercase tracking-widest text-xs">Connect</h4>
                <ul className="space-y-4 text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                    <li className="flex items-center gap-2">
                      <Mail size={14} />
                      <a href="mailto:dharmarajlgupta@gmail.com" className="hover:text-green-600 transition-colors">Support</a>
                    </li>
                    <li>
                      <a href="https://www.linkedin.com/in/dharmaraj-l-gupta-63025a330/" target="_blank" rel="noopener noreferrer" className="hover:text-green-600 transition-colors">LinkedIn</a>
                    </li>
                </ul>
                </div>
            </div>
            
            <div className="pt-8 border-t border-gray-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">© 2024 GreenRoute. Not for commercial navigation. All rights reserved.</p>
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 px-4 py-1 rounded-full border border-gray-100 dark:border-slate-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">AI Engine: Active</span>
                </div>
            </div>
            </div>
        </footer>
        </div>
    </div>
  );
}
