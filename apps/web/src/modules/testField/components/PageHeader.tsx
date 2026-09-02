import { BackButton } from 'sa2kit/common/ui/patterns/next';
import Link from 'next/link';

interface PageHeaderProps {
  counts: { all: number; completed: number; inProgress: number };
}

export default function PageHeader({ counts }: PageHeaderProps) {
  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <BackButton />
        <Link
          href="/games"
          className="text-sm text-gray-600 hover:text-green-600 transition-colors"
        >
          小游戏大厅 →
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">实验田</h1>
        <p className="mt-2 text-sm text-gray-600">
          工具类小应用与实验性功能；休闲游戏请前往小游戏大厅
        </p>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
          <span>总计: {counts.all} 个工具</span>
          <span>已完成: {counts.completed} 个</span>
          <span>进行中: {counts.inProgress} 个</span>
        </div>
      </div>
    </>
  );
}