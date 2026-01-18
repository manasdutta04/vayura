import React from "react";

const SkeletonCard: React.FC = () => {
  return (
    <div className="w-full text-left px-4 py-3 text-sm flex flex-col border-b border-gray-100 last:border-b-0">
      <div className="space-y-1.5">
        {/* Placeholder for district name (bold, medium font) */}
        <div className="relative h-5 w-3/4 overflow-hidden rounded bg-gray-200">
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]" />
        </div>

        {/* Placeholder for state/population (small text) */}
        <div className="relative h-3.5 w-2/3 overflow-hidden rounded bg-gray-200">
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
