
export enum ClothingType {
  HOODIE = 'Hoodie',
  TSHIRT = 'T-Shirt',
  JACKET = 'Jacket',
  SWEATER = 'Sweater',
  PANTS = 'Pants',
  SHORTS = 'Shorts',
  DRESS = 'Dress',
  SHOES = 'Shoes'
}

export enum Fit {
  BAGGY = 'Baggy',
  REGULAR = 'Regular',
  TIGHT = 'Tight'
}

export enum DesignComplexity {
  NONE = 'None',
  SUBTLE = 'Subtle',
  LARGE = 'Large Graphic'
}

export interface UserProfile {
  height?: string;
  weight?: string;
  age?: string;
  gender?: string;
  location?: string; // important for weather vibes
  styleDescription?: string;
}

export interface ClothingItem {
  id: string;
  title?: string;
  type: ClothingType;
  color: string;
  fabric: string; // just general material info
  fit: Fit;
  design: DesignComplexity;
  brand?: string;
  imageUrl?: string;
  specialNotes?: string; // any weird details
  dateAdded: number;
}

export interface OutfitRecommendation {
  // why we picked this fit (max 40 words)
  reasoning: string;
  
  // just the ids so we can look them up later
  wardrobeItemIds: string[];
}
