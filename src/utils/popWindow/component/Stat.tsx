import { StatType } from '..';
import styles from '../styles.module.css';

interface StatProps extends StatType {
  className?: string;
}

export const Stat: React.FC<StatProps> = ({
  label,
  value,
  icon,
  className = '',
}) => {
  return (
    <div className={`${styles.stat} ${className}`}>
      {icon && <span className={styles.statIcon}>{icon}</span>}
      <div className={styles.statContent}>
        <div className={styles.statValue}>{value}</div>
        <div className={styles.statLabel}>{label}</div>
      </div>
    </div>
  );
};
