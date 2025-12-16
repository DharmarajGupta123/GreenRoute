import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { TripInput } from './components/TripInput';
import { ResultsDashboard } from './components/ResultsDashboard';
import { getRouteDetails } from './services/geminiService';
import { CalculationResult, TransportMode, EmissionData, SearchFilters, UserProfile } from './types';
import { 
  Shield, Info, Mail, ArrowLeft, AlertCircle, 
  FileText, Database, Code, Lock, FileCheck, Cookie,
  Leaf, Activity, BarChart3, X, CheckCircle
} from 'lucide-react';
import { InfoModal } from './components/InfoModal';
import { UserProfileModal } from './components/UserProfileModal';

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
      <div className="space-y-4">
        <p>Our carbon footprint calculation follows the widely accepted <strong>Distance × Emission Factor</strong> methodology defined by the Greenhouse Gas Protocol.</p>
        <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg border border-gray-100 dark:border-slate-700 text-sm">
          <p className="font-mono text-gray-700 dark:text-gray-300 mb-2">Formula:</p>
          <p className="font-bold text-gray-900 dark:text-white">Total CO₂ = Distance (km) × Factor (kg/km)</p>
        </div>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <li className="flex gap-2"><span className="font-semibold text-red-500 min-w-[60px]">Car:</span> Based on average petrol passenger vehicles (~0.170 kg CO₂/km).</li>
          <li className="flex gap-2"><span className="font-semibold text-orange-500 min-w-[60px]">Bus:</span> Average city bus occupancy emissions (~0.100 kg CO₂/km).</li>
          <li className="flex gap-2"><span className="font-semibold text-blue-500 min-w-[60px]">Train:</span> Electric rail regional averages (~0.035 kg CO₂/km).</li>
          <li className="flex gap-2"><span className="font-semibold text-green-600 min-w-[60px]">Active:</span> Walking and Cycling assume zero direct carbon emissions.</li>
        </ul>
      </div>
    )
  },
  'Data Sources': {
    icon: <Database size={24} />,
    colorClass: "bg-blue-100 text-blue-600",
    content: (
      <div className="space-y-4">
        <p>We aggregate data from reputable open-source environmental databases and real-time mapping services to ensure accuracy.</p>
        <div className="space-y-3">
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white text-sm">Emission Factors</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">Derived from the <strong>UK DEFRA 2024 Guidelines</strong> and <strong>US EPA GHG Inventory</strong>, representing standard global averages for transport types.</p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white text-sm">Routing & Distances</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">Distance estimation and location processing are powered by <strong>Google Gemini 2.5</strong>, utilizing its geospatial reasoning capabilities to approximate real-world travel routes.</p>
          </div>
        </div>
      </div>
    )
  },
  'Carbon Calculator API': {
    icon: <Code size={24} />,
    colorClass: "bg-indigo-100 text-indigo-600",
    content: (
      <div className="space-y-4">
        <p>GreenRoute offers a conceptual API for developers looking to integrate sustainability metrics into their own applications.</p>
        <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-blue-300 overflow-x-auto">
          <p className="text-gray-400 mb-2">// Example Request</p>
          <p><span className="text-purple-400">GET</span> /api/v1/estimate</p>
          <p className="pl-4">?from=New+York</p>
          <p className="pl-4">?to=Boston</p>
          <p className="pl-4">?mode=mixed</p>
        </div>
        <p className="text-sm">
          <strong>Features:</strong> Multi-modal comparison, calorie burning estimates, and localized green tips. Currently, this application runs as a client-side prototype using the Google GenAI SDK directly.
        </p>
      </div>
    )
  },
  'Terms of Service': {
    icon: <FileCheck size={24} />,
    colorClass: "bg-teal-100 text-teal-600",
    content: (
      <div className="space-y-4">
        <p>By using GreenRoute, you agree to the following terms:</p>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
          <p><strong>1. Informational Purpose:</strong> The carbon footprint data provided is an estimate based on average emission factors. It should not be used for official carbon accounting or regulatory compliance.</p>
          <p><strong>2. Accuracy:</strong> While we strive for accuracy, we cannot guarantee the precision of distance calculations or emission factors for every specific vehicle or route.</p>
          <p><strong>3. Usage:</strong> This tool is provided "as-is" for personal, non-commercial use to encourage sustainable travel habits.</p>
        </div>
      </div>
    )
  },
  'Cookie Policy': {
    icon: <Cookie size={24} />,
    colorClass: "bg-orange-100 text-orange-600",
    content: (
      <div className="space-y-4">
        <p>GreenRoute uses essential local storage to improve your experience.</p>
        <p className="text-sm text-gray-600 dark:text-gray-300">We do not use third-party tracking cookies or sell your data to advertisers. Our "cookies" are strictly limited to technical functionality required to render the map inputs and charts correctly.</p>
      </div>
    )
  },
  'Privacy Policy': {
    icon: <Lock size={24} />,
    colorClass: "bg-red-100 text-red-600",
    content: (
      <div className="space-y-4">
        <p>Your privacy is important to us. GreenRoute operates as a client-side application prototype.</p>
        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <li><strong>No Data Storage:</strong> We do not store your search history, location data, or personal information on our servers.</li>
          <li><strong>Local Profile:</strong> Your gamification stats (scores, badges) are stored only on your device (LocalStorage).</li>
          <li><strong>API Usage:</strong> Trip data is sent temporarily to Google Gemini to calculate distances, but is not retained.</li>
        </ul>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">Last updated: May 2024</p>
      </div>
    )
  },
  'Eco Awareness': {
    icon: <Leaf size={24} />,
    colorClass: "bg-green-100 text-green-600",
    content: (
      <div className="space-y-4">
        <p>Calculating your carbon footprint is the first step towards a sustainable lifestyle.</p>
        <p>Transport emissions are a significant contributor to global greenhouse gases. By understanding the impact of your daily commute, you can make informed decisions that collectively reduce our global carbon footprint.</p>
      </div>
    )
  },
  'Compare Modes': {
    icon: <BarChart3 size={24} />,
    colorClass: "bg-blue-100 text-blue-600",
    content: (
      <div className="space-y-4">
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
      <div className="space-y-4">
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
      <div className="space-y-4">
        <p>For support inquiries, feedback, or professional collaboration, please reach out directly via email:</p>
        <p className="font-bold text-gray-900 dark:text-white text-lg">dharmarajlgupta@gmail.com</p>
      </div>
    )
  },
  // Default fallback content for any missing keys
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
  lastTripDate: null
};

export default function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ModalState>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Soft Onboarding State
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);
  
  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load Profile, Theme, and Onboarding Status from Local Storage
  useEffect(() => {
    const savedProfile = localStorage.getItem('greenRoute_profile');
    if (savedProfile) {
      // Merge with default to ensure new fields (like calories) exist
      setUserProfile(prev => ({ ...prev, ...JSON.parse(savedProfile) }));
    }
    
    // Check system preference for dark mode
    const savedTheme = localStorage.getItem('greenRoute_theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
       setIsDarkMode(true);
    }

    // Check Welcome Banner
    const hasVisited = localStorage.getItem('greenRoute_visited');
    if (!hasVisited) {
      setShowWelcomeBanner(true);
    }
  }, []);

  // Keyboard accessibility: Close modal on Escape key
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

      // Logic to conditionally add modes based on filters
      if (filters.modes.car) {
        allEmissions.push({
          mode: TransportMode.CAR,
          co2: Number((dist * FACTORS[TransportMode.CAR]).toFixed(2)),
          calories: 0,
          durationMins: driveTime,
          color: '#ef4444',
          cost: Number((dist * 0.15 + 2).toFixed(2)), // Approx cost $0.15/km + parking
          trafficLevel: Math.random() > 0.5 ? 'High' : 'Medium', // Simulated
          comparisonLabel: ''
        });
      }

      if (filters.modes.transit) {
        allEmissions.push({
          mode: TransportMode.BUS,
          co2: Number((dist * FACTORS[TransportMode.BUS]).toFixed(2)),
          calories: 15,
          durationMins: Math.round(driveTime / SPEEDS[TransportMode.BUS]),
          color: '#f97316',
          cost: 2.75, // Flat fare simulation
          crowdLevel: Math.random() > 0.6 ? 'High' : 'Low'
        });
        allEmissions.push({
          mode: TransportMode.TRAIN,
          co2: Number((dist * FACTORS[TransportMode.TRAIN]).toFixed(2)),
          calories: 20,
          durationMins: Math.round(driveTime / 0.8),
          color: '#3b82f6',
          cost: 4.50,
          crowdLevel: 'Medium'
        });
      }

      if (filters.modes.active) {
        allEmissions.push({
          mode: TransportMode.BIKE,
          co2: 0,
          calories: Math.round(dist * 30),
          durationMins: Math.round((dist / SPEEDS[TransportMode.BIKE]) * 60),
          color: '#16a34a',
          cost: 0,
          comparisonLabel: 'Recommended'
        });
        allEmissions.push({
          mode: TransportMode.WALK,
          co2: 0,
          calories: Math.round(dist * 50),
          durationMins: Math.round((dist / SPEEDS[TransportMode.WALK]) * 60),
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

  // Gamification Logic
  const handleSelectRoute = (data: EmissionData) => {
    const carEmission = result?.emissions.find(e => e.mode === TransportMode.CAR)?.co2 || data.co2;
    const saved = Math.max(0, carEmission - data.co2);
    
    // Update Profile
    const today = new Date().toISOString().split('T')[0];
    const newProfile = { ...userProfile };
    newProfile.totalCo2Saved += saved;
    newProfile.totalCaloriesBurned += (data.calories || 0);
    newProfile.totalTrips += 1;
    
    // Streak Logic
    if (newProfile.lastTripDate !== today) {
        newProfile.streak = newProfile.lastTripDate === new Date(Date.now() - 86400000).toISOString().split('T')[0] 
          ? newProfile.streak + 1 
          : 1;
        newProfile.lastTripDate = today;
    }

    // Badge Logic
    if (newProfile.totalTrips === 1 && !newProfile.badges.includes("First Step")) newProfile.badges.push("First Step");
    if (newProfile.totalCo2Saved > 10 && !newProfile.badges.includes("Carbon Crusader")) newProfile.badges.push("Carbon Crusader");
    if (data.mode === TransportMode.BIKE && !newProfile.badges.includes("Pedal Power")) newProfile.badges.push("Pedal Power");

    setUserProfile(newProfile);
    localStorage.setItem('greenRoute_profile', JSON.stringify(newProfile));

    // Show toast
    setToastMessage(`You saved ${saved.toFixed(2)}kg CO₂ today! 🌱`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const openModal = (key: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const data = MODAL_CONTENT[key] || MODAL_CONTENT['default'];
    let content = data.content;
    
    // Fallback text if using default
    if (!MODAL_CONTENT[key]) {
       content = `The ${key} page is coming soon! We are currently working on this feature to bring you more value.`;
    }

    setActiveModal({
      title: key,
      content: content,
      icon: <div className={`${data.colorClass} w-12 h-12 rounded-full flex items-center justify-center`}>{data.icon}</div>
    });
  };

  return (
    <div className={`${isDarkMode ? 'dark' : ''} font-inter`}>
        <div className="min-h-screen bg-green-50/30 dark:bg-slate-900 flex flex-col transition-colors duration-300 relative">
        
        {/* Soft Onboarding Banner */}
        {showWelcomeBanner && (
          <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-3 relative z-[60]">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="bg-white/20 p-1.5 rounded-full">👋</span>
                <p className="text-sm font-medium">Welcome to GreenRoute! Compare your commute, save carbon, and track your streak!</p>
              </div>
              <button 
                onClick={dismissWelcome}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Dismiss welcome banner"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Success Toast */}
        {toastMessage && (
          <div className="fixed top-24 right-4 z-[70] animate-in slide-in-from-right fade-in duration-300">
             <div className="bg-white dark:bg-slate-800 border-l-4 border-green-500 shadow-2xl rounded-r-xl p-4 flex items-center gap-4 max-w-sm">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full text-green-600 dark:text-green-400">
                   <CheckCircle size={24} />
                </div>
                <div>
                   <p className="font-bold text-gray-900 dark:text-white">Trip Logged!</p>
                   <p className="text-sm text-gray-600 dark:text-gray-300">{toastMessage}</p>
                </div>
                <button onClick={() => setToastMessage(null)} className="ml-auto text-gray-400 hover:text-gray-600">
                   <X size={16} />
                </button>
             </div>
          </div>
        )}

        <Header 
            onOpenProfile={() => setShowProfile(true)} 
            toggleTheme={toggleTheme}
            isDarkMode={isDarkMode}
        />
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-teal-900 to-green-900 text-white pt-20 pb-24 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 relative z-10">
            Travel Smarter. <span className="text-green-300">Live Greener.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-green-100 relative z-10">
            Compare the carbon footprint of your daily commute and discover the impact of your choices.
            </p>
        </div>

        <main className="flex-grow">
            <TripInput onCalculate={handleCalculate} isLoading={loading} />

            {error && (
            <div className="max-w-2xl mx-auto mt-12 px-4 animate-fade-in">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-red-100 dark:border-red-900/30 p-8 text-center">
                    <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="text-red-500" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Unable to Calculate Route</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
                    <button 
                    onClick={() => setError(null)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                    >
                    <ArrowLeft size={18} />
                    Go Back
                    </button>
                </div>
            </div>
            )}

            {result && (
              <ResultsDashboard 
                result={result} 
                onSelectRoute={handleSelectRoute} 
                userProfile={userProfile}
                onOpenModal={openModal}
              />
            )}

            {!result && !loading && !error && (
            <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-500 dark:text-gray-400">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                <div 
                    onClick={() => openModal("Eco Awareness")}
                    className="cursor-pointer p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                    <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 text-2xl">🌱</div>
                    <h3 className="font-bold text-gray-900 mb-2">Eco Awareness</h3>
                    <p className="text-sm text-gray-500">Understand exactly how much CO2 your vehicle emits per trip.</p>
                </div>
                
                <div 
                    onClick={() => openModal("Compare Modes")}
                    className="cursor-pointer p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                    <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 text-2xl">📊</div>
                    <h3 className="font-bold text-gray-900 mb-2">Compare Modes</h3>
                    <p className="text-sm text-gray-500">Visualize the difference between driving, public transit, and active travel.</p>
                </div>
                
                <div 
                    onClick={() => openModal("Health Benefits")}
                    className="cursor-pointer p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                    <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600 text-2xl">💪</div>
                    <h3 className="font-bold text-gray-900 mb-2">Health Benefits</h3>
                    <p className="text-sm text-gray-500">See how many calories you could burn by biking or walking instead.</p>
                </div>
                </div>
            </div>
            )}
        </main>

        <InfoModal 
            isOpen={!!activeModal}
            onClose={() => setActiveModal(null)}
            title={activeModal?.title || ''}
            content={activeModal?.content || ''}
            icon={activeModal?.icon}
        />

        <UserProfileModal
            isOpen={showProfile}
            onClose={() => setShowProfile(false)}
            profile={userProfile}
        />

        {/* Professional Footer */}
        <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 mt-20 pt-16 pb-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                    <div className="bg-green-600 p-1.5 rounded-lg text-white">
                    <Shield size={20} />
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white text-lg">GreenRoute</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    Empowering commuters to make sustainable travel choices through data-driven insights.
                </p>
                </div>
                
                <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-4">Resources</h4>
                <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
                    <li><a href="#" onClick={(e) => openModal('Methodology', e)} className="hover:text-green-600 transition-colors">Methodology</a></li>
                    <li><a href="#" onClick={(e) => openModal('Data Sources', e)} className="hover:text-green-600 transition-colors">Data Sources</a></li>
                    <li><a href="#" onClick={(e) => openModal('Carbon Calculator API', e)} className="hover:text-green-600 transition-colors">Carbon Calculator API</a></li>
                </ul>
                </div>

                <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-4">Legal</h4>
                <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
                    <li className="flex items-center gap-2"><Shield size={14} /><a href="#" onClick={(e) => openModal('Privacy Policy', e)} className="hover:text-green-600 transition-colors">Privacy Policy</a></li>
                    <li className="flex items-center gap-2"><Info size={14} /><a href="#" onClick={(e) => openModal('Terms of Service', e)} className="hover:text-green-600 transition-colors">Terms of Service</a></li>
                    <li className="flex items-center gap-2"><Cookie size={14} /><a href="#" onClick={(e) => openModal('Cookie Policy', e)} className="hover:text-green-600 transition-colors">Cookie Policy</a></li>
                </ul>
                </div>

                <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-4">Connect</h4>
                <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
                    <li className="flex items-center gap-2">
                    <Mail size={14} />
                    <a href="#" onClick={(e) => openModal('Contact Support', e)} className="hover:text-green-600 transition-colors">Contact Support</a>
                    </li>
                    <li>
                    <a 
                        href="https://www.linkedin.com/in/dharmaraj-l-gupta-63025a330/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-green-600 transition-colors"
                    >
                        LinkedIn
                    </a>
                    </li>
                </ul>
                </div>
            </div>
            
            <div className="pt-8 border-t border-gray-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-xs text-gray-400">
                © 2024 GreenRoute. All rights reserved.
                </p>
                <p className="text-xs text-gray-400">
                Made with 💚 for the planet.
                </p>
            </div>
            </div>
        </footer>
        </div>
    </div>
  );
}