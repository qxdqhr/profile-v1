'use client';

import { useState } from 'react';
import {
  Button,
  Card,
  Divider,
  Icon,
  Title,
  Tooltip,
} from 'animal-island-ui';
import type { ProjectItem } from '../types';

interface ProjectsSectionProps {
  projects: ProjectItem[];
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (projects.length === 0) {
    return null;
  }

  const current = projects[currentIndex];

  const goPrev = () => {
    setCurrentIndex((index) =>
      index === 0 ? projects.length - 1 : index - 1,
    );
  };

  const goNext = () => {
    setCurrentIndex((index) =>
      index === projects.length - 1 ? 0 : index + 1,
    );
  };

  return (
    <section id="projects" className="home-section">
      <div className="home-section__heading">
        <Title size="middle" color="app-yellow">
          项目展示
        </Title>
      </div>

      <Divider type="line-teal" />

      <div className="home-projects">
        <Button
          type="default"
          className="home-projects__arrow home-projects__arrow--left"
          onClick={goPrev}
          aria-label="上一个项目"
        >
          ‹
        </Button>

        <Card pattern="app-orange" className="home-projects__card">
          <div className="home-projects__card-head">
            <Tooltip title="精选项目" placement="top">
              <span className="home-projects__icon-wrap">
                <Icon name="icon-design" size={28} bounce />
              </span>
            </Tooltip>
            <h3 className="home-projects__title">{current.title}</h3>
          </div>

          <p className="home-projects__description">{current.description}</p>

          <div className="home-projects__tags">
            {current.tags.map((tag) => (
              <span key={tag} className="home-projects__tag">
                #{tag}
              </span>
            ))}
          </div>

          {current.link ? (
            <div className="home-projects__actions">
              <Button
                type="primary"
                onClick={() => window.open(current.link, '_blank', 'noopener')}
              >
                查看项目
              </Button>
            </div>
          ) : null}
        </Card>

        <Button
          type="default"
          className="home-projects__arrow home-projects__arrow--right"
          onClick={goNext}
          aria-label="下一个项目"
        >
          ›
        </Button>
      </div>

      <div className="home-projects__dots" role="tablist" aria-label="项目切换">
        {projects.map((project, index) => (
          <button
            key={project.id}
            type="button"
            role="tab"
            aria-selected={index === currentIndex}
            aria-label={`项目 ${index + 1}`}
            className={`home-projects__dot ${
              index === currentIndex ? 'is-active' : ''
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </section>
  );
}
