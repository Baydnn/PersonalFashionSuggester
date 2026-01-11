import { useState, useEffect } from 'react'
import { useWardrobe } from '../context/WardrobeContext'

interface SuggestNewClothesResponse {
  suggestions: Array<{
    itemType: string
    reason: string
    recommendedAttributes: {
      color?: string
      fit?: string
      fabricType?: string
      reasoning?: string
    }
  }>
  wardrobeAnalysis: {
    totalItems: number
    mostCommonColor: string
    mostCommonType: string
    gaps: string[]
  }
}

interface OutfitRecommendationResponse {
  outfit: {
    top?: {
      id: string
      name: string
      type: string
      color: string
      fit: string
      fabricType: string
      imageUrl?: string
    }
    bottom?: {
      id: string
      name: string
      type: string
      color: string
      fit: string
      fabricType: string
      imageUrl?: string
    }
    outerwear?: {
      id: string
      name: string
      type: string
      color: string
      fit: string
      fabricType: string
      imageUrl?: string
    }
    shoes?: {
      suggestion?: string
      reason?: string
    }
  }
  reasoning: string
  missingItems: string[]
}

interface PersonalInfo {
  gender?: string
  height?: string
  weight?: string
  preferredStyle?: string
  otherDescription?: string
}

export function OutfitSuggestions() {
  const { state } = useWardrobe()
  const [suggestions, setSuggestions] = useState<SuggestNewClothesResponse | null>(null)
  const [outfitRecommendation, setOutfitRecommendation] = useState<OutfitRecommendationResponse | null>(null)
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null)
  const [stylePrompt, setStylePrompt] = useState<string>('')
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [isLoadingOutfit, setIsLoadingOutfit] = useState(false)
  const [error, setError] = useState<string>('')
  const [outfitError, setOutfitError] = useState<string>('')

  // Load personal info on component mount
  useEffect(() => {
    const loadPersonalInfo = async () => {
      try {
        const response = await fetch('/api/personal-info')
        if (response.ok) {
          const data = await response.json()
          setPersonalInfo(data)
        }
      } catch (err) {
        console.error('Error loading personal info:', err)
      }
    }
    loadPersonalInfo()
  }, [])

  const handleRecommendOutfit = async () => {
    if (state.clothes.length === 0) {
      setOutfitError('Please add some clothes to your wardrobe first!')
      return
    }

    setIsLoadingOutfit(true)
    setOutfitError('')
    setOutfitRecommendation(null)

    try {
      const response = await fetch('/api/recommend-outfit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalInfo: personalInfo || null,
          occasion: stylePrompt || null,  // Using occasion field for style prompt
          outfitType: null
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const data: OutfitRecommendationResponse = await response.json()
      setOutfitRecommendation(data)
    } catch (err) {
      console.error('Error getting outfit recommendation:', err)
      setOutfitError(err instanceof Error ? err.message : 'Failed to get outfit recommendation. Please try again.')
    } finally {
      setIsLoadingOutfit(false)
    }
  }

  const handleSuggestNewClothes = async () => {
    if (state.clothes.length === 0) {
      setError('Please add some clothes to your wardrobe first!')
      return
    }

    setIsLoadingSuggestions(true)
    setError('')
    setSuggestions(null)

    try {
      const response = await fetch('/api/suggest-new-clothes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalInfo: personalInfo || null
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const data: SuggestNewClothesResponse = await response.json()
      setSuggestions(data)
    } catch (err) {
      console.error('Error getting suggestions:', err)
      setError(err instanceof Error ? err.message : 'Failed to get suggestions. Please try again.')
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '20px' }}>
      <h2>Outfit Recommendations</h2>
      
      {/* Outfit Recommendation Section */}
      <div style={{ marginBottom: '30px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0 }}>Recommend Outfit (AI)</h3>
        <p style={{ color: '#666', marginBottom: '15px' }}>
          Enter a style prompt to get an AI-powered outfit recommendation from your wardrobe
        </p>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Style Prompt (e.g., "casual and comfortable", "formal business", "streetwear", "summer vibes"):
          </label>
          <input
            type="text"
            value={stylePrompt}
            onChange={(e) => setStylePrompt(e.target.value)}
            placeholder="e.g., casual and comfortable, formal business, streetwear style..."
            style={{
              width: '100%',
              maxWidth: '500px',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>

        <button
          onClick={handleRecommendOutfit}
          disabled={state.clothes.length === 0 || isLoadingOutfit}
          style={{
            padding: '10px 20px',
            cursor: (state.clothes.length === 0 || isLoadingOutfit) ? 'not-allowed' : 'pointer',
            backgroundColor: (state.clothes.length === 0 || isLoadingOutfit) ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        >
          {isLoadingOutfit ? 'Getting Recommendation...' : 'Recommend Outfit'}
        </button>

        {outfitError && (
          <div style={{
            marginTop: '15px',
            padding: '15px',
            backgroundColor: '#ffebee',
            color: '#c62828',
            borderRadius: '4px',
            border: '1px solid #ef5350'
          }}>
            <strong>Error:</strong> {outfitError}
          </div>
        )}

        {isLoadingOutfit && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <div style={{
              display: 'inline-block',
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #4CAF50',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ marginTop: '10px', color: '#666' }}>AI is analyzing your wardrobe and creating an outfit...</p>
          </div>
        )}

        {outfitRecommendation && (
          <div style={{ marginTop: '20px' }}>
            <h4 style={{ color: '#333', marginBottom: '15px' }}>Recommended Outfit</h4>
            
            {outfitRecommendation.reasoning && (
              <div style={{
                marginBottom: '20px',
                padding: '15px',
                backgroundColor: '#e8f5e9',
                borderRadius: '8px',
                border: '1px solid #c8e6c9'
              }}>
                <strong>Reasoning:</strong> {outfitRecommendation.reasoning}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
              {outfitRecommendation.top && (
                <div style={{
                  padding: '15px',
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '2px solid #4CAF50'
                }}>
                  <h5 style={{ marginTop: 0, color: '#2e7d32' }}>Top</h5>
                  <p><strong>Name:</strong> {outfitRecommendation.top.name}</p>
                  <p><strong>Type:</strong> {outfitRecommendation.top.type}</p>
                  <p><strong>Color:</strong> {outfitRecommendation.top.color}</p>
                  <p><strong>Fit:</strong> {outfitRecommendation.top.fit}</p>
                  {outfitRecommendation.top.imageUrl && (
                    <img 
                      src={outfitRecommendation.top.imageUrl} 
                      alt={outfitRecommendation.top.name}
                      style={{ width: '100%', maxWidth: '200px', marginTop: '10px', borderRadius: '4px' }}
                    />
                  )}
                </div>
              )}

              {outfitRecommendation.bottom && (
                <div style={{
                  padding: '15px',
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '2px solid #4CAF50'
                }}>
                  <h5 style={{ marginTop: 0, color: '#2e7d32' }}>Bottom</h5>
                  <p><strong>Name:</strong> {outfitRecommendation.bottom.name}</p>
                  <p><strong>Type:</strong> {outfitRecommendation.bottom.type}</p>
                  <p><strong>Color:</strong> {outfitRecommendation.bottom.color}</p>
                  <p><strong>Fit:</strong> {outfitRecommendation.bottom.fit}</p>
                  {outfitRecommendation.bottom.imageUrl && (
                    <img 
                      src={outfitRecommendation.bottom.imageUrl} 
                      alt={outfitRecommendation.bottom.name}
                      style={{ width: '100%', maxWidth: '200px', marginTop: '10px', borderRadius: '4px' }}
                    />
                  )}
                </div>
              )}

              {outfitRecommendation.outerwear && (
                <div style={{
                  padding: '15px',
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '2px solid #4CAF50'
                }}>
                  <h5 style={{ marginTop: 0, color: '#2e7d32' }}>Outerwear</h5>
                  <p><strong>Name:</strong> {outfitRecommendation.outerwear.name}</p>
                  <p><strong>Type:</strong> {outfitRecommendation.outerwear.type}</p>
                  <p><strong>Color:</strong> {outfitRecommendation.outerwear.color}</p>
                  <p><strong>Fit:</strong> {outfitRecommendation.outerwear.fit}</p>
                  {outfitRecommendation.outerwear.imageUrl && (
                    <img 
                      src={outfitRecommendation.outerwear.imageUrl} 
                      alt={outfitRecommendation.outerwear.name}
                      style={{ width: '100%', maxWidth: '200px', marginTop: '10px', borderRadius: '4px' }}
                    />
                  )}
                </div>
              )}

              {outfitRecommendation.shoes && (
                <div style={{
                  padding: '15px',
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '2px solid #4CAF50'
                }}>
                  <h5 style={{ marginTop: 0, color: '#2e7d32' }}>Shoes</h5>
                  {outfitRecommendation.shoes.suggestion && (
                    <p><strong>Suggestion:</strong> {outfitRecommendation.shoes.suggestion}</p>
                  )}
                  {outfitRecommendation.shoes.reason && (
                    <p style={{ fontStyle: 'italic', color: '#666' }}>{outfitRecommendation.shoes.reason}</p>
                  )}
                </div>
              )}
            </div>

            {outfitRecommendation.missingItems && outfitRecommendation.missingItems.length > 0 && (
              <div style={{
                marginTop: '20px',
                padding: '15px',
                backgroundColor: '#fff3e0',
                borderRadius: '4px',
                border: '1px solid #ffb74d'
              }}>
                <strong>Missing Items:</strong> {outfitRecommendation.missingItems.join(', ')}
                <p style={{ margin: '5px 0 0 0', color: '#e65100' }}>
                  Consider adding these items to complete the outfit.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Suggest New Clothes Section */}
      <div style={{ padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0 }}>Suggest New Clothes (AI)</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <button
            onClick={handleSuggestNewClothes}
            disabled={state.clothes.length === 0 || isLoadingSuggestions}
            style={{
              padding: '10px 20px',
              cursor: (state.clothes.length === 0 || isLoadingSuggestions) ? 'not-allowed' : 'pointer',
              backgroundColor: (state.clothes.length === 0 || isLoadingSuggestions) ? '#ccc' : '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            {isLoadingSuggestions ? 'Getting Suggestions...' : 'Get Suggestions'}
          </button>
        </div>

        {state.clothes.length === 0 && (
          <p style={{ marginTop: '10px', color: '#666' }}>
            Add some clothes to your wardrobe first to get recommendations!
          </p>
        )}

        {error && (
          <div style={{
            marginTop: '15px',
            padding: '15px',
            backgroundColor: '#ffebee',
            color: '#c62828',
            borderRadius: '4px',
            border: '1px solid #ef5350'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {isLoadingSuggestions && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <div style={{
              display: 'inline-block',
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #2196F3',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ marginTop: '10px', color: '#666' }}>AI is analyzing your wardrobe and generating suggestions...</p>
          </div>
        )}

        {suggestions && suggestions.suggestions.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h4 style={{ marginBottom: '15px', color: '#333' }}>AI-Powered Suggestions</h4>
            
            {suggestions.wardrobeAnalysis && (
              <div style={{
                marginBottom: '20px',
                padding: '15px',
                backgroundColor: '#f0f7ff',
                borderRadius: '8px',
                border: '1px solid #b3d9ff'
              }}>
                <h5 style={{ marginTop: 0, color: '#1976D2' }}>Your Wardrobe Summary</h5>
                <p><strong>Total Items:</strong> {suggestions.wardrobeAnalysis.totalItems}</p>
                <p><strong>Most Common Color:</strong> {suggestions.wardrobeAnalysis.mostCommonColor}</p>
                <p><strong>Most Common Type:</strong> {suggestions.wardrobeAnalysis.mostCommonType}</p>
                {suggestions.wardrobeAnalysis.gaps.length > 0 && (
                  <p><strong>Wardrobe Gaps:</strong> {suggestions.wardrobeAnalysis.gaps.join(', ')}</p>
                )}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {suggestions.suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  style={{
                    padding: '15px',
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0'
                  }}
                >
                  <h5 style={{ marginTop: 0, color: '#1976D2' }}>
                    {suggestion.itemType.charAt(0).toUpperCase() + suggestion.itemType.slice(1)}
                  </h5>
                  <p style={{ marginBottom: '10px', color: '#555' }}>{suggestion.reason}</p>
                  
                  {suggestion.recommendedAttributes && (
                    <div style={{
                      marginTop: '10px',
                      padding: '10px',
                      backgroundColor: '#f9f9f9',
                      borderRadius: '4px',
                      border: '1px solid #ddd'
                    }}>
                      <p style={{ margin: '5px 0', fontWeight: 'bold' }}>Recommended Attributes:</p>
                      <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                        {suggestion.recommendedAttributes.color && (
                          <li><strong>Color:</strong> {suggestion.recommendedAttributes.color}</li>
                        )}
                        {suggestion.recommendedAttributes.fit && (
                          <li><strong>Fit:</strong> {suggestion.recommendedAttributes.fit}</li>
                        )}
                        {suggestion.recommendedAttributes.fabricType && (
                          <li><strong>Fabric:</strong> {suggestion.recommendedAttributes.fabricType}</li>
                        )}
                        {suggestion.recommendedAttributes.reasoning && (
                          <li style={{ fontStyle: 'italic', color: '#666' }}>
                            {suggestion.recommendedAttributes.reasoning}
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {suggestions && suggestions.suggestions.length === 0 && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#fff3e0',
            borderRadius: '4px',
            border: '1px solid #ffb74d'
          }}>
            <p style={{ margin: 0, color: '#e65100' }}>
              No suggestions available. Your wardrobe looks complete!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
