import { StatType } from "..";
import { Stat } from "./Stat";
import styles from '../styles.module.css';

interface StatListProps {
  stats: StatType[];
  className?: string;
}

export const StatList: React.FC<StatListProps> = ({
  stats,
  className = '',
}) => {
  if (!stats || stats.length === 0) return null;

  return (
    <div className={`${styles.statList} ${className}`}>
      {stats.map((stat, index) => (
        <Stat key={index} {...stat} />
      ))}
    </div>
  );
}; 