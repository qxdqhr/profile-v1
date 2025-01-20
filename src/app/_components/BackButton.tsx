'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface BackButtonProps {
  href?: string;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ href, className = '' }) => {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      return;
    }
    router.back();
  };

  const buttonContent = (
    <div className={`back-button ${className}`}>
      ← 返回
    </div>
  );

  if (href) {
    return (
      <Link href={href}>
        {buttonContent}
      </Link>
    );
  }

  return (
    <button onClick={handleClick}>
      {buttonContent}
    </button>
  );
}; 