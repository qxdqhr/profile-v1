'use client';

import React from 'react';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="tw-flex tw-items-center tw-justify-center tw-min-h-screen">
      <div className="tw-bg-red-100 tw-border tw-border-red-400 tw-text-red-700 tw-px-4 tw-py-3 tw-rounded tw-relative" role="alert">
        <strong className="tw-font-bold">错误：</strong>
        <span className="tw-block sm:tw-inline">{message}</span>
      </div>
    </div>
  );
}; 