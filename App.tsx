import React, { useState, useEffect } from 'react';
import type { ClothingItem, UserProfile, OutfitRecommendation } from './types';
import WardrobeList from './components/WardrobeList';
import AddClothesForm from './components/AddClothesForm';
import AIStylist from './components/AIStylist';
import ProfileForm from './components/ProfileForm';
import { createOutfitRecommendation } from './geminiService';

// the big boss component
const App: React.FC = () => {
  // state stuff
  const [wardrobe, setWardrobe] = useState<ClothingItem[]>([]);
  const [profile, setProfile] = useState<UserProfile>({});
  
  // nav state
  const [activeTab, setActiveTab] = useState<'wardrobe' | 'profile'>('wardrobe');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // ai stylist state
  const [currentOutfit, setCurrentOutfit] = useState<OutfitRecommendation | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // grab data from local storage on load
  useEffect(() => {
    console.log("App mounted, loading local storage...");
    const savedWardrobe = localStorage.getItem('simple_wardrobe');
    const savedProfile = localStorage.getItem('simple_profile');
    
    if (savedWardrobe) {
      setWardrobe(JSON.parse(savedWardrobe));
    }
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  // auto-save to local storage whenever stuff changes
  useEffect(() => {
    localStorage.setItem('simple_wardrobe', JSON.stringify(wardrobe));
    localStorage.setItem('simple_profile', JSON.stringify(profile));
  }, [wardrobe, profile]);


  // handlers

  const handleExportData = () => {
    const data = { wardrobe, profile };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // hacky way to trigger a download
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wardrobe_backup.json';
    link.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.wardrobe) setWardrobe(json.wardrobe);
        if (json.profile) setProfile(json.profile);
        alert("Data loaded successfully!");
      } catch (err) {
        alert("Couldn't parse that file. Is it a valid JSON?");
      }
    };
    reader.readAsText(file);
  };

  const handleGetOutfit = async (vibe: string) => {
    setIsAiLoading(true);
    try {
      const outfit = await createOutfitRecommendation(wardrobe, vibe, profile);
      setCurrentOutfit(outfit);
    } catch (err) {
      console.error(err);
      alert("AI is having a bad day, try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-blue-600">St-AI-list</h1>
          </div>
          
          <div className="flex gap-4 text-sm">
            <button onClick={handleExportData} className="text-gray-600 hover:text-blue-600">
              Export
            </button>
            <label className="text-gray-600 hover:text-blue-600 cursor-pointer">
              Import
              <input type="file" className="hidden" accept=".json" onChange={handleFileUpload} />
            </label>
          </div>
        </div>
      </header>

      {/* nav tabs */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 flex">
          <button 
            onClick={() => setActiveTab('wardrobe')}
            className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'wardrobe' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
            }`}
          >
            Wardrobe & Stylist
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'profile' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
            }`}
          >
            Profile
          </button>
        </div>
      </nav>

      {/* main content area */}
      <main className="max-w-4xl mx-auto p-4 py-8">
        
        {activeTab === 'wardrobe' ? (
          <div className="flex flex-col gap-8">
            {/* ai section */}
            <AIStylist 
              wardrobe={wardrobe}
              profile={profile}
              recommendation={currentOutfit}
              loading={isAiLoading}
              onGetOutfit={handleGetOutfit}
              onEditProfile={() => setActiveTab('profile')}
            />

            <hr className="border-gray-200" />

            {/* clothes list */}
            <WardrobeList 
              items={wardrobe} 
              onDelete={(id) => setWardrobe(current => current.filter(item => item.id !== id))} 
              onAddClick={() => setIsAddModalOpen(true)}
            />
          </div>
        ) : (
          <ProfileForm 
            profile={profile} 
            onSave={(p) => { 
              setProfile(p); 
              setActiveTab('wardrobe'); // bounce back to wardrobe
            }} 
          />
        )}
      </main>

      {/* add clothes modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
           <div className="relative w-full max-w-2xl my-8 animate-in fade-in zoom-in-95 duration-200">
             <AddClothesForm 
               onAdd={(item) => { 
                 setWardrobe([...wardrobe, item]); 
                 setIsAddModalOpen(false); 
               }}
               onClose={() => setIsAddModalOpen(false)}
             />
           </div>
        </div>
      )}

    </div>
  );
};

export default App;