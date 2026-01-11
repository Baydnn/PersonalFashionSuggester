import { useState, useRef } from 'react'
import { useWardrobe } from '../context/WardrobeContext'
import type { ClothingItem, FabricType, Fit, ClothingType, GraphicSize } from '../types'
import { ImageAutoFill } from './ImageAutoFill'

export function AddClothingForm() {
  const { dispatch } = useWardrobe()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  
  const [formData, setFormData] = useState<Omit<ClothingItem, 'id'>>({
    name: '',
    fabricType: 'cotton',
    fit: 'regular',
    brand: '',
    color: '',
    type: 't-shirt',
    graphicSize: 'none',
    imageUrl: ''
  })
  
  const [aiAnalysis, setAiAnalysis] = useState<{
    raw?: any
    detected?: {
      name?: string
      color?: string
      type?: string
      fabricType?: string
      brand?: string
      graphicSize?: string
      fit?: string
    }
  } | null>(null)

  const handleImageProcessed = (data: {
    name?: string
    color?: string
    type?: string
    fabricType?: string
    brand?: string
    rawResponse?: any
  }) => {
    // Auto-fill form fields based on image analysis
    console.log('handleImageProcessed called with data:', data)
    
    // Store AI analysis for display
    if (data.rawResponse) {
      setAiAnalysis({
        raw: data.rawResponse,
        detected: {
          name: data.name,
          color: data.color,
          type: data.type,
          fabricType: data.fabricType,
          brand: data.brand,
          graphicSize: data.rawResponse.graphicSize,
          fit: data.rawResponse.fit
        }
      })
    }
    
    // Normalize type values to match our enum (lowercase, handle variations)
    const normalizeType = (type: string | undefined): ClothingType | undefined => {
      if (!type) return undefined
      const normalized = type.toLowerCase().trim()
      const typeMap: Record<string, ClothingType> = {
        't-shirt': 't-shirt',
        'tshirt': 't-shirt',
        't shirt': 't-shirt',
        't_shirt': 't-shirt',
        'hoodie': 'hoodie',
        'jacket': 'jacket',
        'sweater': 'sweater',
        'pants': 'pants',
        'shirt': 'shirt',
        'shorts': 'shorts',
        'dress': 'dress',
        'other': 'other'
      }
      return typeMap[normalized] || 'other'
    }
    
    // Normalize fabric type
    const normalizeFabric = (fabric: string | undefined): FabricType | undefined => {
      if (!fabric) return undefined
      const normalized = fabric.toLowerCase().trim()
      const fabricMap: Record<string, FabricType> = {
        'cotton': 'cotton',
        'polyester': 'polyester',
        'wool': 'wool',
        'denim': 'denim',
        'leather': 'leather',
        'silk': 'silk',
        'linen': 'linen',
        'other': 'other'
      }
      return fabricMap[normalized] || 'cotton'
    }
    
    setFormData(prev => {
      console.log('=== setFormData called, prev state:', prev)
      
      const updates: Partial<Omit<ClothingItem, 'id'>> = {}
      
      if (data.name && data.name.trim()) {
        updates.name = data.name.trim()
        console.log('Setting name:', updates.name)
      }
      if (data.color && data.color.trim()) {
        updates.color = data.color.trim()
        console.log('Setting color:', updates.color)
      }
      if (data.type) {
        const normalizedType = normalizeType(data.type)
        if (normalizedType) {
          updates.type = normalizedType
          console.log('Setting type:', updates.type, '(normalized from:', data.type, ')')
        }
      }
      if (data.fabricType) {
        const normalizedFabric = normalizeFabric(data.fabricType)
        if (normalizedFabric) {
          updates.fabricType = normalizedFabric
          console.log('Setting fabricType:', updates.fabricType, '(normalized from:', data.fabricType, ')')
        }
      }
      if (data.brand && data.brand.trim()) {
        updates.brand = data.brand.trim()
        console.log('Setting brand:', updates.brand)
      }
      
      console.log('=== Updates object:', updates)
      console.log('=== Keys in updates:', Object.keys(updates))
      
      const updated = { ...prev, ...updates }
      console.log('=== Updated formData (full):', JSON.stringify(updated, null, 2))
      console.log('=== Form field values:', {
        name: updated.name,
        color: updated.color,
        type: updated.type,
        fabricType: updated.fabricType,
        brand: updated.brand
      })
      
      return updated
    })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setImagePreview(base64String)
        setFormData(prev => ({ ...prev, imageUrl: base64String }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Save to backend first
      const response = await fetch('/api/clothing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
        throw new Error(errorData.detail || `Failed to save clothing item: ${response.status}`)
      }

      const savedItem: ClothingItem = await response.json()
      
      // Then update frontend state
      dispatch({ type: 'ADD_CLOTHING', payload: savedItem })
      
      alert('Clothing item added successfully!')
    } catch (error) {
      console.error('Error saving clothing item:', error)
      alert(error instanceof Error ? error.message : 'Failed to save clothing item. Please try again.')
      return
    }
    
    // Reset form
    setFormData({
      name: '',
      fabricType: 'cotton',
      fit: 'regular',
      brand: '',
      color: '',
      type: 't-shirt',
      graphicSize: 'none',
      imageUrl: ''
    })
    setImagePreview('')
    setAiAnalysis(null)  // Clear AI analysis on form reset
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '20px' }}>
      <h2>Add New Clothing Item</h2>
      
      <ImageAutoFill onImageProcessed={handleImageProcessed} />
      
      {aiAnalysis && (
        <div style={{
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#f0f7ff',
          border: '1px solid #b3d9ff',
          borderRadius: '8px'
        }}>
          <h3 style={{ marginTop: 0, color: '#1976D2' }}>AI Analysis Results</h3>
          <div style={{ 
            backgroundColor: '#ffffff', 
            padding: '10px', 
            borderRadius: '4px',
            marginTop: '10px',
            fontSize: '14px',
            fontFamily: 'monospace'
          }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>Detected Attributes:</strong>
            </div>
            {aiAnalysis.detected && (
              <div style={{ lineHeight: '1.8' }}>
                {aiAnalysis.detected.name && (
                  <div><strong>Name:</strong> {aiAnalysis.detected.name}</div>
                )}
                {aiAnalysis.detected.color && (
                  <div><strong>Color:</strong> {aiAnalysis.detected.color}</div>
                )}
                {aiAnalysis.detected.type && (
                  <div><strong>Type:</strong> {aiAnalysis.detected.type}</div>
                )}
                {aiAnalysis.detected.fabricType && (
                  <div><strong>Fabric Type:</strong> {aiAnalysis.detected.fabricType}</div>
                )}
                {aiAnalysis.detected.brand && (
                  <div><strong>Brand:</strong> {aiAnalysis.detected.brand}</div>
                )}
                {aiAnalysis.detected.fit && (
                  <div><strong>Fit:</strong> {aiAnalysis.detected.fit}</div>
                )}
                {aiAnalysis.detected.graphicSize && (
                  <div><strong>Graphic Size:</strong> {aiAnalysis.detected.graphicSize}</div>
                )}
                {(!aiAnalysis.detected.name && !aiAnalysis.detected.color && !aiAnalysis.detected.type && 
                  !aiAnalysis.detected.fabricType && !aiAnalysis.detected.brand) && (
                  <div style={{ color: '#666', fontStyle: 'italic' }}>
                    No attributes detected. AI may not have found any information in the image.
                  </div>
                )}
              </div>
            )}
            <details style={{ marginTop: '15px' }}>
              <summary style={{ cursor: 'pointer', color: '#1976D2', fontWeight: '500' }}>
                View Raw API Response
              </summary>
              <pre style={{ 
                marginTop: '10px', 
                padding: '10px', 
                backgroundColor: '#f5f5f5', 
                borderRadius: '4px',
                overflow: 'auto',
                maxHeight: '200px',
                fontSize: '12px'
              }}>
                {JSON.stringify(aiAnalysis.raw, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Name: </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            style={{ marginLeft: '10px', padding: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Type: </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as ClothingType }))}
            style={{ marginLeft: '10px', padding: '5px' }}
          >
            <option value="hoodie">Hoodie</option>
            <option value="t-shirt">T-Shirt</option>
            <option value="jacket">Jacket</option>
            <option value="sweater">Sweater</option>
            <option value="pants">Pants</option>
            <option value="shirt">Shirt</option>
            <option value="shorts">Shorts</option>
            <option value="dress">Dress</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Color: </label>
          <input
            type="text"
            value={formData.color}
            onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
            required
            style={{ marginLeft: '10px', padding: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Fabric Type: </label>
          <select
            value={formData.fabricType}
            onChange={(e) => setFormData(prev => ({ ...prev, fabricType: e.target.value as FabricType }))}
            style={{ marginLeft: '10px', padding: '5px' }}
          >
            <option value="cotton">Cotton</option>
            <option value="polyester">Polyester</option>
            <option value="wool">Wool</option>
            <option value="denim">Denim</option>
            <option value="leather">Leather</option>
            <option value="silk">Silk</option>
            <option value="linen">Linen</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Fit: </label>
          <select
            value={formData.fit}
            onChange={(e) => setFormData(prev => ({ ...prev, fit: e.target.value as Fit }))}
            style={{ marginLeft: '10px', padding: '5px' }}
          >
            <option value="baggy">Baggy</option>
            <option value="regular">Regular</option>
            <option value="tight">Tight</option>
          </select>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Brand (optional): </label>
          <input
            type="text"
            value={formData.brand}
            onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
            style={{ marginLeft: '10px', padding: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Graphic Size: </label>
          <select
            value={formData.graphicSize}
            onChange={(e) => setFormData(prev => ({ ...prev, graphicSize: e.target.value as GraphicSize }))}
            style={{ marginLeft: '10px', padding: '5px' }}
          >
            <option value="none">No Graphic</option>
            <option value="small">Small Graphic</option>
            <option value="large">Large Graphic</option>
          </select>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Image: </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ marginLeft: '10px' }}
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              style={{ maxWidth: '200px', maxHeight: '200px', marginTop: '10px', display: 'block' }}
            />
          )}
        </div>

        <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Add to Wardrobe
        </button>
      </form>
    </div>
  )
}
