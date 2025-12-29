import React, { useCallback, useRef } from 'react';

interface ControlPanelProps {
    onDirectionPress: (direction: 'up' | 'down' | 'left' | 'right') => void;
}

const REPEAT_DELAY = 100; // 连续输入的间隔时间（毫秒）
const INITIAL_DELAY = 200; // 开始连续输入前的延迟（毫秒）

const ArrowIcon = ({ direction }: { direction: 'up' | 'down' | 'left' | 'right' }) => {
  const getPath = () => {
    switch (direction) {
    case 'up':
      return 'M7 11L12 6L17 11M7 17L12 12L17 17';
    case 'down':
      return 'M7 7L12 12L17 7M7 13L12 18L17 13';
    case 'left':
      return 'M11 7L6 12L11 17M17 7L12 12L17 17';
    case 'right':
      return 'M7 7L12 12L7 17M13 7L18 12L13 17';
    }
  };

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={getPath()} />
    </svg>
  );
};

export const ControlPanel: React.FC<ControlPanelProps> = ({ onDirectionPress }) => {
  const intervalRef = useRef<number | undefined>(undefined);
  const timeoutRef = useRef<number | undefined>(undefined);

  const startRepeating = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    // 立即触发一次
    onDirectionPress(direction);

    // 设置初始延迟
    timeoutRef.current = window.setTimeout(() => {
      // 开始连续触发
      intervalRef.current = window.setInterval(() => {
        onDirectionPress(direction);
      }, REPEAT_DELAY);
    }, INITIAL_DELAY);
  }, [onDirectionPress]);

  const stopRepeating = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  const handleTouchStart = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    startRepeating(direction);
  }, [startRepeating]);

  const handleTouchEnd = useCallback(() => {
    stopRepeating();
  }, [stopRepeating]);

  return (
    <div className="control-panel">
      {/* 上方按钮 */}
      <button
        className="control-btn up-btn"
        onTouchStart={() => handleTouchStart('up')}
        onTouchEnd={handleTouchEnd}
        onMouseDown={() => handleTouchStart('up')}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
      >
        <ArrowIcon direction="up" />
      </button>
            
      {/* 中间行按钮组 */}
      <div className="horizontal-controls">
        <button
          className="control-btn left-btn"
          onTouchStart={() => handleTouchStart('left')}
          onTouchEnd={handleTouchEnd}
          onMouseDown={() => handleTouchStart('left')}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
        >
          <ArrowIcon direction="left" />
        </button>
        <button
          className="control-btn right-btn"
          onTouchStart={() => handleTouchStart('right')}
          onTouchEnd={handleTouchEnd}
          onMouseDown={() => handleTouchStart('right')}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
        >
          <ArrowIcon direction="right" />
        </button>
      </div>
            
      {/* 下方按钮 */}
      <button
        className="control-btn down-btn"
        onTouchStart={() => handleTouchStart('down')}
        onTouchEnd={handleTouchEnd}
        onMouseDown={() => handleTouchStart('down')}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
      >
        <ArrowIcon direction="down" />
      </button>
    </div>
  );
}; 