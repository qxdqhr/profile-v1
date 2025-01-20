"use client";

import { type FC, useEffect, useState } from "react";
import styles from "@/app.module.css";
import About from "@/app/_components/About";
import Home from "@/app/_components/Home";
import Navbar from "@/app/_components/Navbar";
import NavbarToggle from "@/app/_components/NavbarToggle";
import ProjectCarousel from "@/app/_components/ProjectCarousel";
import { Config } from "./types";

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
  const [isOpen, setIsOpen] = useState(true);
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
    <div className={styles.app}>
      {isVertical && (
        <NavbarToggle isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />
      )}
      <div
        className={`main-container ${isOpen ? "open" : "closed"} ${
          isVertical ? "vertical" : "horizontal"
        }`}
      >
        <Navbar
          direction={direction}
          items={config.navConfig.items}
          isOpen={isOpen}
          avatarSrc={config.navConfig.avatar}
        />
        <div className="content-wrapper">
          <Home homeConfig={config.homeConfig} />
          <About
            timelineConfig={config.timelineConfig}
            collisionBallsConfig={config.collisionBallsConfig}
          />
          <ProjectCarousel projects={config.projectsConfig.projects} />
          <Section id="contact" title="联系方式">
            <p>这是我的联系方式...</p>
          </Section>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
