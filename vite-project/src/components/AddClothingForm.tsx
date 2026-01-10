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

  const handleImageProcessed = (data: {
    name?: string
    color?: string
    type?: string
    fabricType?: string
    brand?: string
  }) => {
    // Auto-fill form fields based on image analysis
    setFormData(prev => ({
      ...prev,
      ...(data.name && { name: data.name }),
      ...(data.color && { color: data.color }),
      ...(data.type && { type: data.type as ClothingType }),
      ...(data.fabricType && { fabricType: data.fabricType as FabricType }),
      ...(data.brand && { brand: data.brand })
    }))
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newItem: ClothingItem = {
      ...formData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    }
    
    dispatch({ type: 'ADD_CLOTHING', payload: newItem })
    
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
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '20px' }}>
      <h2>Add New Clothing Item</h2>
      
      <ImageAutoFill onImageProcessed={handleImageProcessed} />
      
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
