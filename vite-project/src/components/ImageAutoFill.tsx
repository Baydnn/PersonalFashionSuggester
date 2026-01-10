import { useState, useRef } from 'react'

interface ImageAutoFillProps {
  onImageProcessed: (data: {
    name?: string
    color?: string
    type?: string
    fabricType?: string
    brand?: string
  }) => void
}

// Placeholder component for image auto-fill feature
// This will connect to backend API for Gemini integration later
export function ImageAutoFill({ onImageProcessed }: ImageAutoFillProps) {
  // onImageProcessed will be used when backend is connected
  void onImageProcessed
  const [imagePreview, setImagePreview] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64String = reader.result as string
      setImagePreview(base64String)
      setIsProcessing(true)

      // TODO: Connect to backend API for Gemini image analysis
      // For now, this is a placeholder
      setTimeout(() => {
        // Simulate API call - replace with actual API call later
        // const response = await fetch('/api/analyze-image', { ... })
        // const data = await response.json()
        // onImageProcessed(data)
        
        alert('Image analysis feature - will connect to backend Gemini API')
        setIsProcessing(false)
      }, 1000)
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
      {isProcessing && <p>Analyzing image...</p>}
      {imagePreview && (
        <img
          src={imagePreview}
          alt="Preview"
          style={{ maxWidth: '300px', maxHeight: '300px', marginTop: '10px', display: 'block', borderRadius: '4px' }}
        />
      )}
      <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
        Note: This feature will use Gemini AI to analyze the image and auto-fill form fields when backend is connected.
      </p>
    </div>
  )
}
