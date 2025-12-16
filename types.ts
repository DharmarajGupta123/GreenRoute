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

export interface RouteEstimation {
  distanceKm: number;
  durationMins: number; // Driving duration as baseline
  greenTip: string;
  originFormatted: string;
  destinationFormatted: string;
}

export interface EmissionData {
  mode: TransportMode;
  co2: number; // in kg
  calories: number; // approx calories burned
  durationMins: number; // adjusted duration
  color: string;
  // New Fields for Enhanced Prototype
  cost: number; // Estimated cost in $
  trafficLevel?: 'Low' | 'Medium' | 'High'; // For Car/Bus
  crowdLevel?: 'Low' | 'Medium' | 'High'; // For Transit
  comparisonLabel?: string; // e.g., "Fastest", "Cheapest"
}

export interface CalculationResult {
  estimation: RouteEstimation;
  emissions: EmissionData[];
}

export interface UserProfile {
  totalCo2Saved: number; // kg
  totalCaloriesBurned: number; // kcal
  totalTrips: number;
  badges: string[];
  streak: number;
  lastTripDate: string | null;
}