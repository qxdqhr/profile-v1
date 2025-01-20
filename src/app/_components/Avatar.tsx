import React from "react";
export type MoodStatus = "online" | "offline" | "busy" | "away";

interface AvatarProps {
  src: string;
  alt?: string;
  size?: "small" | "medium" | "large";
  mood?: MoodStatus;
  statusText?: string;
  onClick?: () => void;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "avatar",
  size = "small",
  mood = "online",
  statusText = "在线",
  onClick,
}) => {
  const moodColors = {
    online: "#44b549",
    offline: "#8d8d8d",
    busy: "#e64340",
    away: "#faad14",
  };

  return (
    <div className={`avatar-container ${size}`} onClick={onClick}>
      <div className="avatar-wrapper">
        <img src={src} alt={alt} className="avatar-image" />
        <span
          className="avatar-status"
          style={{ backgroundColor: moodColors[mood] }}
        />
      </div>
      {statusText && <div className="avatar-status-text">{statusText}</div>}
    </div>
  );
};

export default Avatar;
