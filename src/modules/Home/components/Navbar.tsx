'use client';

import React, { useEffect, useRef, useState } from "react";
import { NavItem } from "../types";
import { Avatar } from "./Avatar";
import { NavbarToggle } from "./NavbarToggle";

interface NavbarProps {
  direction: "horizontal" | "vertical";
  items: NavItem[];
  isOpen?: boolean;
  avatarSrc?: string;
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
    
    if (href?.startsWith("/")) {
      window.location.href = href;
      return;
    }
    else if (href?.startsWith("#")) {
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
    else {
      console.log("未配置的跳转");
    }
  };

  return (
    <li className="tw-relative tw-group">
      <div className="tw-flex tw-items-center tw-justify-between">
        <a 
          href={item.href} 
          onClick={(e) => handleClick(e, item.id)}
          className="tw-px-4 tw-py-2 tw-text-gray-700 hover:tw-text-blue-600 tw-transition-colors"
        >
          {item.label}
        </a>
        {item.children && (
          <button
            type="button"
            className={`tw-transform tw-transition-transform ${isSubMenuOpen ? "tw-rotate-180" : ""}`}
            onClick={() => setIsSubMenuOpen(!isSubMenuOpen)}
            aria-label={isSubMenuOpen ? "收起子菜单" : "展开子菜单"}
          >
            ▼
          </button>
        )}
      </div>
      {item.children && (
        <ul className={`tw-absolute tw-left-0 tw-mt-1 tw-w-48 tw-bg-white tw-rounded-md tw-shadow-lg tw-overflow-hidden tw-transition-all tw-duration-200 ${isSubMenuOpen ? "tw-opacity-100 tw-visible" : "tw-opacity-0 tw-invisible"}`}>
          {item.children.map((child) => (
            <li key={child.id}>
              <a 
                href={child.href} 
                onClick={(e) => handleClick(e, child.id)}
                className="tw-block tw-px-4 tw-py-2 tw-text-gray-700 hover:tw-bg-gray-100"
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

export const Navbar: React.FC<NavbarProps> = ({
  direction = "horizontal",
  items,
  isOpen,
  avatarSrc,
  isVertical,
  onToggle,
}) => {
  const navbarRef = useRef<HTMLDivElement>(null);
  const [navbarWidth, setNavbarWidth] = useState<number>(0);

  useEffect(() => {
    if (navbarRef.current) {
      setNavbarWidth(navbarRef.current.offsetWidth);
    }
  }, [isOpen]);

  return (
    <nav
      ref={navbarRef}
      className={`tw-fixed tw-top-0 tw-left-0 tw-h-full tw-bg-white tw-shadow-lg tw-transition-all tw-duration-300 tw-ease-in-out ${
        direction === "vertical" 
          ? `tw-w-64 ${isOpen ? "tw-translate-x-0" : "-tw-translate-x-full"}`
          : "tw-w-full tw-h-16"
      }`}
    >
      <div className="tw-p-4">
        <Avatar
          src={avatarSrc || "/images/avatar.jpg"}
          size="small"
          mood="online"
          statusText="开心每一天"
          onClick={() => console.log("Avatar clicked")}
        />
      </div>
      <ul className={`tw-flex tw-flex-col tw-space-y-2 tw-p-4 ${
        direction === "horizontal" ? "tw-flex-row tw-space-x-4 tw-space-y-0" : ""
      }`}>
        {items.map((item) => (
          <NavbarItem key={item.id} item={item} direction={direction} />
        ))}
      </ul>
      {isVertical && (
        <NavbarToggle 
          isOpen={isOpen || false} 
          onClick={onToggle || (() => {})} 
        />
      )}
    </nav>
  );
}; 