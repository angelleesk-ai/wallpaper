import React from 'react';

const LoadingGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      {[...Array(4)].map((_, i) => (
        <div 
          key={i} 
          className="aspect-[9/16] rounded-2xl bg-gray-800 animate-pulse overflow-hidden relative"
        >
           <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-50"></div>
           <div className="absolute bottom-4 left-4 right-4 h-2 bg-gray-700 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  );
};

export default LoadingGrid;
