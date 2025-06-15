import { BadgeType } from "..";
import { Badge } from "./Badge";
import styles from '../styles.module.css';
    
interface BadgeListProps {
    badges: BadgeType[];
    className?: string;
}

export const BadgeList: React.FC<BadgeListProps> = ({
    badges,
    className = '',
}) => {
    if (!badges || badges.length === 0) return null;

    return (
        <div className={`${styles.badgeList} ${className}`}>
            {badges.map((badge, index) => (
                <Badge key={index} {...badge} />
            ))}
        </div>
    );
};