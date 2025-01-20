import React from 'react';
import { twMerge } from 'tailwind-merge';
import '@/app/testField/VocaloidtoGO/styles/components/common/card.css';

interface CardProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    className?: string;
    onClick?: () => void;
    hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    title,
    subtitle,
    className = '',
    onClick,
    hoverable = false
}) => {
    return (
        <div 
            className={twMerge(
                'card',
                hoverable && 'card-hoverable',
                className
            )} 
            onClick={onClick}
        >
            {(title || subtitle) && (
                <div className="card-header">
                    {title && <h3 className="card-title">{title}</h3>}
                    {subtitle && <p className="card-subtitle">{subtitle}</p>}
                </div>
            )}
            <div className="card-body">
                {children}
            </div>
        </div>
    );
}; 