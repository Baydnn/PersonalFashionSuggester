// Types for wardrobe items and user info

export type FabricType = 'cotton' | 'polyester' | 'wool' | 'denim' | 'leather' | 'silk' | 'linen' | 'other'
export type Fit = 'baggy' | 'tight' | 'regular'
export type ClothingType = 'hoodie' | 't-shirt' | 'jacket' | 'sweater' | 'pants' | 'shirt' | 'shorts' | 'dress' | 'other'
export type GraphicSize = 'large' | 'small' | 'none'

export interface ClothingItem {
  id: string
  name: string
  fabricType: FabricType
  fit: Fit
  brand?: string
  color: string
  type: ClothingType
  graphicSize: GraphicSize
  imageUrl?: string // Base64 or URL string
}

export interface PersonalInfo {
  gender?: string
  height?: string
  weight?: string
  preferredStyle?: string
  otherDescription?: string
}

export interface WardrobeData {
  clothes: ClothingItem[]
  personalInfo: PersonalInfo
}
