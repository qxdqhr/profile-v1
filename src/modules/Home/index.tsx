'use client';

import React, { useEffect, useState } from "react";
import About from "@/components/About";
import HomeSection from "@/components/Home/Home";
import Navbar from "@/components/Navbar";
import NavbarToggle from "@/components/NavbarToggle";
import ProjectCarousel from "@/components/ProjectCarousel";
import { Config } from "@/components/Home/types";
import Contact from "@/components/Contact";
import "@/components/app.css";

interface SectionProps {
  id: string;
  title: string;
  children?: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ id, title, children }) => (
  <section
    id={id}
    className="min-h-screen flex items-center flex-col py-16"
  >
    <h2 className="text-3xl font-bold mb-12">{title}</h2>
    {children}
  </section>
);

type NavDirection = "vertical" | "horizontal";

const HomePage: React.FC = () => {
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        加载配置失败: {error}
      </div>
    );
  }

  const isVertical = config.navConfig.direction === "vertical";
  const direction = config.navConfig.direction as NavDirection;

  return (
    <div className="relative min-h-screen bg-white flex">
      {/* 左侧：导航栏及其切换按钮 */}
      <div className={`transition-all duration-500 ease-in-out h-full ${
        isVertical
          ? isNavbarOpen ? 'w-64' : 'w-0'
          : isNavbarOpen ? 'h-16' : 'h-0'
      }`}>
        <NavbarToggle 
          isOpen={isNavbarOpen} 
          onClick={() => setIsNavbarOpen(!isNavbarOpen)} 
        />
        <Navbar 
          isOpen={isNavbarOpen} 
          items={config.navConfig.items}
          direction={direction}
          avatarSrc={config.navConfig.avatar}
        />
      </div>
      {/* 右侧：内容区 */}
      <div className="flex-1 transition-all duration-500 ease-in-out">
        <main className="w-full">
          <div className="container mx-auto px-4">
            <HomeSection homeConfig={config.homeConfig} />
            <About
              timelineConfig={config.timelineConfig}
              collisionBallsConfig={config.collisionBallsConfig}
            />
            <ProjectCarousel projects={config.projectsConfig.projects} />
            <Contact />
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomePage; 