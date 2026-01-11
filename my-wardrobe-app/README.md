# St-AI-list: Your Personal AI Stylist

A wardrobe manager + AI stylist we built at SB Hacks! You can track all your clothes and get outfit suggestions based on what you actually own.

## What it does

- Add your clothes to a digital wardrobe (with pics if you want)
- Set up your style profile (sizes, preferences, that kind of stuff)
- Get AI-powered outfit recommendations using Gemini
- Import/export your wardrobe data

We were tired of staring at our closets with "nothing to wear" so we made this lol

## Getting it running

You'll need Node.js installed.

```bash
npm install
```

Create a `.env.local` file and add your Gemini API key:
```
GEMINI_API_KEY=your_key_here
```

Then just:
```bash
npm run dev
```

Open http://localhost:3000 and you're good to go!

## Tech Stack

- React + TypeScript
- Vite for the build
- Google Gemini API for the AI stuff
- LocalStorage for data (keeping it simple)

Built at SB Hacks 2026 ✌️
