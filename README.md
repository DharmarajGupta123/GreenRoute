# GreenRoute 🌿

GreenRoute is an Eco Trip Planner that calculates the carbon footprint of your travel and nudges you toward sustainable choices.

![GreenRoute App](https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1932&auto=format&fit=crop)

## Features

- **Multi-modal Comparison**: Compare Car, Bus, Train, Bike, and Walking options.
- **Carbon Estimates**: Uses standard emission factors (UK DEFRA/EPA) to calculate CO₂ output.
- **AI-Powered**: Uses Google Gemini 2.5 to estimate distances and generate localized "Green Tips".
- **Gamification**: Earn badges and track your "CO₂ Saved" stats over time.
- **Privacy First**: All data is processed client-side or ephemerally; no personal tracking.

## Tech Stack

- React 18
- TypeScript
- Tailwind CSS
- Google Gemini API (@google/genai)
- Recharts (Data Visualization)
- Lucide React (Icons)
- Vite

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/DharmarajGupta123/GreenRoute.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add your Google Gemini API key:
   ```
   API_KEY=your_google_api_key_here
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## License

MIT
