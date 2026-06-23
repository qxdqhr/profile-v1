'use client';

import { Collapse } from '@sa2kit-ui/react';
import { CollisionBalls } from 'sa2kit/common/components';
import type { CollisionBallsConfig, TimelineConfig } from 'sa2kit/common/components';

type TimelineEntry = TimelineConfig['items'][number] & {
  id?: string;
  tags?: string[];
};

interface AboutSectionV2Props {
  timelineConfig: TimelineConfig;
  collisionBallsConfig: CollisionBallsConfig;
}

export function AboutSectionV2({
  timelineConfig,
  collisionBallsConfig,
}: AboutSectionV2Props) {
  return (
    <section id="about" className="home-v2-section">
      <header className="home-v2-section__header">
        <h2 className="home-v2-section__title">关于我</h2>
        <p className="home-v2-section__desc">
          个人经历与技能互动 — Storytelling 叙事式布局
        </p>
      </header>

      <div className="home-v2-about__bento">
        <article className="home-v2-card">
          <h3 className="home-v2-card__title">个人经历</h3>
          <div className="home-v2-about__timeline">
            {(timelineConfig.items as TimelineEntry[]).map((item, index) => (
              <Collapse
                key={item.id ?? `${item.date}-${index}`}
                defaultExpanded={index === 0}
                question={
                  <span>
                    <time className="home-v2-about__date">{item.date}</time>{' '}
                    {item.title}
                  </span>
                }
                answer={
                  <div>
                    <p>{item.description}</p>
                    {item.tags?.length ? (
                      <div className="home-v2-about__tags">
                        {item.tags.map((tag) => (
                          <span key={tag} className="home-v2-about__tag">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                }
              />
            ))}
          </div>
        </article>

        <article className="home-v2-card home-v2-card--skills">
          <h3 className="home-v2-card__title">技能展示</h3>
          <p className="home-v2-about__hint">
            拖动小球互动，或使用组件内按钮调速
          </p>
          <div className="home-v2-about__balls">
            <CollisionBalls collisionBallsConfig={collisionBallsConfig} />
          </div>
        </article>
      </div>
    </section>
  );
}
