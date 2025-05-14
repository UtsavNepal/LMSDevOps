// component/ui/Skeleton.tsx
import React from "react";

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

export const SkeletonCard: React.FC = () => (
  <div className="bg-white p-4 rounded-lg shadow-md space-y-3">
    <Skeleton className="h-6 w-6 rounded-full" />
    <Skeleton className="h-8 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
  </div>
);

export const SkeletonTableRow: React.FC<{ columns: number }> = ({ columns }) => (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="border border-[#255D81] px-3 py-2">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
  
  export const SkeletonTableHeader: React.FC<{ columns: number }> = ({ columns }) => (
    <tr className="bg-[#6A6A6A] text-white">
      {Array.from({ length: columns }).map((_, i) => (
        <th key={i} className="border border-[#255D81] px-3 py-2 text-left">
          <Skeleton className="h-5 w-3/4" />
        </th>
      ))}
    </tr>
  );