import React from 'react';

interface MikutapButtonProps {
  onClick: () => void | Promise<void>;
  onTouchAction?: () => void | Promise<void>;
  icon: string;
  text?: string;
  className?: string;
  title?: string;
  touchHandled: boolean;
  setTouchHandled: (value: boolean) => void;
}

const MikutapButton: React.FC<MikutapButtonProps> = ({
  onClick,
  onTouchAction,
  icon,
  text,
  className = '',
  title,
  touchHandled,
  setTouchHandled
}) => {
  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (touchHandled) {
      setTouchHandled(false);
      return;
    }
    await onClick();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setTouchHandled(true);
  };

  const handleTouchEnd = async (e: React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onTouchAction) {
      await onTouchAction();
    } else {
      await onClick();
    }
    setTimeout(() => setTouchHandled(false), 100);
  };

  return (
    <button
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 mobile-button pointer-events-auto ${className}`}
      title={title}
    >
      <span>{icon}</span>
      {text && <span className="hidden md:inline">{text}</span>}
    </button>
  );
};

export default MikutapButton; 