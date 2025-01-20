import Link from 'next/link';
import "@/styles/components/ExperimentCard.css";

interface ExperimentCardProps {
    href: string;
    title: string;
    description: string;
    tags: string[];
}

export const ExperimentCard: React.FC<ExperimentCardProps> = ({
    href,
    title,
    description,
    tags
}) => {
    return (
        <Link href={href} className="card">
            <h2 className="cardTitle">{title}</h2>
            <p className="description">{description}</p>
            <div className="tagContainer">
                {tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                ))}
            </div>
        </Link>
    );
}; 