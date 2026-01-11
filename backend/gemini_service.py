import os
import base64
from typing import Optional
from models import ImageAnalysisResponse

# Try to import config file (if it exists)
try:
    from config import GEMINI_API_KEY as CONFIG_API_KEY
except ImportError:
    CONFIG_API_KEY = None

# Gemini integration for image analysis
# Install: python -m pip install google-generativeai


def analyze_image_with_gemini(image_base64: str) -> ImageAnalysisResponse:
    """
    Analyze clothing image using Gemini Vision API
    Returns detected clothing attributes
    """
    # Check config file first, then environment variable
    api_key = CONFIG_API_KEY or os.getenv("GEMINI_API_KEY")
    
    if not api_key:
        # Raise error instead of returning empty response
        raise ValueError("Gemini API key not configured. Please set GEMINI_API_KEY in config.py or as environment variable.")
    
    try:
        import google.generativeai as genai
        from PIL import Image
        import io
        
        # Configure Gemini API
        genai.configure(api_key=api_key)
        
        # Try gemini-flash-latest first (may have free tier), fallback to others
        # Available models: gemini-flash-latest, gemini-2.0-flash, gemini-2.5-flash
        try:
            model = genai.GenerativeModel('gemini-flash-latest')
        except Exception:
            # Fallback to gemini-2.0-flash if latest not available
            model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Decode base64 image and convert to PIL Image
        try:
            image_data = base64.b64decode(image_base64)
        except Exception as e:
            raise ValueError(f"Failed to decode base64 image: {str(e)}")
        
        try:
            image = Image.open(io.BytesIO(image_data))
        except Exception as e:
            raise ValueError(f"Failed to open image: {str(e)}. Image format may not be supported.")
        
        # Create prompt for clothing analysis
        prompt = """Analyze this clothing item image and extract the following attributes. 
        Return ONLY a JSON object with these exact keys (use null if not detectable):
        {
            "type": "one of: hoodie, t-shirt, jacket, sweater, pants, shirt, shorts, dress, other",
            "color": "primary color name (e.g., red, blue, black)",
            "fabricType": "one of: cotton, polyester, wool, denim, leather, silk, linen, other",
            "brand": "brand name if visible, else null",
            "graphicSize": "one of: large, small, none",
            "fit": "one of: baggy, regular, tight (estimate based on appearance)",
            "name": "suggested name for the item (optional)"
        }
        
        Be precise and only return valid JSON, no additional text."""
        
        # Generate content with image
        try:
            response = model.generate_content([prompt, image])
            response_text = response.text.strip()
        except Exception as e:
            raise ValueError(f"Gemini API call failed: {str(e)}. Check your API key and quota.")
        
        if not response_text:
            raise ValueError("Gemini API returned empty response")
        
        # Parse JSON response
        # Try to extract JSON from response (Gemini sometimes wraps it in markdown)
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            # Extract JSON from code blocks
            parts = response_text.split("```")
            if len(parts) >= 2:
                response_text = parts[1].strip()
                if response_text.startswith("json"):
                    response_text = response_text[4:].strip()
        
        import json
        try:
            analysis = json.loads(response_text)
        except json.JSONDecodeError:
            # If JSON parsing fails, try to extract JSON object from text
            import re
            json_match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', response_text)
            if json_match:
                analysis = json.loads(json_match.group())
            else:
                raise ValueError("Could not parse JSON from Gemini response")
        
        # Map to our response model
        return ImageAnalysisResponse(
            name=analysis.get("name"),
            color=analysis.get("color"),
            type=analysis.get("type"),
            fabricType=analysis.get("fabricType"),
            brand=analysis.get("brand"),
            graphicSize=analysis.get("graphicSize", "none"),
            fit=analysis.get("fit", "regular"),
            confidence={"color": 0.8, "type": 0.85}  # Placeholder confidence scores
        )
        
    except ImportError:
        # google-generativeai not installed
        return ImageAnalysisResponse(
            name=None,
            color=None,
            type=None,
            fabricType=None,
            brand=None,
            graphicSize="none",
            fit="regular",
            confidence={}
        )
    except Exception as e:
        # Error calling Gemini API - check for quota/billing issues
        error_str = str(e)
        if "429" in error_str or "quota" in error_str.lower() or "billing" in error_str.lower():
            raise ValueError(
                "Gemini API quota exceeded. This API key may not have free tier access, or you've hit the rate limit. "
                "Please check: https://ai.google.dev/gemini-api/docs/rate-limits. "
                "You may need to enable billing or wait before trying again."
            )
        # For other errors, log full details
        import traceback
        error_details = traceback.format_exc()
        print(f"Gemini API error: {e}")
        print(f"Full traceback:\n{error_details}")
        raise Exception(f"Gemini API error: {str(e)}")


def generate_clothing_suggestions(wardrobe_analysis: dict, personal_info: dict) -> list[dict]:
    """
    Use Gemini to generate intelligent clothing suggestions based on wardrobe analysis
    """
    # Check config file first, then environment variable
    api_key = CONFIG_API_KEY or os.getenv("GEMINI_API_KEY")
    if not api_key:
        return []
    
    try:
        import google.generativeai as genai
        
        genai.configure(api_key=api_key)
        # Try gemini-flash-latest first (may have free tier), fallback to others
        try:
            model = genai.GenerativeModel('gemini-flash-latest')
        except Exception:
            model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Create prompt for suggestions
        prompt = f"""Based on this wardrobe analysis: {wardrobe_analysis}
        And personal info: {personal_info}
        
        Suggest 3-5 clothing items that would complement this wardrobe.
        Consider the user's style preferences, existing color palette, and wardrobe gaps.
        
        Return ONLY a JSON array with this exact format:
        [
            {{
                "itemType": "jacket",
                "reason": "A brief explanation of why this item would complement the wardrobe",
                "recommendedAttributes": {{
                    "color": "black",
                    "fit": "regular",
                    "fabricType": "cotton",
                    "reasoning": "Brief reasoning for these attributes"
                }}
            }}
        ]
        
        Use itemType values: t-shirt, shirt, hoodie, jacket, sweater, pants, shorts, dress, other
        Use fit values: baggy, regular, tight
        Use fabricType values: cotton, polyester, wool, denim, leather, silk, linen, other
        Return ONLY valid JSON array, no additional text."""
        
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Extract JSON
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        import json
        suggestions = json.loads(response_text)
        return suggestions if isinstance(suggestions, list) else []
        
    except Exception as e:
        print(f"Gemini suggestions error: {e}")
        return []


def generate_outfit_recommendation(wardrobe_items: list[dict], personal_info: dict, style_prompt: str, occasion: Optional[str] = None) -> dict:
    """
    Use Gemini to generate an outfit recommendation based on wardrobe items, personal info, and style preferences
    """
    # Check config file first, then environment variable
    api_key = CONFIG_API_KEY or os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {}
    
    try:
        import google.generativeai as genai
        
        genai.configure(api_key=api_key)
        # Try gemini-flash-latest first (may have free tier), fallback to others
        try:
            model = genai.GenerativeModel('gemini-flash-latest')
        except Exception:
            model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Create a summary of available wardrobe items
        wardrobe_summary = {
            "totalItems": len(wardrobe_items),
            "items": [
                {
                    "id": item.get("id"),
                    "name": item.get("name"),
                    "type": item.get("type"),
                    "color": item.get("color"),
                    "fit": item.get("fit"),
                    "fabricType": item.get("fabricType")
                }
                for item in wardrobe_items[:20]  # Limit to first 20 items for prompt size
            ]
        }
        
        # Create prompt for outfit recommendation
        occasion_text = f" for {occasion}" if occasion else ""
        prompt = f"""Based on this wardrobe: {wardrobe_summary}
        Personal info: {personal_info}
        Style preference: {style_prompt if style_prompt else "general everyday style"}
        Occasion: {occasion if occasion else "general"}
        
        Recommend a complete outfit from the available wardrobe items. Consider:
        - Color coordination
        - Style coherence
        - Fit compatibility
        - The user's style preference: {style_prompt}
        
        Return ONLY a JSON object with this exact format:
        {{
            "top": {{
                "id": "item-id",
                "name": "item name",
                "reason": "why this top was chosen"
            }},
            "bottom": {{
                "id": "item-id",
                "name": "item name",
                "reason": "why this bottom was chosen"
            }},
            "outerwear": {{
                "id": "item-id or null",
                "name": "item name or null",
                "reason": "why this outerwear was chosen (or why none)"
            }},
            "shoes": {{
                "suggestion": "type of shoes to wear",
                "reason": "why these shoes match"
            }},
            "reasoning": "Overall explanation of the outfit choice",
            "missingItems": ["item1", "item2"] or []
        }}
        
        Use actual item IDs from the wardrobe. If an item type is missing, set id to null and name to null.
        Return ONLY valid JSON, no additional text."""
        
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Extract JSON
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        import json
        recommendation = json.loads(response_text)
        return recommendation if isinstance(recommendation, dict) else {}
        
    except Exception as e:
        print(f"Gemini outfit recommendation error: {e}")
        return {}
