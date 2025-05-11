import Link from 'next/link';
import styles from "./ExperimentCard.module.css";
import { classNames } from '@/utils/classNames';

interface ExperimentCardProps {
    href: string;
    title: string;
    description: string;
    tags: string[];
    category?: 'utility' | 'leisure';
}

export const ExperimentCard: React.FC<ExperimentCardProps> = ({
  href,
  title,
  description,
  tags,
  category = 'utility'
}) => {
  return (
    <Link href={href} className={classNames(
      styles.card,
      category === 'utility' ? styles.utilityCard : styles.leisureCard
    )}>
      <h2 className={styles.cardTitle}>{title}</h2>
      <p className={styles.description}>{description}</p>
      <div className={styles.tagContainer}>
        {tags.map((tag, index) => (
          <span key={index} className={styles.tag}>{tag}</span>
        ))}
      </div>
    </Link>
  );
}; 