import React, { useState } from 'react';
import type { UserProfile } from '../types';

interface Props {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
}

// Reuse resizing logic to prevent LocalStorage quota exceeded errors
const resizeImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_DIM = 800; // Keep profile pics slightly smaller for storage safety

        if (width > height && width > MAX_DIM) {
          height *= MAX_DIM / width;
          width = MAX_DIM;
        } else if (height > width && height > MAX_DIM) {
          width *= MAX_DIM / height;
          height = MAX_DIM;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const ProfileForm: React.FC<Props> = ({ profile, onSave }) => {
  const [formData, setFormData] = useState<UserProfile>(profile);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    alert('Profile saved!');
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const resized = await resizeImage(file);
        setFormData(prev => ({ ...prev, userPhoto: resized }));
      } catch (err) {
        console.error("Error processing profile photo", err);
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 border rounded-xl shadow-sm">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">About You</h2>
        <p className="text-gray-500">Help the AI understand your style and location.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Profile Photo Section */}
        <div className="flex flex-col items-center mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">Your Photo (for Try-On)</label>
          <div className="relative group cursor-pointer w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
            {formData.userPhoto ? (
              <img src={formData.userPhoto} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <i className="fa-solid fa-user text-4xl"></i>
              </div>
            )}
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <i className="fa-solid fa-camera text-white text-xl"></i>
            </div>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handlePhotoUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center max-w-xs">
            Upload a full-body or half-body photo to use the "Try On" feature.
          </p>
        </div>

        {/* basic stats */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Height</label>
            <input 
              type="text" 
              placeholder="e.g. 5'10" 
              value={formData.height || ''}
              onChange={e => setFormData({...formData, height: e.target.value})}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded text-gray-900 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Weight</label>
            <input 
              type="text" 
              placeholder="e.g. 160 lbs" 
              value={formData.weight || ''}
              onChange={e => setFormData({...formData, weight: e.target.value})}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded text-gray-900 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
            />
          </div>
        </div>

        {/* who are u */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Age</label>
            <input 
              type="text" 
              placeholder="25" 
              value={formData.age || ''}
              onChange={e => setFormData({...formData, age: e.target.value})}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded text-gray-900 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Gender</label>
            <input 
              type="text" 
              placeholder="Male/Female/Other" 
              value={formData.gender || ''}
              onChange={e => setFormData({...formData, gender: e.target.value})}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded text-gray-900 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
            />
          </div>
        </div>

        {/* where u at */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
          <input 
            type="text" 
            placeholder="e.g. New York, NY (helps with weather/vibe)" 
            value={formData.location || ''}
            onChange={e => setFormData({...formData, location: e.target.value})}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded text-gray-900 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Style Preferences</label>
          <textarea 
            placeholder="I like streetwear, oversized hoodies, and dark colors..." 
            value={formData.styleDescription || ''}
            onChange={e => setFormData({...formData, styleDescription: e.target.value})}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded text-gray-900 text-sm h-32 resize-none focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
          />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 hover:bg-blue-700 transition rounded shadow-md">
          Save Profile
        </button>
      </form>
    </div>
  );
};

export default ProfileForm;