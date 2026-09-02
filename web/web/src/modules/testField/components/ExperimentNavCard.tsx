'use client';

import React from 'react';
import { ExperimentCard } from 'sa2kit/business/portfolio';
import type { ExperimentItem } from '../types';
import { isSidecarPath } from '../utils/isSidecarPath';

type CardProps = Pick<
  ExperimentItem,
  'title' | 'description' | 'tags' | 'category' | 'isCompleted' | 'updatedAt' | 'createdAt'
> & { path: string; className?: string };

/**
 * ExperimentCard 内部用 next/link；旁路 /games|/wp 必须整页跳转，否则会落到 Next 404。
 */
export function ExperimentNavCard({ path, className, ...card }: CardProps) {
  const node = (
    <ExperimentCard
      href={path}
      title={card.title}
      description={card.description}
      tags={card.tags}
      category={card.category}
      isCompleted={card.isCompleted}
      updatedAt={card.updatedAt}
      createdAt={card.createdAt}
      className={className}
    />
  );

  if (!isSidecarPath(path)) {
    return node;
  }

  return (
    <div
      className="contents"
      onClickCapture={(e) => {
        e.preventDefault();
        e.stopPropagation();
        window.location.assign(path);
      }}
    >
      {node}
    </div>
  );
}
