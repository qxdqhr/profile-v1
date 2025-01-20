import React from "react";

interface NavbarToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

const NavbarToggle: React.FC<NavbarToggleProps> = ({ isOpen, onToggle }) => {
  return (
    <button
      type="button"
      className="navbar-toggle"
      onClick={onToggle}
      aria-label={isOpen ? "收起菜单" : "展开菜单"}
    >
      {isOpen ? "←" : "→"}
    </button>
  );
};

export default NavbarToggle;
