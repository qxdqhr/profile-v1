import React from 'react';
import { twMerge } from 'tailwind-merge';
import '@/app/testField/VocaloidtoGO/styles/components/common/progress-bar.css';

interface ProgressBarProps {
    progress: number;  // 0 到 100 之间的数值
    height?: number;   // 高度（像素）
    showLabel?: boolean;
    className?: string;
    onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    progress,
    height = 4,
    showLabel = false,
    className = '',
    onClick
}) => {
    // 确保进度值在 0-100 之间
    const normalizedProgress = Math.min(100, Math.max(0, progress));

    return (
        <div className={twMerge('progress-container', className)} onClick={onClick}>
            <div 
                className="progress-track"
                style={{ height: `${height}px` }}
            >
                <div
                    className="progress-bar"
                    style={{
                        width: `${normalizedProgress}%`,
                        height: '100%'
                    }}
                />
            </div>
            {showLabel && (
                <div className="progress-label">
                    {Math.round(normalizedProgress)}%
                </div>
            )}
        </div>
    );
}; 