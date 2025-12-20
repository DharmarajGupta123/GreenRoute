
export enum TransportMode {
  CAR = 'Car',
  TRAIN = 'Train',
  BUS = 'Bus',
  BIKE = 'Bike',
  WALK = 'Walk',
}

export interface RouteRequest {
  origin: string;
  destination: string;
}

export interface SearchFilters {
  modes: {
    car: boolean;
    transit: boolean;
    active: boolean;
  };
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface RouteEstimation {
  distanceKm: number;
  durationMins: number; // Driving duration as baseline
  greenTip: string;
  originFormatted: string;
  destinationFormatted: string;
  sources?: GroundingSource[];
}

export interface EmissionData {
  mode: TransportMode;
  co2: number; // in kg
  calories: number; // approx calories burned
  durationMins: number; // adjusted duration
  distanceKm: number; // distance for this specific mode
  color: string;
  cost: number; // Estimated cost in $
  trafficLevel?: 'Low' | 'Medium' | 'High'; 
  crowdLevel?: 'Low' | 'Medium' | 'High';
  comparisonLabel?: string; 
}

export interface CalculationResult {
  estimation: RouteEstimation;
  emissions: EmissionData[];
}

export interface TripHistoryItem {
  id: string;
  origin: string;
  destination: string;
  date: string;
  mode: TransportMode;
  co2Saved: number;
  distanceKm: number;
}

export interface UserProfile {
  totalCo2Saved: number; // kg
  totalCaloriesBurned: number; // kcal
  totalTrips: number;
  badges: string[];
  streak: number;
  lastTripDate: string | null;
  history: TripHistoryItem[];
}
