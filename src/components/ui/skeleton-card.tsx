import React from 'react';

const SkeletonCard: React.FC = () => {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <div className="space-y-4">
        {/* Placeholder for district name/title */}
        <div className="relative h-6 w-3/4 overflow-hidden rounded bg-gray-200">
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]" />
        </div>
        
        {/* Placeholder for subtitle or stat */}
        <div className="relative h-4 w-1/2 overflow-hidden rounded bg-gray-200">
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]" />
        </div>
        
        {/* Placeholder for description or metric line */}
        <div className="relative h-4 w-full overflow-hidden rounded bg-gray-200">
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]" />
        </div>
        
        {/* Another metric line */}
        <div className="relative h-4 w-2/3 overflow-hidden rounded bg-gray-200">
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]" />
        </div>
        
        {/* Placeholder for icons or buttons (e.g., circular elements) */}
        <div className="flex space-x-4">
          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gray-200">
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]" />
          </div>
          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gray-200">
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;