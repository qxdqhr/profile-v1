import React from "react";

interface NavbarToggleProps {
  isOpen: boolean;
  onClick: () => void;
}

const NavbarToggle: React.FC<NavbarToggleProps> = ({ isOpen, onClick }) => {
  return (
    <button 
      className={`navbar-toggle ${isOpen ? 'open' : ''}`}
      onClick={onClick}
      aria-label={isOpen ? "关闭导航栏" : "打开导航栏"}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ transform: `rotate(${isOpen ? 180 : 0}deg)`, transition: 'transform 0.3s ease' }}
      >
        {isOpen ? (
          <path
            d="M13 4L8 10L13 16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M7 4L12 10L7 16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </button>
  );
};

export default NavbarToggle;
