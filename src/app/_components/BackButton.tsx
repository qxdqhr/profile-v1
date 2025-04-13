'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface BackButtonProps {
  href: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ href }) => {
  const router = useRouter();

  const handleClick = () => {
    router.back();
  };

  return (
    <Link href={href} className="back-button">
      返回
    </Link>
  );
}; 