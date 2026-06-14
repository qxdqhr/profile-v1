'use client';

import React from 'react';
import { Modal } from 'sa2kit/common/components';
import {
  MAP_NAVIGATION_OPTIONS,
  type MapNavigationProviderId,
} from '../utils/mapNavigation';

type MapNavigationPickerModalProps = {
  isOpen: boolean;
  destination: string;
  onClose: () => void;
  onSelect: (provider: MapNavigationProviderId) => void;
};

const providerAccent: Record<MapNavigationProviderId, string> = {
  amap: 'border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100',
  baidu: 'border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100',
  google: 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100',
};

export default function MapNavigationPickerModal({
  isOpen,
  destination,
  onClose,
  onSelect,
}: MapNavigationPickerModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="选择导航应用"
      width="420px"
      className="sm:max-w-[420px]"
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          目的地：
          <span className="font-medium text-slate-900">{destination}</span>
        </p>

        <div className="grid gap-3">
          {MAP_NAVIGATION_OPTIONS.map(option => (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className={`flex w-full flex-col items-start rounded-xl border px-4 py-3 text-left transition-colors ${providerAccent[option.id]}`}
            >
              <span className="text-base font-semibold">{option.label}</span>
              {option.description ? (
                <span className="mt-1 text-xs opacity-80">{option.description}</span>
              ) : null}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          取消
        </button>
      </div>
    </Modal>
  );
}
