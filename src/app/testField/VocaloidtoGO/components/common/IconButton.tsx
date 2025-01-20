import React from 'react';
import { twMerge } from 'tailwind-merge';
import '@/app/testField/VocaloidtoGO/styles/components/common/icon-button.css';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isRound?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
    icon,
    variant = 'ghost',
    size = 'md',
    isRound = false,
    className = '',
    ...props
}) => {
    return (
        <button
            className={twMerge(
                'icon-btn',
                `icon-btn-${variant}`,
                `icon-btn-${size}`,
                isRound ? 'icon-btn-round' : 'icon-btn-square',
                className
            )}
            {...props}
        >
            {icon}
        </button>
    );
}; 