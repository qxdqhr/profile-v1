'use client';

import { Button, Time, Typewriter, useTheme } from '@sa2kit-ui/react';
import type { HomeConfig } from '../../Home/types';
import { navigateToItem } from '../../Home/utils/navigation';

interface HeroSectionV2Props {
  homeConfig: HomeConfig;
}

export function HeroSectionV2({ homeConfig }: HeroSectionV2Props) {
  const { title, subtitle, buttons, imageSrc } = homeConfig;
  const { theme } = useTheme();
  const eyebrow =
    theme === 'jieyuan-garden'
      ? '欢迎入园'
      : theme === 'rhine-life'
        ? '欢迎接入终端'
        : theme === 'endfield'
          ? '管理员终端已连接'
          : theme === 'mizuki-roguelike'
            ? '大群的呼唤 · 深蓝之树'
            : theme === 'sami-roguelike'
              ? '银凇止境 · 密文宣告'
              : '欢迎登岛';

  const ornamentClass: Partial<Record<string, string>> = {
    'jieyuan-garden': 'jy-ornament',
    'rhine-life': 'rl-ornament',
    endfield: 'ef-ornament',
    'mizuki-roguelike': 'mr-ornament',
    'sami-roguelike': 'sr-ornament',
  };

  return (
    <section id="home" className="home-v2-hero">
      <div className="home-v2-hero__bento">
        <div className="home-v2-hero__cell home-v2-hero__cell--clock">
          <Time />
        </div>

        <div
          className={`home-v2-hero__cell home-v2-hero__cell--copy ${ornamentClass[theme] ?? ''}`}
        >
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
          ) : theme === 'rhine-life' ? (
            <div className="rl-img-tone home-v2-hero__portrait-wrap">
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
          ) : theme === 'endfield' ? (
            <div className="ef-img-tone home-v2-hero__portrait-wrap">
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
          ) : theme === 'mizuki-roguelike' ? (
            <div className="mr-img-tone home-v2-hero__portrait-wrap">
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
          ) : theme === 'sami-roguelike' ? (
            <div className="sr-img-tone home-v2-hero__portrait-wrap">
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
