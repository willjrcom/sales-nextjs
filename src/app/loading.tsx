"use client";

import Loading from '@/app/components/loading/Loading';

/**
 * Global loading UI shown during route transitions and data fetching.
 */
export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <Loading />
    </div>
  );
}