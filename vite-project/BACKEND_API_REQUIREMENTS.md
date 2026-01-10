# Backend API Requirements

This document lists all the backend API endpoints that need to be implemented in your FastAPI backend.

## Base URL
All API endpoints should be prefixed with `/api`

---

## 1. Clothing Management Endpoints

### `POST /api/clothing`
**Purpose:** Add a new clothing item to the wardrobe

**Request Body:**
```json
{
  "name": "string",
  "fabricType": "cotton" | "polyester" | "wool" | "denim" | "leather" | "silk" | "linen" | "other",
  "fit": "baggy" | "regular" | "tight",
  "brand": "string (optional)",
  "color": "string",
  "type": "hoodie" | "t-shirt" | "jacket" | "sweater" | "pants" | "shirt" | "shorts" | "dress" | "other",
  "graphicSize": "large" | "small" | "none",
  "imageUrl": "string (base64 encoded image)"
}
```

**Response:**
```json
{
  "id": "string",
  "message": "Clothing item added successfully",
  "item": { /* full clothing item object */ }
}
```

---

### `GET /api/clothing`
**Purpose:** Get all clothing items in the wardrobe

**Response:**
```json
{
  "clothes": [
    {
      "id": "string",
      "name": "string",
      "fabricType": "string",
      "fit": "string",
      "brand": "string",
      "color": "string",
      "type": "string",
      "graphicSize": "string",
      "imageUrl": "string"
    }
  ]
}
```

---

### `GET /api/clothing/{item_id}`
**Purpose:** Get a specific clothing item by ID

**Response:**
```json
{
  "id": "string",
  "name": "string",
  /* ... other fields ... */
}
```

---

### `DELETE /api/clothing/{item_id}`
**Purpose:** Remove a clothing item from the wardrobe

**Response:**
```json
{
  "message": "Clothing item deleted successfully"
}
```

---

## 2. Personal Information Endpoints

### `POST /api/personal-info`
**Purpose:** Save/update user's personal information

**Request Body:**
```json
{
  "gender": "string (optional)",
  "height": "string (optional)",
  "weight": "string (optional)",
  "preferredStyle": "string (optional)",
  "otherDescription": "string (optional)"
}
```

**Response:**
```json
{
  "message": "Personal info saved successfully",
  "personalInfo": { /* full personal info object */ }
}
```

---

### `GET /api/personal-info`
**Purpose:** Get user's personal information

**Response:**
```json
{
  "gender": "string",
  "height": "string",
  "weight": "string",
  "preferredStyle": "string",
  "otherDescription": "string"
}
```

---

## 3. Image Analysis Endpoint (Gemini Integration)

### `POST /api/analyze-image`
**Purpose:** Analyze a clothing image and extract attributes automatically

**Request Body:**
```json
{
  "image": "string (base64 encoded image)"
}
```

**Response:**
```json
{
  "name": "string (detected name, if any)",
  "color": "string (detected primary color)",
  "type": "string (detected clothing type)",
  "fabricType": "string (detected fabric, if possible)",
  "brand": "string (detected brand, if visible)",
  "graphicSize": "large" | "small" | "none",
  "fit": "baggy" | "regular" | "tight (estimated)",
  "confidence": {
    "color": 0.95,
    "type": 0.88,
    "brand": 0.45
  }
}
```

**Notes:**
- This endpoint should integrate with Google Gemini API
- Use Gemini Vision API to analyze the image
- Return as many detected attributes as possible
- Include confidence scores for each detected attribute

---

## 4. Outfit Recommendation Endpoints

### `POST /api/recommend-outfit`
**Purpose:** Get outfit recommendation based on wardrobe and preferences

**Request Body:**
```json
{
  "outfitType": "casual" | "formal" | "sporty" | "streetwear" | "business" | "other (optional)",
  "occasion": "string (optional)",
  "personalInfo": {
    /* personal info object */
  }
}
```

**Response:**
```json
{
  "outfit": {
    "top": { /* clothing item */ },
    "bottom": { /* clothing item */ },
    "outerwear": { /* clothing item, optional */ },
    "shoes": { /* clothing item, optional */ }
  },
  "reasoning": "string (explanation of why this outfit was recommended)",
  "missingItems": ["item type 1", "item type 2"] // if can't create complete outfit
}
```

**Notes:**
- Consider all clothing attributes (color, fit, fabric, style compatibility)
- Use personal info to refine recommendations
- If complete outfit can't be made, suggest what's missing

---

### `POST /api/suggest-new-clothes`
**Purpose:** Suggest new clothing items to add to wardrobe based on what's missing

**Request Body:**
```json
{
  "personalInfo": {
    /* personal info object */
  },
  "preferences": {
    "budget": "number (optional)",
    "style": "string (optional)",
    "priorities": ["color", "type", "brand"] // what user wants most
  }
}

**Response:**
```json
{
  "suggestions": [
    {
      "itemType": "jacket",
      "reason": "You don't have any jackets. A jacket would complement your existing wardrobe.",
      "recommendedAttributes": {
        "color": "navy",
        "fit": "regular",
        "fabricType": "wool",
        "reasoning": "Matches your preferred style and existing color palette"
      },
      "images": ["url1", "url2"] // Optional: example images
    }
  ],
  "wardrobeAnalysis": {
    "totalItems": 10,
    "mostCommonColor": "blue",
    "mostCommonType": "t-shirt",
    "gaps": ["jackets", "formal wear"]
  }
}
```

**Notes:**
- Analyze current wardrobe to identify gaps
- Consider personal style preferences
- Suggest items that would work well with existing wardrobe
- Use Gemini to generate intelligent suggestions based on wardrobe analysis

---

## 5. Import/Export Endpoints

### `POST /api/import-wardrobe`
**Purpose:** Import wardrobe from exported JSON file

**Request Body:**
```json
{
  "clothes": [/* array of clothing items */],
  "personalInfo": {/* personal info object */}
}
```

**Response:**
```json
{
  "message": "Wardrobe imported successfully",
  "itemsImported": 15,
  "personalInfoUpdated": true
}
```

---

### `GET /api/export-wardrobe`
**Purpose:** Export entire wardrobe as JSON (including all images as base64)

**Response:**
```json
{
  "clothes": [/* array of all clothing items with images */],
  "personalInfo": {/* personal info object */},
  "exportDate": "ISO timestamp"
}
```

---

## 6. Wardrobe Analysis Endpoint

### `GET /api/wardrobe/stats`
**Purpose:** Get statistics and analysis of current wardrobe

**Response:**
```json
{
  "totalItems": 25,
  "byType": {
    "t-shirt": 8,
    "pants": 5,
    "jacket": 3,
    /* ... */
  },
  "byColor": {
    "blue": 10,
    "black": 8,
    /* ... */
  },
  "byFit": {
    "regular": 15,
    "tight": 7,
    "baggy": 3
  },
  "wardrobeCompleteness": 0.75, // 0-1 score
  "recommendations": [
    "Consider adding more formal wear",
    "Your wardrobe lacks jackets"
  ]
}
```

---

## Implementation Notes

### Data Storage
- Since no database is required, use JSON file storage
- Create a `wardrobe.json` file to store all clothing items
- Create a `personal_info.json` file for user information
- Handle file read/write operations safely (with error handling)

### Gemini Integration
- You'll need a Google Gemini API key
- Install the Google Generative AI Python SDK: `pip install google-generativeai`
- Use Gemini Vision API for image analysis
- Use Gemini text API for outfit suggestions and recommendations

### Error Handling
All endpoints should return appropriate HTTP status codes:
- `200` - Success
- `400` - Bad Request (invalid input)
- `404` - Not Found (item doesn't exist)
- `500` - Server Error

### Example Error Response:
```json
{
  "error": "Error message here",
  "detail": "Additional error details"
}
```

### CORS
Make sure CORS is properly configured to allow requests from `http://localhost:5173` (Vite dev server)

### Image Handling
- Accept base64 encoded images
- Store images as base64 strings in JSON (simple approach for MVP)
- For production, consider using cloud storage (S3, Cloudinary, etc.)

---

## Required Python Packages

```bash
python -m pip install fastapi uvicorn python-multipart google-generativeai pillow
```

---

## File Structure Suggestion

```
backend/
├── main.py (FastAPI app)
├── models.py (Pydantic models for request/response)
├── storage.py (JSON file read/write functions)
├── gemini_service.py (Gemini API integration)
├── wardrobe.json (data storage)
├── personal_info.json (user data storage)
└── requirements.txt
```
