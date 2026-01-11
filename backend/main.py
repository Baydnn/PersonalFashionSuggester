from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import uuid
from models import (
    ClothingItem, ClothingItemCreate, PersonalInfo, WardrobeData,
    ImageAnalysisRequest, ImageAnalysisResponse, OutfitRecommendationRequest,
    OutfitRecommendationResponse, SuggestNewClothesRequest, SuggestNewClothesResponse,
    WardrobeStatsResponse
)
from storage import (
    init_storage, add_clothing_item, load_clothes, save_clothes, load_personal_info, save_personal_info,
    get_clothing_item, delete_clothing_item, save_wardrobe_data, load_wardrobe_data
)
from gemini_service import analyze_image_with_gemini, generate_clothing_suggestions, generate_outfit_recommendation, generate_outfit_recommendation

# Initialize FastAPI app
app = FastAPI(title="Personal Fashion Suggester API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize storage on startup
init_storage()


@app.get("/")
def read_root():
    return {"message": "Welcome to Personal Fashion Suggester API"}


@app.get("/api/health")
def health_check():
    return {"status": "ok"}


# ==================== Clothing Management Endpoints ====================

@app.post("/api/clothing", response_model=ClothingItem)
def create_clothing_item(item: ClothingItemCreate):
    """Add a new clothing item to the wardrobe"""
    item_dict = item.model_dump()
    item_dict["id"] = str(uuid.uuid4())
    new_item = add_clothing_item(item_dict)
    return new_item


@app.get("/api/clothing")
def get_all_clothing():
    """Get all clothing items in the wardrobe"""
    clothes = load_clothes()
    return {"clothes": clothes}


@app.get("/api/clothing/{item_id}")
def get_clothing_item_by_id(item_id: str):
    """Get a specific clothing item by ID"""
    item = get_clothing_item(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Clothing item not found")
    return item


@app.delete("/api/clothing/{item_id}")
def delete_clothing_item_by_id(item_id: str):
    """Delete a clothing item from the wardrobe"""
    success = delete_clothing_item(item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Clothing item not found")
    return {"message": "Clothing item deleted successfully"}


# ==================== Personal Information Endpoints ====================

@app.post("/api/personal-info")
def update_personal_info(personal_info: PersonalInfo):
    """Save/update user's personal information"""
    personal_info_dict = personal_info.model_dump(exclude_none=True)
    save_personal_info(personal_info_dict)
    return {
        "message": "Personal info saved successfully",
        "personalInfo": personal_info_dict
    }


@app.get("/api/personal-info")
def get_personal_info():
    """Get user's personal information"""
    personal_info = load_personal_info()
    return personal_info


# ==================== Image Analysis Endpoint ====================

@app.post("/api/analyze-image", response_model=ImageAnalysisResponse)
def analyze_image(request: ImageAnalysisRequest):
    """Analyze a clothing image and extract attributes using Gemini AI"""
    try:
        # Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
        image_base64 = request.image
        if "," in image_base64:
            image_base64 = image_base64.split(",")[1]
        
        # Check API key before calling
        try:
            from config import GEMINI_API_KEY as CONFIG_API_KEY
        except ImportError:
            CONFIG_API_KEY = None
        import os
        api_key = CONFIG_API_KEY or os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise HTTPException(
                status_code=400, 
                detail="Gemini API key not configured. Please set GEMINI_API_KEY in config.py or as environment variable."
            )
        
        result = analyze_image_with_gemini(image_base64)
        return result
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error in analyze_image endpoint: {error_trace}")
        raise HTTPException(status_code=500, detail=f"Error analyzing image: {str(e)}")


# ==================== Outfit Recommendation Endpoints ====================

@app.post("/api/recommend-outfit", response_model=OutfitRecommendationResponse)
def recommend_outfit(request: OutfitRecommendationRequest):
    """Get outfit recommendation based on wardrobe using Gemini AI"""
    clothes = load_clothes()
    personal_info = request.personalInfo.model_dump() if request.personalInfo else load_personal_info()
    
    if not clothes:
        raise HTTPException(status_code=400, detail="No clothing items in wardrobe")
    
    # Get style prompt from request (using occasion field for style prompt)
    style_prompt = request.occasion or ""
    
    # Try to use Gemini AI for intelligent outfit recommendation
    ai_recommendation = generate_outfit_recommendation(
        wardrobe_items=clothes,
        personal_info=personal_info,
        style_prompt=style_prompt,
        occasion=request.outfitType
    )
    
    if ai_recommendation and ai_recommendation.get("top"):
        # Use AI-generated recommendation
        # Map AI response to our response format
        top_id = ai_recommendation.get("top", {}).get("id")
        bottom_id = ai_recommendation.get("bottom", {}).get("id")
        outerwear_id = ai_recommendation.get("outerwear", {}).get("id")
        
        # Find items by ID
        recommended_top = next((item for item in clothes if item.get("id") == top_id), None)
        recommended_bottom = next((item for item in clothes if item.get("id") == bottom_id), None)
        recommended_outerwear = next((item for item in clothes if item.get("id") == outerwear_id), None) if outerwear_id else None
        
        # Format response as dict to match OutfitRecommendationResponse model
        outfit_dict = {}
        if recommended_top:
            outfit_dict["top"] = recommended_top
        if recommended_bottom:
            outfit_dict["bottom"] = recommended_bottom
        if recommended_outerwear:
            outfit_dict["outerwear"] = recommended_outerwear
        
        return OutfitRecommendationResponse(
            outfit=outfit_dict,
            reasoning=ai_recommendation.get("reasoning", "AI-generated outfit recommendation"),
            missingItems=ai_recommendation.get("missingItems", [])
        )
    else:
        # Fallback to simple matching logic if AI fails
        outfit_dict = {}
        missing_items = []
        
        tops = [item for item in clothes if item.get("type") in ["t-shirt", "shirt", "hoodie", "sweater"]]
        bottoms = [item for item in clothes if item.get("type") in ["pants", "shorts"]]
        outerwears = [item for item in clothes if item.get("type") in ["jacket", "hoodie"]]
        
        if tops:
            outfit_dict["top"] = tops[0]
        else:
            missing_items.append("top")
        
        if bottoms:
            outfit_dict["bottom"] = bottoms[0]
        else:
            missing_items.append("bottom")
        
        if outerwears:
            outfit_dict["outerwear"] = outerwears[0]
        
        reasoning = f"Selected items from your wardrobe. "
        if missing_items:
            reasoning += f"Missing: {', '.join(missing_items)}"
        reasoning += " (AI unavailable - using simple matching)"
        
        return OutfitRecommendationResponse(
            outfit=outfit_dict,
            reasoning=reasoning,
            missingItems=missing_items
        )


@app.post("/api/suggest-new-clothes", response_model=SuggestNewClothesResponse)
def suggest_new_clothes(request: SuggestNewClothesRequest):
    """Suggest new clothing items based on wardrobe gaps using Gemini AI"""
    clothes = load_clothes()
    personal_info = request.personalInfo.model_dump() if request.personalInfo else load_personal_info()
    
    # Analyze wardrobe
    types = {}
    colors = {}
    fabrics = {}
    for item in clothes:
        item_type = item.get("type", "other")
        types[item_type] = types.get(item_type, 0) + 1
        item_color = item.get("color", "unknown")
        colors[item_color] = colors.get(item_color, 0) + 1
        item_fabric = item.get("fabricType", "unknown")
        fabrics[item_fabric] = fabrics.get(item_fabric, 0) + 1
    
    most_common_color = max(colors.items(), key=lambda x: x[1])[0] if colors else "unknown"
    most_common_type = max(types.items(), key=lambda x: x[1])[0] if types else "unknown"
    most_common_fabric = max(fabrics.items(), key=lambda x: x[1])[0] if fabrics else "unknown"
    
    # Identify gaps
    all_types = ["t-shirt", "shirt", "hoodie", "jacket", "sweater", "pants", "shorts", "dress"]
    missing_types = [t for t in all_types if t not in types or types[t] == 0]
    
    wardrobe_analysis = {
        "totalItems": len(clothes),
        "mostCommonColor": most_common_color,
        "mostCommonType": most_common_type,
        "mostCommonFabric": most_common_fabric,
        "gaps": missing_types[:5],
        "colorDistribution": dict(list(colors.items())[:5]),
        "typeDistribution": dict(list(types.items())[:5])
    }
    
    # Try to use Gemini AI for intelligent suggestions
    ai_suggestions = generate_clothing_suggestions(wardrobe_analysis, personal_info)
    
    if ai_suggestions and len(ai_suggestions) > 0:
        # Use AI-generated suggestions
        suggestions = ai_suggestions
    else:
        # Fallback to rule-based suggestions if AI fails
        suggestions = []
        for missing_type in missing_types[:3]:  # Limit to 3 suggestions
            suggestions.append({
                "itemType": missing_type,
                "reason": f"You don't have any {missing_type}s. Adding one would complement your wardrobe.",
                "recommendedAttributes": {
                    "color": most_common_color if most_common_color != "unknown" else "black",
                    "fit": "regular",
                    "fabricType": most_common_fabric if most_common_fabric != "unknown" else "cotton",
                    "reasoning": f"Matches your existing color palette"
                }
            })
    
    return SuggestNewClothesResponse(
        suggestions=suggestions,
        wardrobeAnalysis=wardrobe_analysis
    )


# ==================== Import/Export Endpoints ====================

@app.post("/api/import-wardrobe")
def import_wardrobe(wardrobe_data: WardrobeData):
    """Import wardrobe from JSON data"""
    try:
        wardrobe_dict = wardrobe_data.model_dump()
        save_wardrobe_data(wardrobe_dict)
        item_count = len(wardrobe_dict.get("clothes", []))
        return {
            "message": "Wardrobe imported successfully",
            "itemsImported": item_count,
            "personalInfoUpdated": bool(wardrobe_dict.get("personalInfo"))
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error importing wardrobe: {str(e)}")


@app.get("/api/export-wardrobe")
def export_wardrobe():
    """Export entire wardrobe as JSON"""
    wardrobe_data = load_wardrobe_data()
    return wardrobe_data


# ==================== Wardrobe Statistics Endpoint ====================

@app.get("/api/wardrobe/stats", response_model=WardrobeStatsResponse)
def get_wardrobe_stats():
    """Get statistics and analysis of current wardrobe"""
    clothes = load_clothes()
    
    by_type = {}
    by_color = {}
    by_fit = {}
    
    for item in clothes:
        item_type = item.get("type", "other")
        item_color = item.get("color", "unknown")
        item_fit = item.get("fit", "regular")
        
        by_type[item_type] = by_type.get(item_type, 0) + 1
        by_color[item_color] = by_color.get(item_color, 0) + 1
        by_fit[item_fit] = by_fit.get(item_fit, 0) + 1
    
    # Calculate completeness (basic metric - you have at least one of each major category)
    essential_types = ["t-shirt", "pants", "shirt", "jacket"]
    has_essential = sum(1 for t in essential_types if by_type.get(t, 0) > 0)
    completeness = has_essential / len(essential_types) if essential_types else 0.0
    
    recommendations = []
    if by_type.get("jacket", 0) == 0:
        recommendations.append("Consider adding jackets to your wardrobe")
    if by_type.get("pants", 0) == 0:
        recommendations.append("Your wardrobe lacks pants")
    if len(clothes) < 5:
        recommendations.append("Consider expanding your wardrobe with more items")
    
    return WardrobeStatsResponse(
        totalItems=len(clothes),
        byType=by_type,
        byColor=by_color,
        byFit=by_fit,
        wardrobeCompleteness=completeness,
        recommendations=recommendations
    )
