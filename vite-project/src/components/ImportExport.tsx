import { useWardrobe } from '../context/WardrobeContext'
import type { WardrobeData } from '../types'

export function ImportExport() {
  const { state, dispatch } = useWardrobe()

  const handleExport = () => {
    const wardrobeData: WardrobeData = {
      clothes: state.clothes,
      personalInfo: state.personalInfo
    }
    
    const dataStr = JSON.stringify(wardrobeData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'wardrobe-export.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        try {
          const importedData: WardrobeData = JSON.parse(reader.result as string)
          
          // Validate the structure
          if (importedData.clothes && Array.isArray(importedData.clothes)) {
            dispatch({ type: 'SET_WARDROBE', payload: importedData })
            alert('Wardrobe imported successfully!')
          } else {
            alert('Invalid wardrobe file format')
          }
        } catch (error) {
          alert('Error reading file. Please make sure it\'s a valid wardrobe export file.')
          console.error('Import error:', error)
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '20px' }}>
      <h2>Import / Export Wardrobe</h2>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button
          onClick={handleExport}
          disabled={state.clothes.length === 0 && Object.keys(state.personalInfo).length === 0}
          style={{
            padding: '10px 20px',
            cursor: (state.clothes.length === 0 && Object.keys(state.personalInfo).length === 0) ? 'not-allowed' : 'pointer',
            backgroundColor: (state.clothes.length === 0 && Object.keys(state.personalInfo).length === 0) ? '#ccc' : '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          Export Wardrobe
        </button>
        <label style={{ padding: '10px 20px', backgroundColor: '#9C27B0', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>
          Import Wardrobe
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
        </label>
      </div>
      <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
        Export saves your wardrobe (including images) to a JSON file. Import loads a previously exported wardrobe.
      </p>
    </div>
  )
}
