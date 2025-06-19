"use client";

import Loading from '@/app/components/loading/Loading';

export default function NewOrderLoading() {
  return (
    <div className="flex items-center justify-center h-full w-full bg-gray-100">
      <Loading />
    </div>
  );
}