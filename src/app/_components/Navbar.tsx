import React, { useEffect, useRef, useState } from "react";

import Avatar from "./Avatar";
import NavbarToggle from "./NavbarToggle";

interface NavItem {
  id: string;
  label: string;
  href: string;
  children?: NavItem[];
  direction?: "horizontal" | "vertical";
}

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
    <li className="navbar__item">
      <div className="navbar__item-content">
        <a href={item.href} onClick={(e) => handleClick(e, item.id)}>
          {item.label}
        </a>
        {item.children && (
          <button
            type="button"
            className={`submenu-toggle ${isSubMenuOpen ? "open" : ""}`}
            onClick={() => setIsSubMenuOpen(!isSubMenuOpen)}
            aria-label={isSubMenuOpen ? "收起子菜单" : "展开子菜单"}
          >
            ▼
          </button>
        )}
      </div>
      {item.children && (
        <ul className={`navbar__submenu ${isSubMenuOpen ? "open" : ""}`}>
          {item.children.map((child) => (
            <li key={child.id} className="navbar__item">
              <a href={child.href} onClick={(e) => handleClick(e, child.id)}>
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
  isOpen,
  avatarSrc,
  isVertical,
  onToggle,
}) => {
  const navbarRef = useRef<HTMLDivElement>(null);
  const [navbarWidth, setNavbarWidth] = useState<number>(0);

  return (
    <nav
      ref={navbarRef}
      className={`navbar ${direction} ${isOpen ? "open" : "closed"}`}
    >
      <Avatar
        src={avatarSrc || "/images/avatar.jpg"}
        size="small"
        mood="online"
        statusText="开心每一天"
        onClick={() => console.log("Avatar clicked")}
      />
      <ul className={`navbar__menu ${direction}`}>
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
      <div>当前导航栏宽度: {navbarWidth}px</div>
    </nav>
  );
};

export default Navbar;
