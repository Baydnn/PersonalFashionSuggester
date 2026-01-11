import { GoogleGenAI, Type } from "@google/genai";
import type { ClothingItem, UserProfile } from "./types";

// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
// Assume this variable is pre-configured, valid, and accessible in the execution context.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// figure out what the item is just based on text
export const identifyItemFromText = async (query: string) => {
  console.log("Asking Gemini about:", query);

  const prompt = `
    I need you to act as a fashion expert.
    I have a clothing item described as: "${query}".
    
    Please figure out the specific details for this item so I can add it to my database.
    I need the brand, the specific type of clothes, the material, etc.

    Return the data as a JSON object with these exact keys:
    - officialTitle: A nice looking title for the item
    - brand: The brand name
    - type: One of these: Hoodie, T-Shirt, Jacket, Sweater, Pants, Shorts, Dress, Shoes
    - material: What is it made of?
    - fit: Baggy, Regular, or Tight
    - color: The main color
    - technicalNotes: Any extra info
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            officialTitle: { type: Type.STRING },
            brand: { type: Type.STRING },
            type: { type: Type.STRING },
            material: { type: Type.STRING },
            fit: { type: Type.STRING },
            color: { type: Type.STRING },
            technicalNotes: { type: Type.STRING }
          },
          required: ["officialTitle", "brand", "type", "material", "fit", "color", "technicalNotes"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error identifying item:", error);
    return {};
  }
};

// look at the pic and guess what it is
export const identifyItemFromImage = async (base64Image: string) => {
  console.log("Analyzing image...");

  // strip the header
  const base64Data = base64Image.split(',')[1];
  
  const prompt = `
    Look at this photo. It's a piece of clothing (or someone wearing it).
    I need to extract the attributes to save it to my closet app.
    
    If there are multiple items, just pick the main one (like the shirt or jacket).
    
    Return a JSON object:
    - title: A short name (e.g. "Blue Denim Jacket")
    - type: Must be: Hoodie, T-Shirt, Jacket, Sweater, Pants, Shorts, Dress, Shoes
    - color: The main color
    - fabric: Guess the material (Cotton, Denim, etc)
    - fit: Guess the fit (Baggy, Regular, Tight)
    - brand: Guess the brand if you see a logo, otherwise null
    - specialNotes: Mention any graphics or patterns
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { 
        parts: [
          { text: prompt }, 
          { inlineData: { mimeType: "image/jpeg", data: base64Data } }
        ] 
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            type: { type: Type.STRING },
            color: { type: Type.STRING },
            fabric: { type: Type.STRING },
            fit: { type: Type.STRING },
            brand: { type: Type.STRING, nullable: true },
            specialNotes: { type: Type.STRING },
          }
        }
      }
    });

    console.log("Image analysis complete");
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error analyzing image:", error);
    return {};
  }
};

// the magic sauce - generates the outfit
export const createOutfitRecommendation = async (wardrobe: ClothingItem[], vibe: string, profile?: UserProfile) => {
  console.log("Generating outfit for vibe:", vibe);

  // turn the wardrobe into a string list for the prompt
  const wardrobeList = wardrobe.map(item => 
    `- ${item.title} (Type: ${item.type}, Color: ${item.color}, Fit: ${item.fit}, ID: ${item.id})`
  ).join('\n');

  const prompt = `
    You are a personal stylist.
    
    USER PROFILE: 
    - Location: ${profile?.location || "Unknown"}
    - Gender: ${profile?.gender || "Not specified"}
    - Body: ${profile?.height || "?"}, ${profile?.weight || "?"}
    - Style: ${profile?.styleDescription || "No specific style"}
    
    USER WARDROBE:
    ${wardrobeList.length > 0 ? wardrobeList : "Empty wardrobe"}

    REQUESTED VIBE: "${vibe}"

    TASK:
    Select the best outfit combination from the available wardrobe items that matches the vibe.
    Only use items present in the wardrobe list. Do not invent items.

    OUTPUT JSON:
    {
      "reasoning": "A very short explanation (MAX 40 words) of why this outfit works for the vibe.",
      "wardrobeItemIds": ["id_of_item_1", "id_of_item_2"]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reasoning: { type: Type.STRING },
            wardrobeItemIds: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            }
          },
          required: ["reasoning", "wardrobeItemIds"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    
    // safe parsing to avoid crashes
    return {
      reasoning: parsed.reasoning || "Here is a style suggestion for you.",
      wardrobeItemIds: Array.isArray(parsed.wardrobeItemIds) ? parsed.wardrobeItemIds : []
    };

  } catch (error) {
    console.error("Error creating outfit:", error);
    return {
      reasoning: "Sorry, I had trouble generating an outfit right now.",
      wardrobeItemIds: []
    };
  }
};