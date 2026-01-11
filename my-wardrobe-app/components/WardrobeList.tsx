import React from 'react';
import type { ClothingItem } from '../types';

interface Props {
  items: ClothingItem[];
  onDelete: (id: string) => void;
  onAddClick: () => void;
}

const WardrobeList: React.FC<Props> = ({ items, onDelete, onAddClick }) => {
  
  // empty state - feelsbadman
  if (items.length === 0) {
    return (
      <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-lg">
        <div className="text-6xl mb-4">👻</div>
        <p className="text-gray-500 mb-6 text-lg">Your closet is a ghost town!</p>
        <button 
          onClick={onAddClick} 
          className="bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition shadow-lg font-bold"
        >
          Add First Item
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <h2 className="text-2xl font-bold text-gray-800">Your Closet <span className="text-gray-400 text-lg">({items.length})</span></h2>
        <button 
          onClick={onAddClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow-sm font-bold text-sm flex items-center gap-2"
        >
          <i className="fa-solid fa-plus"></i> Add New
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-200">
            {/* image wrapper */}
            <div className="aspect-square bg-gray-50 relative group">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">
                  <i className="fa-solid fa-shirt"></i>
                </div>
              )}
              
              {/* trash button (hidden until hover) */}
              <button 
                onClick={() => {
                  if (confirm('Are you sure you want to toss this?')) {
                    onDelete(item.id);
                  }
                }}
                className="absolute top-2 right-2 bg-white text-red-500 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
              >
                <i className="fa-solid fa-trash-can"></i>
              </button>
            </div>

            {/* details */}
            <div className="p-4">
              <h3 className="font-bold text-lg text-gray-900 truncate" title={item.title}>
                {item.title || 'Untitled Item'}
              </h3>
              <p className="text-sm text-gray-500 mb-3">{item.color} • {item.type}</p>
              
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded">
                  {item.fit}
                </span>
                <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded">
                  {item.fabric}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WardrobeList;