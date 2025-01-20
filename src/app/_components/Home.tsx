"use client";

import React, { useEffect, useState } from "react";
import { HomeConfig } from "./types";
interface HomeProps {
  homeConfig: HomeConfig;
}


const Home: React.FC<HomeProps> = ({ homeConfig }) => {
  const { title, subtitle, buttons, imageSrc } = homeConfig;
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < title.length) {
      const timer = setTimeout(() => {
        setDisplayText((prev) => prev + title[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 150); // 打字速度，可调整

      return () => clearTimeout(timer);
    }
    return () => {
      setDisplayText("");
      setCurrentIndex(0);
    };
  }, [currentIndex, title]);

  return (
    <section id="home" className="home">
      <div className="home__content">
        <div className="home__text">
          <h1 className="home__title">
            <span className="typing-text">{displayText}</span>
            <span className="cursor">|</span>
          </h1>
          <p className="home__subtitle">{subtitle}</p>
          <div className="home__buttons">
            {buttons.map((button) => (
              <a key={button.link} href={button.link} className="home__button">
                {button.text}
              </a>
            ))}
          </div>
        </div>
        <div className="home__image">
          <img src={imageSrc} alt="Profile" />
        </div>
      </div>
    </section>
  );
};

export default Home;
