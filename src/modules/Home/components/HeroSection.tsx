'use client';

import { Button, Card, Time, Title, Typewriter } from 'animal-island-ui';
import type { HomeConfig } from '../types';
import { navigateToItem } from '../utils/navigation';

interface HeroSectionProps {
  homeConfig: HomeConfig;
}

export function HeroSection({ homeConfig }: HeroSectionProps) {
  const { title, subtitle, buttons, imageSrc } = homeConfig;

  return (
    <section id="home" className="home-hero">
      <div className="home-hero__clock">
        <Time />
      </div>

      <div className="home-hero__grid">
        <div className="home-hero__copy">
          <Title size="large" color="app-teal" className="home-hero__ribbon">
            欢迎登岛
          </Title>

          <h1 className="home-hero__title">
            <Typewriter speed={90}>
              <span>{title}</span>
            </Typewriter>
          </h1>

          <p className="home-hero__subtitle">{subtitle}</p>

          <div className="home-hero__actions">
            {buttons.map((button) => (
              <Button
                key={button.link}
                type="primary"
                size="large"
                onClick={() =>
                  navigateToItem({
                    id: button.link.replace('#', ''),
                    label: button.text,
                    href: button.link,
                  })
                }
              >
                {button.text}
              </Button>
            ))}
          </div>
        </div>

        <Card pattern="app-pink" className="home-hero__portrait-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt="个人形象"
            className="home-hero__portrait"
          />
        </Card>
      </div>
    </section>
  );
}
