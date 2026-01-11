from pydantic import BaseModel
from typing import Optional
from enum import Enum


class FabricType(str, Enum):
    cotton = "cotton"
    polyester = "polyester"
    wool = "wool"
    denim = "denim"
    leather = "leather"
    silk = "silk"
    linen = "linen"
    other = "other"


class Fit(str, Enum):
    baggy = "baggy"
    tight = "tight"
    regular = "regular"


class ClothingType(str, Enum):
    hoodie = "hoodie"
    t_shirt = "t-shirt"
    jacket = "jacket"
    sweater = "sweater"
    pants = "pants"
    shirt = "shirt"
    shorts = "shorts"
    dress = "dress"
    other = "other"


class GraphicSize(str, Enum):
    large = "large"
    small = "small"
    none = "none"


class ClothingItem(BaseModel):
    id: str
    name: str
    fabricType: FabricType
    fit: Fit
    brand: Optional[str] = None
    color: str
    type: ClothingType
    graphicSize: GraphicSize
    imageUrl: Optional[str] = None


class ClothingItemCreate(BaseModel):
    name: str
    fabricType: FabricType
    fit: Fit
    brand: Optional[str] = None
    color: str
    type: ClothingType
    graphicSize: GraphicSize
    imageUrl: Optional[str] = None


class PersonalInfo(BaseModel):
    gender: Optional[str] = None
    height: Optional[str] = None
    weight: Optional[str] = None
    preferredStyle: Optional[str] = None
    otherDescription: Optional[str] = None


class WardrobeData(BaseModel):
    clothes: list[ClothingItem]
    personalInfo: PersonalInfo


class ImageAnalysisRequest(BaseModel):
    image: str  # Base64 encoded image


class ImageAnalysisResponse(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None
    type: Optional[str] = None
    fabricType: Optional[str] = None
    brand: Optional[str] = None
    graphicSize: Optional[str] = None
    fit: Optional[str] = None
    confidence: Optional[dict[str, float]] = None


class OutfitRecommendationRequest(BaseModel):
    outfitType: Optional[str] = None
    occasion: Optional[str] = None
    personalInfo: Optional[PersonalInfo] = None


class OutfitRecommendationResponse(BaseModel):
    outfit: dict
    reasoning: str
    missingItems: list[str] = []


class SuggestNewClothesRequest(BaseModel):
    personalInfo: Optional[PersonalInfo] = None
    preferences: Optional[dict] = None


class SuggestNewClothesResponse(BaseModel):
    suggestions: list[dict]
    wardrobeAnalysis: dict


class WardrobeStatsResponse(BaseModel):
    totalItems: int
    byType: dict[str, int]
    byColor: dict[str, int]
    byFit: dict[str, int]
    wardrobeCompleteness: float
    recommendations: list[str]
