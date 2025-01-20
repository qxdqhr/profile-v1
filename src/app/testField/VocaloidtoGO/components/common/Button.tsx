import React from 'react';
import { twMerge } from 'tailwind-merge';
import '@/app/testField/VocaloidtoGO/styles/components/common/button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    icon,
    className,
    disabled,
    ...props
}) => {
    return (
        <button
            className={twMerge(
                'btn',
                `btn-${variant}`,
                `btn-${size}`,
                disabled && 'btn-disabled',
                isLoading && 'btn-loading',
                icon && 'btn-icon',
                className
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <span className="animate-spin">⭕</span>
            ) : (
                <>
                    {icon && <span>{icon}</span>}
                    {children}
                </>
            )}
        </button>
    );
}; 