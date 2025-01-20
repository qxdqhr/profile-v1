import React, { useState } from "react";

interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  link?: string;
}

interface ProjectCarouselProps {
  projects: Project[];
}

const ProjectCarousel: React.FC<ProjectCarouselProps> = ({ projects }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextSlide = () => {
    setActiveIndex((current) => (current + 1) % projects.length);
  };

  const prevSlide = () => {
    setActiveIndex(
      (current) => (current - 1 + projects.length) % projects.length,
    );
  };

  const getCardStyle = (index: number) => {
    const diff = (index - activeIndex + projects.length) % projects.length;
    const position = diff > projects.length / 2 ? diff - projects.length : diff;

    return {
      transform: `
        translateX(${position * -50}%) 
        scale(${1 - Math.abs(position) * 0.2}) 
        translateZ(${-Math.abs(position) * 50}px)
      `,
      zIndex: projects.length - Math.abs(position),
      opacity: 1 - Math.abs(position) * 0.3,
    };
  };

  return (
    <div className="project-carousel">
      <div className="module-title h2">项目展示</div>
      <div className="carousel-container">
        <button className="nav-button prev" onClick={prevSlide}>
          &#10094;
        </button>
        <div className="cards-container">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className={`project-card ${index === activeIndex ? "active" : ""}`}
              style={getCardStyle(index)}
            >
              <div className="card-image">
                <img src={project.image} alt={project.title} />
              </div>
              <div className="card-content">
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="tags">
                  {project.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    查看项目
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
        <button className="nav-button next" onClick={nextSlide}>
          &#10095;
        </button>
      </div>
    </div>
  );
};

export default ProjectCarousel;
