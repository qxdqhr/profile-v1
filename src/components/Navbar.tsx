'use client';

import React, { useEffect, useRef, useState } from "react";

import Avatar from "./Avatar";
import NavbarToggle from "./NavbarToggle";
import { NavItem } from '@/components/Home/types';

interface NavbarProps {
  direction?: "horizontal" | "vertical";
  items: NavItem[];
  isOpen?: boolean;
  avatarSrc?: string;
  //导航栏按钮
  isVertical?: boolean;
  onToggle?: () => void;
}

const NavbarItem: React.FC<{
  item: NavItem;
  direction: "horizontal" | "vertical";
}> = ({ item, direction }) => {
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute("href");
    
    // 如果是/开头的路由,直接跳转
    if (href?.startsWith("/")) {
      window.location.href = href;
      return;
    }
    else if (href?.startsWith("#")) {
      // 否则滚动到对应id的元素位置
      const element = document.getElementById(id);
      if (element) {
        const navbarHeight = direction === "horizontal"  ?
          (document.querySelector(".navbar") as HTMLElement)?.offsetHeight || 0 : 0;
        const offsetTop = element.offsetTop - navbarHeight;

        window.scrollTo({
          top: offsetTop,
          behavior: "smooth",
        });
      }
    }
    //未配置的跳转
    else {
      console.log("未配置的跳转");
    }
  };

  return (
    <li className="relative group">
      <div className="flex items-center">
        <a 
          href={item.href} 
          onClick={(e) => handleClick(e, item.id)}
          className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
        >
          {item.label}
        </a>
        {item.children && (
          <button
            type="button"
            className={`transform transition-transform duration-200 ${isSubMenuOpen ? 'rotate-180' : ''}`}
            onClick={() => setIsSubMenuOpen(!isSubMenuOpen)}
            aria-label={isSubMenuOpen ? "收起子菜单" : "展开子菜单"}
          >
            ▼
          </button>
        )}
      </div>
      {item.children && (
        <ul className={`absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 transform transition-all duration-200 ${
          isSubMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}>
          {item.children.map((child) => (
            <li key={child.id}>
              <a 
                href={child.href} 
                onClick={(e) => handleClick(e, child.id)}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-600"
              >
                {child.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

const Navbar: React.FC<NavbarProps> = ({
  direction = "horizontal",
  items,
  isOpen = true,
  avatarSrc,
  isVertical,
  onToggle,
}) => {
  const navbarRef = useRef<HTMLDivElement>(null);

  return (
    <nav
      ref={navbarRef}
      className={`fixed top-0 z-50 transition-all duration-500 ease-in-out ${
        direction === "vertical"
          ? `left-0 h-full w-64 bg-white shadow-lg ${
              isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
            }`
          : `left-0 right-0 h-16 bg-white shadow-md ${
              isOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
            }`
      }`}
    >
      <div
        className={`h-full ${
          direction === "vertical" ? 'flex flex-col' : 'flex items-center justify-between px-4'
        }`}
      >
        {/* Logo */}
        <div className={`flex items-center ${direction === "vertical" ? 'p-4' : ''}`}>
          <img
            src="/logo.png"
            alt="Logo"
            className="h-8 w-auto"
          />
        </div>

        {/* 导航链接 */}
        <div
          className={`flex ${
            direction === "vertical"
              ? 'flex-col flex-1 overflow-y-auto'
              : 'items-center space-x-4'
          }`}
        >
          {items.map((item) => (
            <NavbarItem key={item.id} item={item} direction={direction} />
          ))}
        </div>

        {/* 用户头像 */}
        <div className={`flex items-center ${direction === "vertical" ? 'p-4 mt-auto' : ''}`}>
          <Avatar src={avatarSrc} />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
