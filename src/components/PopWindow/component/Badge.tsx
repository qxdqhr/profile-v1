import { BadgeType } from "..";
import styles from '../styles.module.css';

interface BadgeProps extends BadgeType {
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    label,
    type = 'default',
    icon,
    className = '',
}) => {
    return (
        <span className={`${styles.badge} ${styles[`badge-${type}`]} ${className}`}>
            {icon && <span className={styles.badgeIcon}>{icon}</span>}
            <span>{label}</span>
        </span>
    );
};
