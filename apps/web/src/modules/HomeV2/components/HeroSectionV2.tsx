'use client';

import { Button, Time, Typewriter } from '@sa2kit-ui/react';
import { useTheme } from '@sa2kit-ui/theme-runtime';
import type { HomeConfig } from '../../Home/types';
import { navigateToItem } from '../../Home/utils/navigation';

interface HeroSectionV2Props {
  homeConfig: HomeConfig;
}

export function HeroSectionV2({ homeConfig }: HeroSectionV2Props) {
  const { title, subtitle, buttons, imageSrc } = homeConfig;
  const { theme } = useTheme();
  const eyebrow = theme === 'jieyuan-garden' ? '欢迎入园' : '欢迎登岛';

  return (
    <section id="home" className="home-v2-hero">
      <div className="home-v2-hero__bento">
        <div className="home-v2-hero__cell home-v2-hero__cell--clock">
          <Time />
        </div>

        <div className="home-v2-hero__cell home-v2-hero__cell--copy">
          <span className="home-v2-hero__eyebrow">{eyebrow}</span>
          <h1 className="home-v2-hero__title">
            <Typewriter speed={90}>
              <span>{title}</span>
            </Typewriter>
          </h1>
          <p className="home-v2-hero__subtitle">{subtitle}</p>
        </div>

        <div className="home-v2-hero__cell home-v2-hero__cell--portrait">
          {theme === 'jieyuan-garden' ? (
            <div className="jy-img-tone home-v2-hero__portrait-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageSrc}
                alt="个人形象"
                className="home-v2-hero__portrait"
                loading="eager"
                width={640}
                height={800}
              />
            </div>
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={imageSrc}
              alt="个人形象"
              className="home-v2-hero__portrait"
              loading="eager"
              width={640}
              height={800}
            />
          )}
        </div>

        <div className="home-v2-hero__cell home-v2-hero__cell--actions">
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
    </section>
  );
}
