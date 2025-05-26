import React from 'react';

/**
 * A simple loading spinner component using Tailwind CSS.
 */
const Loading: React.FC = () => (
  <div className="flex justify-center items-center">
    <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-gray-800" />
  </div>
);

export default Loading;