'use client';

import React from 'react';

interface NavbarToggleProps {
  isOpen: boolean;
  onClick: () => void;
}

const NavbarToggle: React.FC<NavbarToggleProps> = ({ isOpen, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed top-4 left-4 z-60 p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
    >
      <span className="sr-only">打开菜单</span>
      {/* 汉堡菜单图标 */}
      <div className="w-6 h-6 flex flex-col justify-center items-center">
        <span
          className={`block w-6 h-0.5 bg-current transform transition duration-300 ease-in-out ${
            isOpen ? 'rotate-45 translate-y-1.5' : ''
          }`}
        />
        <span
          className={`block w-6 h-0.5 bg-current transform transition duration-300 ease-in-out mt-1.5 ${
            isOpen ? 'opacity-0' : ''
          }`}
        />
        <span
          className={`block w-6 h-0.5 bg-current transform transition duration-300 ease-in-out mt-1.5 ${
            isOpen ? '-rotate-45 -translate-y-1.5' : ''
          }`}
        />
      </div>
    </button>
  );
};

export default NavbarToggle;
