import express from 'express';
import fs from 'fs';
import path from 'path';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

// Load .env if present
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [k, ...v] = trimmed.split('=');
        if (k && v.length > 0) {
          const key = k.trim();
          const val = v.join('=').trim().replace(/^["']|["']$/g, '');
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
} catch {
  // Ignore error loading .env
}

const isValidApiKey = (key?: string): boolean => {
  return Boolean(key && typeof key === 'string' && key.trim().length > 15 && !key.includes('your_'));
};

const getApiKey = (): string | undefined => {
  const key = process.env.GEMINI_API_KEY || process.env.API_KEY;
  return isValidApiKey(key) ? key!.trim() : undefined;
};

// Built-in coordinates database for high-accuracy fallback calculation
const CITY_COORDS: Record<string, { lat: number; lng: number; name: string }> = {
  'new york': { lat: 40.7128, lng: -74.006, name: 'New York, NY, USA' },
  'nyc': { lat: 40.7128, lng: -74.006, name: 'New York, NY, USA' },
  'boston': { lat: 42.3601, lng: -71.0589, name: 'Boston, MA, USA' },
  'philadelphia': { lat: 39.9526, lng: -75.1652, name: 'Philadelphia, PA, USA' },
  'washington': { lat: 38.9072, lng: -77.0369, name: 'Washington, D.C., USA' },
  'washington dc': { lat: 38.9072, lng: -77.0369, name: 'Washington, D.C., USA' },
  'chicago': { lat: 41.8781, lng: -87.6298, name: 'Chicago, IL, USA' },
  'los angeles': { lat: 34.0522, lng: -118.2437, name: 'Los Angeles, CA, USA' },
  'la': { lat: 34.0522, lng: -118.2437, name: 'Los Angeles, CA, USA' },
  'san francisco': { lat: 37.7749, lng: -122.4194, name: 'San Francisco, CA, USA' },
  'sf': { lat: 37.7749, lng: -122.4194, name: 'San Francisco, CA, USA' },
  'seattle': { lat: 47.6062, lng: -122.3321, name: 'Seattle, WA, USA' },
  'austin': { lat: 30.2672, lng: -97.7431, name: 'Austin, TX, USA' },
  'houston': { lat: 29.7604, lng: -95.3698, name: 'Houston, TX, USA' },
  'dallas': { lat: 32.7767, lng: -96.797, name: 'Dallas, TX, USA' },
  'miami': { lat: 25.7617, lng: -80.1918, name: 'Miami, FL, USA' },
  'atlanta': { lat: 33.749, lng: -84.388, name: 'Atlanta, GA, USA' },
  'denver': { lat: 39.7392, lng: -104.9903, name: 'Denver, CO, USA' },
  'portland': { lat: 45.5152, lng: -122.6784, name: 'Portland, OR, USA' },
  'london': { lat: 51.5074, lng: -0.1278, name: 'London, UK' },
  'paris': { lat: 48.8566, lng: 2.3522, name: 'Paris, France' },
  'berlin': { lat: 52.52, lng: 13.405, name: 'Berlin, Germany' },
  'amsterdam': { lat: 52.3676, lng: 4.9041, name: 'Amsterdam, Netherlands' },
  'rome': { lat: 41.9028, lng: 12.4964, name: 'Rome, Italy' },
  'madrid': { lat: 40.4168, lng: -3.7038, name: 'Madrid, Spain' },
  'tokyo': { lat: 35.6762, lng: 139.6503, name: 'Tokyo, Japan' },
  'mumbai': { lat: 19.076, lng: 72.8777, name: 'Mumbai, India' },
  'delhi': { lat: 28.6139, lng: 77.209, name: 'Delhi, India' },
  'bengaluru': { lat: 12.9716, lng: 77.5946, name: 'Bengaluru, India' },
  'bangalore': { lat: 12.9716, lng: 77.5946, name: 'Bengaluru, India' },
  'pune': { lat: 18.5204, lng: 73.8567, name: 'Pune, India' },
  'chennai': { lat: 13.0827, lng: 80.2707, name: 'Chennai, India' },
  'kolkata': { lat: 22.5726, lng: 88.3639, name: 'Kolkata, India' },
  'hyderabad': { lat: 17.385, lng: 78.4867, name: 'Hyderabad, India' },
  'ahmedabad': { lat: 23.0225, lng: 72.5714, name: 'Ahmedabad, India' },
  'jaipur': { lat: 26.9124, lng: 75.7873, name: 'Jaipur, India' },
  'indore': { lat: 22.7196, lng: 75.8577, name: 'Indore, India' },
  'bhopal': { lat: 23.2599, lng: 77.4126, name: 'Bhopal, India' },
  'nagpur': { lat: 21.1458, lng: 79.0882, name: 'Nagpur, India' },
  'nashik': { lat: 19.9975, lng: 73.7898, name: 'Nashik, India' },
  'surat': { lat: 21.1702, lng: 72.8311, name: 'Surat, India' },
  'vadodara': { lat: 22.3072, lng: 73.1812, name: 'Vadodara, India' },
  'lucknow': { lat: 26.8467, lng: 80.9462, name: 'Lucknow, India' },
  'kanpur': { lat: 26.4499, lng: 80.3319, name: 'Kanpur, India' },
  'varanasi': { lat: 25.3176, lng: 82.9739, name: 'Varanasi, India' },
  'patna': { lat: 25.5941, lng: 85.1376, name: 'Patna, India' },
  'amritsar': { lat: 31.634, lng: 74.8723, name: 'Amritsar, India' },
  'chandigarh': { lat: 30.7333, lng: 76.7794, name: 'Chandigarh, India' },
  'thane': { lat: 19.2183, lng: 72.9781, name: 'Thane, India' },
  'navi mumbai': { lat: 19.033, lng: 73.0297, name: 'Navi Mumbai, India' },
  'andheri': { lat: 19.1136, lng: 72.8697, name: 'Andheri, Mumbai, India' },
  'bandra': { lat: 19.0596, lng: 72.8295, name: 'Bandra, Mumbai, India' },
  'borivali': { lat: 19.2307, lng: 72.8567, name: 'Borivali, Mumbai, India' },
  'dadar': { lat: 19.0178, lng: 72.8478, name: 'Dadar, Mumbai, India' },
  'powai': { lat: 19.1176, lng: 72.906, name: 'Powai, Mumbai, India' },
  'kurla': { lat: 19.0728, lng: 72.8847, name: 'Kurla, Mumbai, India' },
  'mulund': { lat: 19.1726, lng: 72.956, name: 'Mulund, Mumbai, India' },
  'vashi': { lat: 19.077, lng: 72.9989, name: 'Vashi, Navi Mumbai, India' },
  'kalyan': { lat: 19.2437, lng: 73.1355, name: 'Kalyan, India' },
  'dombivli': { lat: 19.2167, lng: 73.0865, name: 'Dombivli, India' },
  'vasai': { lat: 19.3919, lng: 72.8397, name: 'Vasai, India' },
  'virar': { lat: 19.4559, lng: 72.811, name: 'Virar, India' },
  'ghatkopar': { lat: 19.0778, lng: 72.9085, name: 'Ghatkopar, Mumbai, India' },
  'chembur': { lat: 19.0522, lng: 72.9006, name: 'Chembur, Mumbai, India' },
  'sion': { lat: 19.043, lng: 72.8645, name: 'Sion, Mumbai, India' },
  'worli': { lat: 19.017, lng: 72.8185, name: 'Worli, Mumbai, India' },
  'juhu': { lat: 19.1003, lng: 72.834, name: 'Juhu, Mumbai, India' },
  'goregaon': { lat: 19.1663, lng: 72.8526, name: 'Goregaon, Mumbai, India' },
  'malad': { lat: 19.1865, lng: 72.8489, name: 'Malad, Mumbai, India' },
  'kandivali': { lat: 19.2047, lng: 72.8428, name: 'Kandivali, Mumbai, India' },
  'mira road': { lat: 19.2813, lng: 72.8398, name: 'Mira Road, India' },
  'lonavala': { lat: 18.7546, lng: 73.4062, name: 'Lonavala, India' },
  'aurangabad': { lat: 19.8762, lng: 75.3433, name: 'Chhatrapati Sambhajinagar (Aurangabad), India' },
  'kolhapur': { lat: 16.705, lng: 74.2433, name: 'Kolhapur, India' },
  'solapur': { lat: 17.6599, lng: 75.9064, name: 'Solapur, India' },
  'amravati': { lat: 20.9374, lng: 77.7796, name: 'Amravati, India' },
  'jalgaon': { lat: 20.9973, lng: 75.5525, name: 'Jalgaon, India' },
  'goa': { lat: 15.2993, lng: 74.124, name: 'Goa, India' },
  'panaji': { lat: 15.4909, lng: 73.8278, name: 'Panaji, Goa, India' },
  'agra': { lat: 27.1767, lng: 78.0081, name: 'Agra, India' },
  'noida': { lat: 28.5355, lng: 77.391, name: 'Noida, India' },
  'ghaziabad': { lat: 28.6692, lng: 77.4538, name: 'Ghaziabad, India' },
  'gurgaon': { lat: 28.4595, lng: 77.0266, name: 'Gurugram (Gurgaon), India' },
  'gurugram': { lat: 28.4595, lng: 77.0266, name: 'Gurugram, India' },
  'faridabad': { lat: 28.4089, lng: 77.3178, name: 'Faridabad, India' },
  'prayagraj': { lat: 25.4358, lng: 81.8463, name: 'Prayagraj, India' },
  'allahabad': { lat: 25.4358, lng: 81.8463, name: 'Prayagraj (Allahabad), India' },
  'gorakhpur': { lat: 26.7606, lng: 83.3732, name: 'Gorakhpur, India' },
  'jhansi': { lat: 25.4484, lng: 78.5685, name: 'Jhansi, India' },
  'bareilly': { lat: 28.367, lng: 79.4304, name: 'Bareilly, India' },
  'dehradun': { lat: 30.3165, lng: 78.0322, name: 'Dehradun, India' },
  'haridwar': { lat: 29.9457, lng: 78.1642, name: 'Haridwar, India' },
  'shimla': { lat: 31.1048, lng: 77.1734, name: 'Shimla, India' },
  'udaipur': { lat: 24.5854, lng: 73.7125, name: 'Udaipur, India' },
  'jodhpur': { lat: 26.2389, lng: 73.0243, name: 'Jodhpur, India' },
  'kota': { lat: 25.2138, lng: 75.8648, name: 'Kota, India' },
  'ajmer': { lat: 26.4499, lng: 74.6399, name: 'Ajmer, India' },
  'gwalior': { lat: 26.2183, lng: 78.1828, name: 'Gwalior, India' },
  'jabalpur': { lat: 23.1815, lng: 79.9864, name: 'Jabalpur, India' },
  'ujjain': { lat: 23.1765, lng: 75.7885, name: 'Ujjain, India' },
  'raipur': { lat: 21.2514, lng: 81.6296, name: 'Raipur, India' },
  'ranchi': { lat: 23.3441, lng: 85.3096, name: 'Ranchi, India' },
  'jamshedpur': { lat: 22.8046, lng: 86.2029, name: 'Jamshedpur, India' },
  'bhubaneswar': { lat: 20.2961, lng: 85.8245, name: 'Bhubaneswar, India' },
  'guwahati': { lat: 26.1445, lng: 91.7362, name: 'Guwahati, India' },
  'ludhiana': { lat: 30.901, lng: 75.8573, name: 'Ludhiana, India' },
  'jalandhar': { lat: 31.326, lng: 75.5762, name: 'Jalandhar, India' },
  'mysore': { lat: 12.2958, lng: 76.6394, name: 'Mysuru (Mysore), India' },
  'mysuru': { lat: 12.2958, lng: 76.6394, name: 'Mysuru, India' },
  'mangalore': { lat: 12.9141, lng: 74.856, name: 'Mangaluru (Mangalore), India' },
  'hubli': { lat: 15.3647, lng: 75.124, name: 'Hubballi (Hubli), India' },
  'tirupati': { lat: 13.6288, lng: 79.4192, name: 'Tirupati, India' },
  'vijayawada': { lat: 16.5062, lng: 80.648, name: 'Vijayawada, India' },
  'visakhapatnam': { lat: 17.6868, lng: 83.2185, name: 'Visakhapatnam, India' },
  'vizag': { lat: 17.6868, lng: 83.2185, name: 'Visakhapatnam, India' },
  'kochi': { lat: 9.9312, lng: 76.2673, name: 'Kochi, India' },
  'cochin': { lat: 9.9312, lng: 76.2673, name: 'Kochi, India' },
  'trivandrum': { lat: 8.5241, lng: 76.9366, name: 'Thiruvananthapuram, India' },
  'madurai': { lat: 9.9252, lng: 78.1198, name: 'Madurai, India' },
  'coimbatore': { lat: 11.0168, lng: 76.9558, name: 'Coimbatore, India' },
  'salem': { lat: 11.6643, lng: 78.146, name: 'Salem, India' },
  'trichy': { lat: 10.7905, lng: 78.7047, name: 'Tiruchirappalli, India' },
  'singapore': { lat: 1.3521, lng: 103.8198, name: 'Singapore' },
  'sydney': { lat: -33.8688, lng: 151.2093, name: 'Sydney, Australia' },
  'melbourne': { lat: -37.8136, lng: 144.9631, name: 'Melbourne, Australia' },
  'toronto': { lat: 43.6532, lng: -79.3832, name: 'Toronto, Canada' },
  'vancouver': { lat: 49.2827, lng: -123.1207, name: 'Vancouver, Canada' },
  'dubai': { lat: 25.2048, lng: 55.2708, name: 'Dubai, UAE' },
};

function findCity(query: string) {
  const clean = query.trim().toLowerCase();
  // 1. Exact match first.
  for (const [key, val] of Object.entries(CITY_COORDS)) {
    if (clean === key) return val;
  }
  // 2. Whole-word match (e.g. "mumbai city" -> mumbai). Short keys like 'la'
  //    or 'sf' must only match as a whole word, never as a substring —
  //    otherwise "islamabad" would match 'la' and "kolkata" would be at risk.
  const words = clean.split(/[^a-z]+/).filter(Boolean);
  for (const [key, val] of Object.entries(CITY_COORDS)) {
    if (!key.includes(' ') && words.includes(key)) return val;
    if (key.includes(' ') && clean.includes(key)) return val;
  }
  // 3. Long names only: allow a longer query to contain a 4+ letter city name.
  for (const [key, val] of Object.entries(CITY_COORDS)) {
    if (key.length >= 4 && clean.includes(key)) return val;
  }
  return null;
}

function calculateHaversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const direct = R * c;
  // Road distance is longer than the straight line. 1.25x is a rough
  // average; it is an estimate, not a measured route. Above 2000 km
  // there is usually no road route (ocean crossing), so keep the air
  // distance instead of inflating it by 25%.
  return direct < 2000 ? direct * 1.25 : direct;
}

// Returns null when either city is not in the built-in list, instead of
// inventing a distance. Callers must handle null with a clear error — a
// made-up 12-57 km guess (the old hash fallback) was wrong for real routes
// like Indore -> Bhopal (~195 km, shown as 13 km).
function generateLocalEstimate(origin: string, destination: string) {
  const cityA = findCity(origin);
  const cityB = findCity(destination);
  if (!cityA || !cityB) return null;

  const originFormatted = cityA.name;
  const destinationFormatted = cityB.name;
  const distanceKm = calculateHaversine(cityA.lat, cityA.lng, cityB.lat, cityB.lng);

  // Driving duration from distance / average driving speed. This must stay
  // a DRIVING duration for road routes — the old code switched to a flight
  // formula above 1000 km, so Mumbai -> Delhi (1148 km) came back as
  // 176 min, which is a flight time, not a drive. Real drive is ~17-24 h.
  // Speeds: city <=50 km: 30 km/h, <=300 km: 55 km/h, longer: 85 km/h highway.
  // Above 2000 km there is no road route, so use the flight formula instead.
  let durationMins: number;
  if (distanceKm > 2000) {
    durationMins = Math.round((distanceKm / 800) * 60 + 90); // flight + buffer
  } else {
    const speedKmh = distanceKm <= 50 ? 30 : distanceKm <= 300 ? 55 : 85;
    durationMins = Math.round((distanceKm / speedKmh) * 60);
  }

  if (distanceKm < 1) durationMins = 15;
  if (durationMins < 5) durationMins = 15;

  let greenTip = 'Opting for rail or bus over single-occupancy driving significantly cuts greenhouse gas emissions.';
  if (distanceKm < 10) {
    greenTip = 'This route is perfect for cycling or walking, which eliminates 100% of direct carbon emissions!';
  } else if (distanceKm > 1000) {
    greenTip = 'For long-haul journeys, choosing direct flights or high-speed rail minimizes takeoff fuel burn.';
  }

  return {
    distanceKm: Number(distanceKm.toFixed(1)),
    durationMins,
    greenTip,
    originFormatted,
    destinationFormatted,
    sources: [],
  };
}

export const app = express();
app.use(express.json());

app.post('/api/route-estimate', async (req, res) => {
  const { origin, destination } = req.body;
  if (!origin || !destination) {
    res.status(400).json({ error: 'Origin and destination are required.' });
    return;
  }

  const apiKey = getApiKey();

  // If no API key is configured, immediately return the smart geographic calculation
  if (!apiKey) {
    const estimate = generateLocalEstimate(origin, destination);
    if (!estimate) {
      res.status(400).json({ error: `Could not estimate ${origin} to ${destination}. One of these places is not in the built-in list — try a nearby major city like Mumbai, Pune or Delhi.` });
      return;
    }
    res.json(estimate);
    return;
  }

  // If API key is present, attempt Gemini with a strict 5-second timeout so it never hangs
  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `
      Estimate the ROAD driving distance and driving duration for a trip from "${origin}" to "${destination}".
      Return the road distance in kilometers (km) and the driving duration in minutes — not flight time.
      Only if no road route exists at all (for example across an ocean, like Mumbai to London), return the air distance and the flight duration instead.
    `;

    const aiPromise = ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            distanceKm: {
              type: Type.NUMBER,
              description: 'Estimated travel distance in kilometers (numeric value).',
            },
            durationMins: {
              type: Type.NUMBER,
              description: 'Estimated baseline travel duration in minutes (numeric value).',
            },
            greenTip: {
              type: Type.STRING,
              description: 'One sentence eco-friendly travel tip for this specific route.',
            },
            originFormatted: {
              type: Type.STRING,
              description: 'Official formatted origin city/place name.',
            },
            destinationFormatted: {
              type: Type.STRING,
              description: 'Official formatted destination city/place name.',
            },
          },
          required: ['distanceKm', 'durationMins', 'greenTip', 'originFormatted', 'destinationFormatted'],
        },
      },
    });

    // 5-second timeout fallback
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI response timed out')), 5000)
    );

    const response = await Promise.race([aiPromise, timeoutPromise]);
    const jsonText = (response.text ?? '{}').trim();
    const parsed = JSON.parse(jsonText);

    let distanceKm = Number(parsed.distanceKm) || 0;
    let durationMins = Number(parsed.durationMins) || 0;
    const greenTip = parsed.greenTip || 'Try choosing more direct routes to minimize your carbon overhead.';
    const originFormatted = parsed.originFormatted || origin;
    const destinationFormatted = parsed.destinationFormatted || destination;

    // Sanity-check Gemini against the local estimate when both cities are
    // known: if Gemini returns a distance far below the straight-line
    // distance (for example a few hundred km for Mumbai -> Delhi), it is
    // wrong — use the local estimate instead of showing it.
    const fallback = generateLocalEstimate(origin, destination);
    if (fallback && distanceKm > 0 && distanceKm < fallback.distanceKm * 0.5) {
      distanceKm = fallback.distanceKm;
      durationMins = fallback.durationMins;
    }
    if (distanceKm <= 0 || durationMins <= 0) {
      if (!fallback) {
        res.status(500).json({ error: `Unable to estimate ${origin} to ${destination} right now. Gemini was unavailable and one of these places is not in the built-in list — try a nearby major city.` });
        return;
      }
      if (distanceKm <= 0) distanceKm = fallback.distanceKm;
      if (durationMins <= 0) durationMins = fallback.durationMins;
    }

    res.json({
      distanceKm: Number(distanceKm.toFixed(1)),
      durationMins: Math.round(durationMins),
      greenTip,
      originFormatted,
      destinationFormatted,
      sources: [],
    });
  } catch (err) {
    console.warn('Gemini route estimation failed or timed out, using geographic calculator fallback:', err);
    const fallback = generateLocalEstimate(origin, destination);
    if (!fallback) {
      res.status(500).json({ error: `Unable to estimate ${origin} to ${destination} right now. Gemini was unavailable and one of these places is not in the built-in list — try a nearby major city.` });
      return;
    }
    res.json(fallback);
  }
});

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    res.status(400).json({ error: 'Message is required.' });
    return;
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    res.json({
      text: 'I am your GreenRoute Eco-Assistant! To unlock real-time AI responses, configure your GEMINI_API_KEY. In the meantime, remember: choosing public transit or cycling for trips under 10km can cut your personal carbon emissions by over 80%!',
    });
    return;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const aiPromise = ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction:
          'You are an elite environmental advisor for the GreenRoute app. Your goal is to encourage sustainable commuting. Use data points about CO2 reduction, health benefits of active travel, and urban planning. Be concise, expert, and friendly.',
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI chat timed out')), 6000)
    );

    const response = await Promise.race([aiPromise, timeoutPromise]);
    res.json({
      text: response.text || 'I am processing your request. Please try asking in a different way.',
    });
  } catch (error) {
    console.warn('Gemini chat error, fallback response provided:', error);
    res.json({
      text: 'Sustainable commuting makes a huge difference! For trips under 15 km, trains and buses reduce emissions by up to 90% per passenger compared to driving solo.',
    });
  }
});
