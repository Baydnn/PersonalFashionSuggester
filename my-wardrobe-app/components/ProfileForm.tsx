import React, { useState } from 'react';
import type { UserProfile } from '../types';

interface Props {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
}

const ProfileForm: React.FC<Props> = ({ profile, onSave }) => {
  const [formData, setFormData] = useState<UserProfile>(profile);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    alert('Profile saved!');
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 border rounded-xl shadow-sm">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">About You</h2>
        <p className="text-gray-500">Help the AI understand your style and location.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
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