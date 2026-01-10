# Frontend Structure

This is a simple React + TypeScript frontend for the Personal Fashion Suggester app.

## Project Structure

```
vite-project/
├── src/
│   ├── components/          # React components
│   │   ├── AddClothingForm.tsx      # Form to add new clothing items
│   │   ├── WardrobeList.tsx         # Display all wardrobe items
│   │   ├── PersonalInfoSection.tsx  # User personal information form
│   │   ├── OutfitSuggestions.tsx    # Outfit recommendation buttons
│   │   ├── ImportExport.tsx         # Import/Export wardrobe functionality
│   │   └── ImageAutoFill.tsx        # Image upload and auto-fill feature
│   ├── context/
│   │   └── WardrobeContext.tsx      # Context API for global state management
│   ├── types.ts                     # TypeScript type definitions
│   ├── App.tsx                      # Main app component with navigation
│   ├── main.tsx                     # React entry point
│   └── index.css                    # Global styles
├── package.json
├── vite.config.ts                   # Vite configuration with API proxy
└── BACKEND_API_REQUIREMENTS.md      # List of all backend endpoints needed
```

## Features Implemented

### ✅ Completed (Frontend Only)
1. **Add Clothing Form** - Form with all required fields (name, type, color, fabric, fit, brand, graphic size, image)
2. **Wardrobe Display** - Grid view showing all clothing items with images
3. **Personal Info Section** - Form to save gender, height, weight, preferred style
4. **Image Upload** - Can upload images that are stored as base64
5. **Import/Export** - Export wardrobe to JSON file and import back
6. **Tab Navigation** - Simple tab-based navigation between features
7. **Context API** - Global state management using React Context and useReducer

### ⏳ Pending (Requires Backend API)
1. **Image Auto-Fill** - Currently shows placeholder, needs Gemini API integration
2. **Outfit Recommendations** - Buttons are ready, need backend endpoint
3. **Suggest New Clothes** - Placeholder ready, needs backend endpoint

## How to Run

```bash
cd vite-project
npm install
npm run dev
```

The app will run on `http://localhost:5173`

## State Management

The app uses React Context API with `useReducer` for state management. All wardrobe data (clothes + personal info) is stored in `WardrobeContext`.

### State Structure:
```typescript
{
  clothes: ClothingItem[],
  personalInfo: PersonalInfo
}
```

## Connecting to Backend

The Vite proxy is already configured in `vite.config.ts` to forward `/api/*` requests to `http://localhost:8000`.

When calling backend APIs, use relative paths:
```typescript
// ✅ Correct
fetch('/api/clothing')

// ❌ Wrong (causes CORS issues)
fetch('http://localhost:8000/api/clothing')
```

## Next Steps

1. Implement the backend API endpoints listed in `BACKEND_API_REQUIREMENTS.md`
2. Update the placeholder functions in:
   - `OutfitSuggestions.tsx` - Connect to `/api/recommend-outfit` and `/api/suggest-new-clothes`
   - `ImageAutoFill.tsx` - Connect to `/api/analyze-image` for Gemini integration
3. Test the integration between frontend and backend

## Technologies Used

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Context API + useReducer** - State management (no external libraries needed)
- **Plain CSS** - Styling (inline styles for simplicity)

## Notes

- Images are stored as base64 strings (simple for MVP)
- No database - all data is stored in React state
- Export/Import uses JSON files
- All styling is inline for simplicity (can be refactored to CSS modules later)
