import React, { useState } from 'react';
import { ClothingType, Fit, DesignComplexity, type ClothingItem } from '../types';
import { identifyItemFromText, identifyItemFromImage } from '../geminiService';

interface Props {
  onAdd: (item: ClothingItem) => void;
  onClose?: () => void;
}

const AddClothesForm: React.FC<Props> = ({ onAdd, onClose }) => {
  // all the form state
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ClothingType>(ClothingType.TSHIRT);
  const [color, setColor] = useState('');
  const [fabric, setFabric] = useState('');
  const [fit, setFit] = useState<Fit>(Fit.REGULAR);
  const [brand, setBrand] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  // let gemini do the heavy lifting
  const handleMagicAutofill = async () => {
    setIsThinking(true);
    console.log("Magic button clicked!");

    try {
      let result;
      
      // pics > text
      if (imagePreview) {
        console.log("Analyzing image...");
        result = await identifyItemFromImage(imagePreview);
      } 
      // fallback to just the name
      else if (title.trim()) {
        console.log("Searching by title...");
        result = await identifyItemFromText(title);
      } 
      else {
        alert("Upload a photo or type a name first!");
        setIsThinking(false);
        return;
      }

      console.log("AI Result:", result);

      // fill in the form
      if (result.title || result.officialTitle) setTitle(result.title || result.officialTitle);
      if (result.brand) setBrand(result.brand);
      if (result.color) setColor(result.color);
      if (result.fabric || result.material) setFabric(result.fabric || result.material || '');
      if (result.specialNotes || result.technicalNotes) setSpecialNotes(result.specialNotes || result.technicalNotes || '');

      // try to match enum values
      if (result.type) {
        const foundType = Object.values(ClothingType).find(t => t.toLowerCase() === result.type.toLowerCase());
        if (foundType) setType(foundType);
      }

      if (result.fit) {
        const foundFit = Object.values(Fit).find(f => f.toLowerCase() === result.fit.toLowerCase());
        if (foundFit) setFit(foundFit);
      }

    } catch (e) {
      console.error("Autofill failed", e);
      alert("Oops, couldn't figure out what that is. Try filling it in manually.");
    } finally {
      setIsThinking(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) {
      alert("Please give it a name!");
      return;
    }

    const newItem: ClothingItem = {
      id: crypto.randomUUID(),
      title,
      type,
      color: color || 'Unknown',
      fabric: fabric || 'Unknown',
      fit,
      design: DesignComplexity.NONE, // defaults
      brand,
      imageUrl: imagePreview || undefined,
      specialNotes,
      dateAdded: Date.now()
    };

    onAdd(newItem);
  };

  return (
    <div className="bg-white rounded-lg shadow-2xl flex flex-col max-h-[90vh]">
      
      {/* header */}
      <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
        <h2 className="text-xl font-bold text-gray-800">Add New Item</h2>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        )}
      </div>

      {/* scrolling form area */}
      <div className="overflow-y-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* left: photo upload */}
            <div className="md:order-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Photo</label>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg h-48 flex flex-col items-center justify-center bg-gray-50 relative hover:bg-gray-100 transition cursor-pointer">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-contain p-2" />
                ) : (
                  <div className="text-center p-4">
                    <i className="fa-solid fa-camera text-3xl text-gray-300 mb-2"></i>
                    <p className="text-sm text-gray-400">Click to upload</p>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                />
              </div>

              {/* the auto-fill button */}
              <button
                type="button"
                onClick={handleMagicAutofill}
                disabled={isThinking}
                className={`mt-3 w-full py-2 px-4 rounded font-bold border flex items-center justify-center gap-2 transition
                  ${isThinking 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100 hover:border-purple-300'
                  }
                `}
              >
                {isThinking ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Analyzing...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-wand-magic-sparkles"></i> Autofill with AI
                  </>
                )}
              </button>
              <p className="text-xs text-center text-gray-400 mt-1">
                Upload a photo or type a name, then click this!
              </p>
            </div>

            {/* right: standard inputs */}
            <div className="md:order-1 space-y-4">
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Name</label>
                <input 
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded text-gray-900 focus:ring-2 focus:ring-blue-200 outline-none"
                  placeholder="e.g. Favorite Blue Jeans"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
                <select 
                  value={type} 
                  onChange={e => setType(e.target.value as ClothingType)} 
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded text-gray-900 focus:ring-2 focus:ring-blue-200 outline-none"
                >
                  {Object.values(ClothingType).map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

               <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Color</label>
                  <input 
                    type="text" 
                    value={color} 
                    onChange={e => setColor(e.target.value)} 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded text-gray-900 focus:ring-2 focus:ring-blue-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Brand</label>
                  <input 
                    type="text" 
                    value={brand} 
                    onChange={e => setBrand(e.target.value)} 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded text-gray-900 focus:ring-2 focus:ring-blue-200 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Material</label>
                <input 
                  type="text" 
                  value={fabric} 
                  onChange={e => setFabric(e.target.value)} 
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded text-gray-900 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Fit</label>
                <select 
                  value={fit} 
                  onChange={e => setFit(e.target.value as Fit)} 
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded text-gray-900 focus:ring-2 focus:ring-blue-200 outline-none"
                >
                  {Object.values(Fit).map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>

            <div className="mt-4">
               <label className="block text-xs font-bold text-gray-500 mb-1">Notes</label>
               <input 
                type="text" 
                value={specialNotes} 
                onChange={e => setSpecialNotes(e.target.value)} 
                placeholder="Any special details?" 
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded text-gray-900 focus:ring-2 focus:ring-blue-200 outline-none" 
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            {onClose && (
              <button 
                type="button" 
                onClick={onClose} 
                className="flex-1 py-3 border border-gray-300 text-gray-600 font-bold rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
            <button 
              type="submit" 
              className="flex-[2] py-3 bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 rounded shadow-md"
            >
              Save Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClothesForm;