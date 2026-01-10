import { useState, useEffect } from 'react'
import { useWardrobe } from '../context/WardrobeContext'
import type { PersonalInfo } from '../types'

export function PersonalInfoSection() {
  const { state, dispatch } = useWardrobe()
  const [formData, setFormData] = useState<PersonalInfo>(state.personalInfo)

  useEffect(() => {
    setFormData(state.personalInfo)
  }, [state.personalInfo])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    dispatch({ type: 'UPDATE_PERSONAL_INFO', payload: formData })
    alert('Personal info saved!')
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '20px' }}>
      <h2>Personal Information</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Gender: </label>
          <input
            type="text"
            value={formData.gender || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
            placeholder="e.g., Male, Female, Non-binary"
            style={{ marginLeft: '10px', padding: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Height: </label>
          <input
            type="text"
            value={formData.height || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
            placeholder={'e.g., 5\'10", 180cm'}
            style={{ marginLeft: '10px', padding: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Weight (optional): </label>
          <input
            type="text"
            value={formData.weight || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
            placeholder="e.g., 150lbs, 68kg"
            style={{ marginLeft: '10px', padding: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Preferred Style: </label>
          <input
            type="text"
            value={formData.preferredStyle || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, preferredStyle: e.target.value }))}
            placeholder="e.g., Casual, Formal, Streetwear"
            style={{ marginLeft: '10px', padding: '5px', width: '300px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Additional Description: </label>
          <textarea
            value={formData.otherDescription || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, otherDescription: e.target.value }))}
            placeholder="Any other preferences or notes..."
            style={{ marginLeft: '10px', padding: '5px', width: '400px', minHeight: '80px' }}
          />
        </div>

        <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Save Personal Info
        </button>
      </form>
    </div>
  )
}
