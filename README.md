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

## Setup & Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/DharmarajGupta123/GreenRoute.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API key:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Deploying to Vercel (Permanent 24/7 Hosting)

GreenRoute is pre-configured with `vercel.json` and a serverless API handler (`api/index.ts`).

### Option 1: Via GitHub (Recommended)
1. Push this project to your GitHub repository (e.g. `https://github.com/DharmarajGupta123/GreenRoute`).
2. Go to [vercel.com](https://vercel.com) and log in.
3. Click **"Add New..."** > **"Project"**.
4. Select your **GreenRoute** repository and click **Import**.
5. Under **Environment Variables**, add:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: Your Gemini API key from [Google AI Studio](https://aistudio.google.com/)
6. Click **Deploy**. Vercel will build the frontend into `dist` and deploy the backend `/api` routes as Serverless Functions.

### Option 2: Via Vercel CLI
1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```
2. In your project directory, run:
   ```bash
   vercel
   ```
3. Set your environment variable when prompted or in your Vercel Project Settings (`Settings` > `Environment Variables` > `GEMINI_API_KEY`).
4. Run `vercel --prod` to deploy to production.

## License

MIT
