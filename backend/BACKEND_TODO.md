# Backend API Implementation Checklist

This is a concise checklist of all the backend endpoints you need to implement for the Personal Fashion Suggester app.

## Setup Requirements

- [ ] Install required packages: `python -m pip install fastapi uvicorn python-multipart google-generativeai pillow`
- [ ] Set up JSON file storage (create `wardrobe.json` and `personal_info.json` files)
- [ ] Get Google Gemini API key for image analysis

---

## 1. Clothing Management Endpoints

### `POST /api/clothing`
- **Purpose**: Add a new clothing item to the wardrobe
- **Request**: JSON with clothing item data (name, type, color, fabric, fit, brand, graphicSize, imageUrl)
- **Response**: Created clothing item with ID
- **Storage**: Save to `wardrobe.json` file

### `GET /api/clothing`
- **Purpose**: Get all clothing items
- **Response**: Array of all clothing items
- **Storage**: Read from `wardrobe.json` file

### `GET /api/clothing/{item_id}`
- **Purpose**: Get a specific clothing item by ID
- **Response**: Single clothing item object

### `DELETE /api/clothing/{item_id}`
- **Purpose**: Remove a clothing item from wardrobe
- **Response**: Success message
- **Storage**: Update `wardrobe.json` file

---

## 2. Personal Information Endpoints

### `POST /api/personal-info`
- **Purpose**: Save/update user's personal information
- **Request**: JSON with personal info (gender, height, weight, preferredStyle, otherDescription)
- **Response**: Saved personal info
- **Storage**: Save to `personal_info.json` file

### `GET /api/personal-info`
- **Purpose**: Get user's personal information
- **Response**: Personal info object
- **Storage**: Read from `personal_info.json` file

---

## 3. Image Analysis Endpoint (Gemini Integration) ⭐ MOST COMPLEX

### `POST /api/analyze-image`
- **Purpose**: Analyze a clothing image and extract attributes automatically
- **Request**: Base64 encoded image
- **Response**: Detected attributes (name, color, type, fabricType, brand, graphicSize, fit, confidence scores)
- **Implementation**:
  - Use Google Gemini Vision API
  - Send image to Gemini with a prompt to analyze clothing
  - Parse Gemini's response to extract attributes
  - Return structured data

**Gemini Integration Steps**:
1. Install: `python -m pip install google-generativeai`
2. Get API key from Google AI Studio
3. Create a prompt asking Gemini to analyze the clothing image
4. Extract clothing attributes from Gemini's response
5. Return as JSON

---

## 4. Outfit Recommendation Endpoints

### `POST /api/recommend-outfit`
- **Purpose**: Get outfit recommendation based on wardrobe
- **Request**: Optional outfitType, occasion, personalInfo
- **Response**: Recommended outfit (top, bottom, outerwear, shoes) + reasoning + missing items
- **Logic**:
  - Analyze wardrobe items
  - Match items based on style, color, fit compatibility
  - Consider personal preferences
  - Return best matching outfit or suggest what's missing

### `POST /api/suggest-new-clothes`
- **Purpose**: Suggest new clothing items to add based on wardrobe gaps
- **Request**: Personal info and preferences
- **Response**: Suggestions for new items with reasoning
- **Logic**:
  - Analyze current wardrobe (what types/colors/fits exist)
  - Identify gaps (e.g., no jackets, no formal wear)
  - Suggest items that would complement existing wardrobe
  - Consider personal style preferences
  - Optionally use Gemini to generate intelligent suggestions

---

## 5. Import/Export Endpoints

### `POST /api/import-wardrobe`
- **Purpose**: Import wardrobe from JSON file
- **Request**: Full wardrobe data (clothes array + personalInfo)
- **Response**: Success message + count of items imported
- **Storage**: Overwrite `wardrobe.json` and `personal_info.json`

### `GET /api/export-wardrobe`
- **Purpose**: Export entire wardrobe as JSON
- **Response**: Complete wardrobe data with all images as base64
- **Storage**: Read from `wardrobe.json` and `personal_info.json`

---

## 6. Wardrobe Statistics Endpoint (Optional but Useful)

### `GET /api/wardrobe/stats`
- **Purpose**: Get statistics and analysis of wardrobe
- **Response**: Statistics (total items, by type, by color, by fit), completeness score, recommendations
- **Logic**:
  - Count items by type, color, fit
  - Calculate wardrobe "completeness" (0-1 score)
  - Generate basic recommendations

---

## File Structure Suggestion

```
backend/
├── main.py                 # FastAPI app (routes)
├── models.py               # Pydantic models for request/response validation
├── storage.py              # Functions to read/write JSON files
├── gemini_service.py       # Gemini API integration functions
├── wardrobe.json           # Data storage (clothing items)
├── personal_info.json      # Data storage (user info)
└── requirements.txt        # Python dependencies
```

---

## Priority Order (Recommended Implementation Order)

1. **Start Simple**: Clothing CRUD endpoints (POST, GET, DELETE /api/clothing)
2. **Add Personal Info**: Personal info endpoints (POST, GET /api/personal-info)
3. **Add Import/Export**: Import/Export endpoints (for data persistence)
4. **Add Statistics**: Wardrobe stats endpoint (useful for outfit recommendations)
5. **Add Outfit Recommendations**: Basic recommendation logic
6. **Add Gemini Integration**: Image analysis endpoint (most complex)
7. **Enhance Recommendations**: Use Gemini for smarter suggestions

---

## Quick Start Checklist

1. [ ] Create `storage.py` with functions to read/write JSON files
2. [ ] Create `models.py` with Pydantic models matching frontend types
3. [ ] Implement basic endpoints in `main.py`:
   - [ ] POST /api/clothing
   - [ ] GET /api/clothing
   - [ ] DELETE /api/clothing/{id}
   - [ ] POST /api/personal-info
   - [ ] GET /api/personal-info
4. [ ] Test endpoints with frontend
5. [ ] Add import/export endpoints
6. [ ] Add outfit recommendation logic
7. [ ] Set up Gemini API and implement image analysis
8. [ ] Test full integration

---

## Testing Tips

- Use FastAPI's built-in docs at `http://localhost:8000/docs` to test endpoints
- Test with the React frontend by adding clothing items
- Check that data persists in JSON files
- Test image upload and Gemini integration separately first

---

## Important Notes

- **CORS**: Already configured in your `main.py` - allows requests from `http://localhost:5173`
- **Image Storage**: For MVP, store images as base64 strings in JSON (simple but not scalable for production)
- **Error Handling**: Add try/except blocks for file operations and API calls
- **Data Validation**: Use Pydantic models to validate request data
- **Gemini API Key**: Store in environment variable, not in code
