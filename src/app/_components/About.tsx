import React from "react";

import CollisionBalls from "./CollisionBalls";
import Timeline from "./Timeline";
import { TimelineConfig, CollisionBallsConfig } from "./types";

interface AboutProps {
  timelineConfig: TimelineConfig;
  collisionBallsConfig: CollisionBallsConfig;
}

const About: React.FC<AboutProps> = ({
  timelineConfig,
  collisionBallsConfig,
}) => {
  return (
    <div id="about" className="about-container">
      <div className="module-title h2">关于我</div>
      <div className="about-content">
        <Timeline timelineConfig={timelineConfig} />
        <CollisionBalls collisionBallsConfig={collisionBallsConfig} />
      </div>
    </div>
  );
};

export default About;
