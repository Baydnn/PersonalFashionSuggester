import { useWardrobe } from '../context/WardrobeContext'

export function WardrobeList() {
  const { state, dispatch } = useWardrobe()

  const handleRemove = async (id: string) => {
    try {
      const response = await fetch(`/api/clothing/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
        throw new Error(errorData.detail || `Failed to delete clothing item: ${response.status}`)
      }

      // Update frontend state after successful deletion
      dispatch({ type: 'REMOVE_CLOTHING', payload: id })
    } catch (error) {
      console.error('Error deleting clothing item:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete clothing item. Please try again.')
    }
  }

  if (state.clothes.length === 0) {
    return (
      <div style={{ padding: '20px', color: '#333' }}>
        <h2 style={{ color: '#333' }}>Your Wardrobe</h2>
        <p style={{ color: '#666' }}>No items yet. Add some clothes to get started!</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', color: '#333' }}>
      <h2 style={{ color: '#333' }}>Your Wardrobe ({state.clothes.length} items)</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {state.clothes.map(item => (
          <div
            key={item.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '15px',
              backgroundColor: '#f9f9f9'
            }}
          >
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.name}
                style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px', marginBottom: '10px' }}
              />
            )}
            <h3 style={{ margin: '0 0 10px 0' }}>{item.name}</h3>
            <p style={{ margin: '5px 0' }}><strong>Type:</strong> {item.type}</p>
            <p style={{ margin: '5px 0' }}><strong>Color:</strong> {item.color}</p>
            <p style={{ margin: '5px 0' }}><strong>Fabric:</strong> {item.fabricType}</p>
            <p style={{ margin: '5px 0' }}><strong>Fit:</strong> {item.fit}</p>
            {item.brand && <p style={{ margin: '5px 0' }}><strong>Brand:</strong> {item.brand}</p>}
            <p style={{ margin: '5px 0' }}><strong>Graphic:</strong> {item.graphicSize}</p>
            <button
              onClick={() => handleRemove(item.id)}
              style={{
                marginTop: '10px',
                padding: '5px 10px',
                backgroundColor: '#ff4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
