import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export default function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={`relative overflow-hidden rounded bg-gray-200 ${className || ""}`}
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]" />
    </div>
  );
}