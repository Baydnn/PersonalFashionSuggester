import { createContext, useContext, useReducer } from 'react'
import type { ReactNode } from 'react'
import type { ClothingItem, PersonalInfo, WardrobeData } from '../types'

interface WardrobeState {
  clothes: ClothingItem[]
  personalInfo: PersonalInfo
}

type WardrobeAction =
  | { type: 'ADD_CLOTHING'; payload: ClothingItem }
  | { type: 'REMOVE_CLOTHING'; payload: string }
  | { type: 'UPDATE_PERSONAL_INFO'; payload: PersonalInfo }
  | { type: 'SET_WARDROBE'; payload: WardrobeData }

const initialState: WardrobeState = {
  clothes: [],
  personalInfo: {}
}

function wardrobeReducer(state: WardrobeState, action: WardrobeAction): WardrobeState {
  switch (action.type) {
    case 'ADD_CLOTHING':
      return {
        ...state,
        clothes: [...state.clothes, action.payload]
      }
    case 'REMOVE_CLOTHING':
      return {
        ...state,
        clothes: state.clothes.filter(item => item.id !== action.payload)
      }
    case 'UPDATE_PERSONAL_INFO':
      return {
        ...state,
        personalInfo: action.payload
      }
    case 'SET_WARDROBE':
      return {
        clothes: action.payload.clothes,
        personalInfo: action.payload.personalInfo
      }
    default:
      return state
  }
}

interface WardrobeContextType {
  state: WardrobeState
  dispatch: React.Dispatch<WardrobeAction>
}

const WardrobeContext = createContext<WardrobeContextType | undefined>(undefined)

export function WardrobeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wardrobeReducer, initialState)

  return (
    <WardrobeContext.Provider value={{ state, dispatch }}>
      {children}
    </WardrobeContext.Provider>
  )
}

export function useWardrobe() {
  const context = useContext(WardrobeContext)
  if (context === undefined) {
    throw new Error('useWardrobe must be used within a WardrobeProvider')
  }
  return context
}
