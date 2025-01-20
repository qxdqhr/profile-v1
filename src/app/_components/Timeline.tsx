import React from "react";
import { TimelineConfig, TimelineItemInterface, TimelineInterface } from "./types";



interface TimelineProps {
  timelineConfig: TimelineConfig;
}

const TimelineContent: React.FC<{ item: TimelineItemInterface }> = ({
  item,
}) => (
  <div className="timeline__content">
    <div className="timeline__dot" />
    {item.title && <h3 className="timeline__title">{item.title}</h3>}
    {item.description && (
      <p className="timeline__description">{item.description}</p>
    )}
    {item.tags && (
      <div className="timeline__tags">
        {item.tags.map((tag) => (
          <span key={`${item.date}-${tag}`} className="timeline__tag">
            {tag}
          </span>
        ))}
      </div>
    )}
  </div>
);

const TimelineItem: React.FC<{ item: TimelineItemInterface }> = ({ item }) => (
  <div
    className={`timeline__item ${!item.title && !item.description ? "date-only" : ""}`}
  >
    <div className="timeline__date">{item.date}</div>
    {(item.title || item.description) && <TimelineContent item={item} />}
  </div>
);

const SingleTimeline: React.FC<{ timeline: TimelineInterface }> = ({
  timeline,
}) => (
  <div
    className={`timeline ${timeline.direction === "horizontal" ? "horizontal" : "vertical"}`}
  >
    {timeline.items.map((item) => (
      <TimelineItem
        key={`${item.date}-${item.title || "no-title"}`}
        item={item}
      />
    ))}
  </div>
);

const Timeline: React.FC<TimelineProps> = ({ timelineConfig }) => (
  <div className="timelines">
    {timelineConfig.timelines.map((timeline, index) => (
      <SingleTimeline
        key={`timeline-${index}-${timeline.direction || "vertical"}`}
        timeline={timeline}
      />
    ))}
  </div>
);

export default Timeline;
