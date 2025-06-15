'use client';

import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="tw-flex tw-items-center tw-justify-center tw-min-h-screen">
      <div className="tw-animate-spin tw-rounded-full tw-h-12 tw-w-12 tw-border-t-2 tw-border-b-2 tw-border-blue-500"></div>
    </div>
  );
}; 