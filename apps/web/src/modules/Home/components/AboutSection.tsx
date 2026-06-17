'use client';

import { Card, Collapse, Divider, Title } from 'animal-island-ui';
import { CollisionBalls } from 'sa2kit/common/components';
import type { CollisionBallsConfig, TimelineConfig } from 'sa2kit/common/components';

type TimelineEntry = TimelineConfig['items'][number] & {
  id?: string;
  tags?: string[];
};

interface AboutSectionProps {
  timelineConfig: TimelineConfig;
  collisionBallsConfig: CollisionBallsConfig;
}

export function AboutSection({
  timelineConfig,
  collisionBallsConfig,
}: AboutSectionProps) {
  return (
    <section id="about" className="home-section">
      <div className="home-section__heading">
        <Title size="middle" color="app-green">
          关于我
        </Title>
      </div>

      <Divider type="wave-yellow" />

      <div className="home-about__grid">
        <Card pattern="app-blue" className="home-about__panel">
          <h3 className="home-about__panel-title">个人经历</h3>
          <div className="home-about__timeline">
            {(timelineConfig.items as TimelineEntry[]).map((item, index) => (
              <Collapse
                key={item.id ?? `${item.date}-${index}`}
                defaultExpanded={index === 0}
                question={
                  <span className="home-about__question">
                    <time className="home-about__date">{item.date}</time>
                    <span>{item.title}</span>
                  </span>
                }
                answer={
                  <div className="home-about__answer">
                    <p>{item.description}</p>
                    {item.tags?.length ? (
                      <div className="home-about__tags">
                        {item.tags.map((tag) => (
                          <span key={tag} className="home-about__tag">
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
        </Card>

        <Card pattern="app-teal" className="home-about__panel">
          <h3 className="home-about__panel-title">技能展示</h3>
          <p className="home-about__balls-hint">
            拖动小球互动，或使用组件内按钮调速
          </p>
          <div className="home-about__balls">
            <CollisionBalls collisionBallsConfig={collisionBallsConfig} />
          </div>
        </Card>
      </div>
    </section>
  );
}
