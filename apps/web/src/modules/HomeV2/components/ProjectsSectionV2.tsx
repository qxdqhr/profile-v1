'use client';

import { Button, Icon, Tooltip } from '@sa2kit-ui/react';
import type { ProjectItem } from '../../Home/types';

interface ProjectsSectionV2Props {
  projects: ProjectItem[];
}

export function ProjectsSectionV2({ projects }: ProjectsSectionV2Props) {
  if (projects.length === 0) {
    return null;
  }

  const openProject = (link?: string) => {
    if (!link) return;
    window.open(link, '_blank', 'noopener');
  };

  return (
    <section id="projects" className="home-v2-section">
      <header className="home-v2-section__header">
        <h2 className="home-v2-section__title">项目展示</h2>
        <p className="home-v2-section__desc">
          Bento Grid 一览全部作品，首项突出展示
        </p>
      </header>

      <div className="home-v2-projects__grid">
        {projects.map((project) => {
          const isClickable = Boolean(project.link);
          return (
            <article
              key={project.id}
              className={`home-v2-card home-v2-project ${isClickable ? 'is-clickable' : ''}`}
              onClick={() => openProject(project.link)}
              onKeyDown={(event) => {
                if (!isClickable) return;
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  openProject(project.link);
                }
              }}
              role={isClickable ? 'link' : undefined}
              tabIndex={isClickable ? 0 : undefined}
            >
              <div className="home-v2-project__head">
                <Tooltip title="精选项目" placement="top">
                  <span>
                    <Icon name="icon-design" size={24} bounce={false} />
                  </span>
                </Tooltip>
                <h3 className="home-v2-project__title">{project.title}</h3>
              </div>

              <p className="home-v2-project__desc">{project.description}</p>

              <div className="home-v2-project__tags">
                {project.tags.map((tag) => (
                  <span key={tag} className="home-v2-project__tag">
                    #{tag}
                  </span>
                ))}
              </div>

              {project.link ? (
                <div className="home-v2-project__cta">
                  <Button
                    type="primary"
                    onClick={(event) => {
                      event.stopPropagation();
                      openProject(project.link);
                    }}
                  >
                    查看项目
                  </Button>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
