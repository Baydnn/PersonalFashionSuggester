import { useState } from 'react'
import { WardrobeProvider } from './context/WardrobeContext'
import { AddClothingForm } from './components/AddClothingForm'
import { WardrobeList } from './components/WardrobeList'
import { PersonalInfoSection } from './components/PersonalInfo'
import { OutfitSuggestions } from './components/OutfitSuggestions'
import { ImportExport } from './components/ImportExport'

function App() {
  const [activeTab, setActiveTab] = useState<'wardrobe' | 'add' | 'personal' | 'suggestions' | 'import'>('wardrobe')

  return (
    <WardrobeProvider>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '20px',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: '30px', 
          color: '#333',
          fontSize: '2.5em'
        }}>
          Personal Fashion Suggester
        </h1>
        
        <nav style={{ marginBottom: '20px', borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('wardrobe')}
              style={{
                padding: '10px 20px',
                border: '1px solid #ccc',
                backgroundColor: activeTab === 'wardrobe' ? '#4CAF50' : '#ffffff',
                color: activeTab === 'wardrobe' ? 'white' : '#333',
                cursor: 'pointer',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              My Wardrobe
            </button>
            <button
              onClick={() => setActiveTab('add')}
              style={{
                padding: '10px 20px',
                border: '1px solid #ccc',
                backgroundColor: activeTab === 'add' ? '#4CAF50' : '#ffffff',
                color: activeTab === 'add' ? 'white' : '#333',
                cursor: 'pointer',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              Add Clothing
            </button>
            <button
              onClick={() => setActiveTab('personal')}
              style={{
                padding: '10px 20px',
                border: '1px solid #ccc',
                backgroundColor: activeTab === 'personal' ? '#4CAF50' : '#ffffff',
                color: activeTab === 'personal' ? 'white' : '#333',
                cursor: 'pointer',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              Personal Info
            </button>
            <button
              onClick={() => setActiveTab('suggestions')}
              style={{
                padding: '10px 20px',
                border: '1px solid #ccc',
                backgroundColor: activeTab === 'suggestions' ? '#4CAF50' : '#ffffff',
                color: activeTab === 'suggestions' ? 'white' : '#333',
                cursor: 'pointer',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              Suggestions
            </button>
            <button
              onClick={() => setActiveTab('import')}
              style={{
                padding: '10px 20px',
                border: '1px solid #ccc',
                backgroundColor: activeTab === 'import' ? '#4CAF50' : '#ffffff',
                color: activeTab === 'import' ? 'white' : '#333',
                cursor: 'pointer',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              Import/Export
            </button>
          </div>
        </nav>

        <main style={{ 
          backgroundColor: '#ffffff', 
          color: '#333',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {activeTab === 'wardrobe' && <WardrobeList />}
          {activeTab === 'add' && <AddClothingForm />}
          {activeTab === 'personal' && <PersonalInfoSection />}
          {activeTab === 'suggestions' && <OutfitSuggestions />}
          {activeTab === 'import' && <ImportExport />}
        </main>
      </div>
    </WardrobeProvider>
  )
}

export default App
