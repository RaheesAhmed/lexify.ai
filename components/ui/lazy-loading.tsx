"use client";

import { Suspense } from "react";
import { LoadingSpinner } from "./loading-spinner";

interface LazyLoadingProps {
  children: React.ReactNode;
}

export function LazyLoading({ children }: LazyLoadingProps) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8">
          <LoadingSpinner size="md" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
