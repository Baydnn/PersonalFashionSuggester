import { useState, useRef } from 'react'

interface ImageAutoFillProps {
  onImageProcessed: (data: {
    name?: string
    color?: string
    type?: string
    fabricType?: string
    brand?: string
    rawResponse?: any
  }) => void
}

// Image auto-fill component using Gemini AI
export function ImageAutoFill({ onImageProcessed }: ImageAutoFillProps) {
  const [imagePreview, setImagePreview] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64String = reader.result as string
      setImagePreview(base64String)
      setIsProcessing(true)
      setProgress('Uploading image...')
      setError('')
      setSuccess(false)

      try {
        setProgress('Analyzing image with AI...')
        
        // Call backend API for Gemini image analysis
        const response = await fetch('/api/analyze-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: base64String
          })
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`HTTP error! status: ${response.status}, ${errorText}`)
        }

        setProgress('Processing results...')
        const data = await response.json()
        
        console.log('=== API Response (full):', JSON.stringify(data, null, 2))
        console.log('=== API Response fields:', {
          name: data.name,
          color: data.color,
          type: data.type,
          fabricType: data.fabricType,
          brand: data.brand,
          graphicSize: data.graphicSize,
          fit: data.fit
        })
        
        // Call the callback with the detected attributes
        const processedData = {
          name: data.name || undefined,
          color: data.color || undefined,
          type: data.type || undefined,
          fabricType: data.fabricType || undefined,
          brand: data.brand || undefined
        }
        
        console.log('=== Calling onImageProcessed with:', processedData)
        console.log('=== Has data?', {
          hasName: !!processedData.name,
          hasColor: !!processedData.color,
          hasType: !!processedData.type,
          hasFabricType: !!processedData.fabricType,
          hasBrand: !!processedData.brand
        })
        
        onImageProcessed({
          ...processedData,
          rawResponse: data  // Pass full response for display
        })
        
        setProgress('')
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000) // Hide success message after 3 seconds
        
      } catch (error) {
        console.error('Error analyzing image:', error)
        setError(error instanceof Error ? error.message : 'Error analyzing image')
        setProgress('')
      } finally {
        setIsProcessing(false)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div style={{ marginBottom: '20px', padding: '15px', border: '2px dashed #ccc', borderRadius: '8px' }}>
      <h3 style={{ marginTop: 0 }}>Auto-Fill from Image</h3>
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
        Upload an image of your clothing item to automatically detect its attributes
      </p>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        disabled={isProcessing}
        style={{ marginBottom: '10px' }}
      />
      {isProcessing && (
        <div style={{ marginTop: '10px', marginBottom: '10px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            padding: '10px',
            backgroundColor: '#f0f7ff',
            borderRadius: '4px',
            border: '1px solid #b3d9ff'
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              border: '3px solid #f3f3f3',
              borderTop: '3px solid #2196F3',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <span style={{ color: '#1976D2', fontWeight: '500' }}>{progress || 'Analyzing image...'}</span>
          </div>
        </div>
      )}
      {error && (
        <div style={{
          marginTop: '10px',
          padding: '10px',
          backgroundColor: '#ffebee',
          color: '#c62828',
          borderRadius: '4px',
          border: '1px solid #ef5350'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      {success && !isProcessing && (
        <div style={{
          marginTop: '10px',
          padding: '10px',
          backgroundColor: '#e8f5e9',
          color: '#2e7d32',
          borderRadius: '4px',
          border: '1px solid #4caf50'
        }}>
          ✓ Image analyzed! Form fields have been auto-filled.
        </div>
      )}
      {imagePreview && (
        <img
          src={imagePreview}
          alt="Preview"
          style={{ maxWidth: '300px', maxHeight: '300px', marginTop: '10px', display: 'block', borderRadius: '4px' }}
        />
      )}
      {!isProcessing && (
        <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
          This feature uses Gemini AI to analyze the image and auto-fill form fields.
        </p>
      )}
    </div>
  )
}
