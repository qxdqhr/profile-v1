"use client";

import { type FC, useEffect, useState } from "react";
import styles from "@/app.module.css";
import About from "@/app/_components/About";
import Home from "@/app/_components/Home";
import Navbar from "@/app/_components/Navbar";
import NavbarToggle from "@/app/_components/NavbarToggle";
import ProjectCarousel from "@/app/_components/ProjectCarousel";
import { Config } from "./types";
import Contact from "./Contact";

interface SectionProps {
  id: string;
  title: string;
  children?: React.ReactNode;
}

const Section: FC<SectionProps> = ({ id, title, children }) => (
  <section
    id={id}
    className="tw-min-h-screen tw-flex tw-items-center tw-flex-col"
  >
    <h2>{title}</h2>
    {children}
  </section>
);

type NavDirection = "vertical" | "horizontal";

const MainPage: FC = () => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/homePage');
        if (!response.ok) {
          throw new Error('Failed to fetch config');
        }
        const data = await response.json();
        setConfig(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取配置失败');
        console.error('Error fetching config:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  if (loading) {
    return <div>加载中...</div>; // 可以替换为更好看的加载组件
  }

  if (error || !config) {
    return <div>加载配置失败: {error}</div>; // 可以替换为更好看的错误提示组件
  }

  const isVertical = config.navConfig.direction === "vertical";
  const direction = config.navConfig.direction as NavDirection;

  return (
    <div className="app-container">
      <NavbarToggle isOpen={isNavbarOpen} onClick={() => setIsNavbarOpen(!isNavbarOpen)} />
      <Navbar 
        isOpen={isNavbarOpen} 
        items={config.navConfig.items}
        direction={config.navConfig.direction as "vertical" | "horizontal"}
        avatarSrc={config.navConfig.avatar}
      />
      <main className={`main-content ${isNavbarOpen ? 'navbar-open' : ''}`}>
        <div className="content-wrapper">
          <Home homeConfig={config.homeConfig} />
          <About
            timelineConfig={config.timelineConfig}
            collisionBallsConfig={config.collisionBallsConfig}
          />
          <ProjectCarousel projects={config.projectsConfig.projects} />
          <Contact />
        </div>
      </main>
    </div>
  );
};

export default MainPage;
