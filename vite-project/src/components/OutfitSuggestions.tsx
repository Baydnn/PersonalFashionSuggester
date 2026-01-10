import { useWardrobe } from '../context/WardrobeContext'

export function OutfitSuggestions() {
  const { state } = useWardrobe()

  const handleRecommendOutfit = () => {
    // Placeholder - will connect to backend API later
    alert('Outfit recommendation feature - will connect to backend API')
  }

  const handleSuggestNewClothes = () => {
    // Placeholder - will connect to backend API later
    alert('New clothes suggestion feature - will connect to backend API')
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '20px' }}>
      <h2>Outfit Recommendations</h2>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={handleRecommendOutfit}
          disabled={state.clothes.length === 0}
          style={{
            padding: '10px 20px',
            cursor: state.clothes.length === 0 ? 'not-allowed' : 'pointer',
            backgroundColor: state.clothes.length === 0 ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          Recommend Outfit
        </button>
        <button
          onClick={handleSuggestNewClothes}
          disabled={state.clothes.length === 0}
          style={{
            padding: '10px 20px',
            cursor: state.clothes.length === 0 ? 'not-allowed' : 'pointer',
            backgroundColor: state.clothes.length === 0 ? '#ccc' : '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          Suggest New Clothes
        </button>
      </div>
      {state.clothes.length === 0 && (
        <p style={{ marginTop: '10px', color: '#666' }}>
          Add some clothes to your wardrobe first to get recommendations!
        </p>
      )}
    </div>
  )
}
