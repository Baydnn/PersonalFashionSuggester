import React, { useState } from 'react';
import type { ClothingItem, OutfitRecommendation, UserProfile } from '../types';
import { generateTryOnImage } from "../geminiService";

interface Props {
  wardrobe: ClothingItem[];
  profile: UserProfile;
  recommendation: OutfitRecommendation | null;
  loading: boolean;
  onEditProfile: () => void;
  onGetOutfit: (vibe: string) => void;
}

const AIStylist: React.FC<Props> = ({ 
  wardrobe, 
  onGetOutfit, 
  recommendation, 
  loading,
  profile,
  onEditProfile
}) => {
  const [vibe, setVibe] = useState('');
  const [tryOnImage, setTryOnImage] = useState<string | null>(null);
  const [isTryOnLoading, setIsTryOnLoading] = useState(false);

  const handleSubmit = () => {
    if (!vibe) return;
    setTryOnImage(null); // reset try-on image on new request
    onGetOutfit(vibe);
  };

  const handleTryOn = async () => {
    if (!profile.userPhoto || !recommendation) return;
    
    setIsTryOnLoading(true);
    
    const outfitDescription = recommendation.wardrobeItemIds
      .map(id => {
        const item = wardrobe.find(w => w.id === id);
        return item ? `${item.color} ${item.type}` : '';
      })
      .filter(Boolean)
      .join(', ');
    
    const result = await generateTryOnImage(profile.userPhoto, outfitDescription);
    setTryOnImage(result);
    setIsTryOnLoading(false);
  };

  const hasResult = !!recommendation && !loading;

  return (
    <div className={`transition-all duration-500 ease-in-out ${hasResult ? 'grid grid-cols-1 lg:grid-cols-12 gap-8 items-start' : 'max-w-2xl mx-auto'}`}>
      
      {/* left column: input section */}
      <div className={`bg-white border rounded-xl p-6 shadow-sm ${hasResult ? 'lg:col-span-4 sticky top-4' : 'w-full'}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
            <i className="fa-solid fa-wand-magic-sparkles text-xl"></i>
          </div>
          <h2 className="text-xl font-bold">AI Stylist</h2>
        </div>
        
        <p className="text-gray-600 mb-4 text-sm">
          Describe the occasion, vibe, or weather. I'll check your closet and tell you what to wear.
        </p>
        
        <div className="space-y-3">
          <textarea 
            placeholder="e.g. 'Dinner in downtown Chicago', 'Rainy tuesday', 'Cozy night in'"
            value={vibe}
            onChange={(e) => setVibe(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none transition resize-none h-24 text-sm"
          />
          
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin"></i> Styling...
              </>
            ) : (
              'Create Outfit'
            )}
          </button>
        </div>
      </div>

      {/* right column: results section */}
      {hasResult && (
        <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
          
          {/* the "why" blurb */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <i className="fa-solid fa-quote-right text-6xl text-blue-900"></i>
            </div>
            <div className="relative z-10">
              <h3 className="text-blue-800 font-bold uppercase text-xs tracking-wider mb-3">Stylist's Choice</h3>
              <p className="text-gray-900 text-xl font-medium leading-relaxed">
                "{recommendation.reasoning}"
              </p>
            </div>
          </div>

          {/* the clothes */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
              <i className="fa-solid fa-hanger text-blue-500"></i> Selected Items
            </h3>
            
            {recommendation.wardrobeItemIds?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recommendation.wardrobeItemIds.map(id => {
                  const item = wardrobe.find(w => w.id === id);
                  if (!item) return null;
                  return (
                    <div key={id} className="bg-white border border-gray-200 rounded-lg p-4 flex gap-4 shadow-sm hover:shadow-md transition">
                      {/* image */}
                      <div className="w-24 h-24 bg-gray-50 rounded-md flex-shrink-0 border overflow-hidden">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">
                             <i className="fa-solid fa-shirt"></i>
                          </div>
                        )}
                      </div>
                      
                      {/* details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="text-xs font-bold text-blue-600 uppercase mb-1">{item.type}</div>
                        <h4 className="font-bold text-gray-900 truncate mb-1" title={item.title}>{item.title}</h4>
                        <p className="text-sm text-gray-500 mb-2">{item.color} • {item.fit} fit</p>
                        <div className="text-xs text-gray-400 truncate">{item.brand}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-gray-400 italic text-sm text-center p-8 bg-gray-50 rounded-lg border border-dashed">
                No specific items from your wardrobe matched this vibe perfectly.
              </div>
            )}
          </div>

          {/* VIRTUAL TRY ON SECTION */}
          {recommendation.wardrobeItemIds?.length > 0 && (
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-purple-900 flex items-center gap-2">
                  <i className="fa-solid fa-camera-retro text-purple-600"></i> Virtual Try-On
                </h3>
              </div>

              {!profile.userPhoto ? (
                <div className="text-center py-6">
                  <p className="text-purple-700 mb-3">Upload a photo of yourself in the Profile tab to enable Virtual Try-On!</p>
                  <button onClick={onEditProfile} className="text-sm font-bold text-purple-600 hover:underline">
                    Go to Profile →
                  </button>
                </div>
              ) : (
                <div>
                   {/* Results Display */}
                   {tryOnImage && (
                     <div className="mb-6 rounded-lg overflow-hidden border-2 border-purple-200 shadow-md">
                        <img src={tryOnImage} alt="Virtual Try On" className="w-full" />
                     </div>
                   )}

                   {/* Action Button */}
                   <button
                     onClick={handleTryOn}
                     disabled={isTryOnLoading}
                     className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
                   >
                     {isTryOnLoading ? (
                       <>
                         <i className="fa-solid fa-spinner fa-spin"></i> Generating Image...
                       </>
                     ) : (
                       <>
                         <i className="fa-solid fa-wand-magic"></i> {tryOnImage ? 'Try It On Again' : 'Try It On?'}
                       </>
                     )}
                   </button>
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default AIStylist;