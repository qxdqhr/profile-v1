'use client';

import React from 'react';
import { Button, Modal } from 'animal-island-ui';
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

const providerClass: Record<MapNavigationProviderId, string> = {
  amap: 'cal-map-option cal-map-option--amap',
  baidu: 'cal-map-option cal-map-option--baidu',
  google: 'cal-map-option cal-map-option--google',
};

export default function MapNavigationPickerModal({
  isOpen,
  destination,
  onClose,
  onSelect,
}: MapNavigationPickerModalProps) {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="选择导航应用"
      typewriter={false}
      width="420px"
      footer={
        <div className="cal-modal-actions">
          <Button type="default" onClick={onClose}>
            取消
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="cal-text-body text-sm">
          目的地：
          <span className="cal-text-heading font-semibold">{destination}</span>
        </p>

        <div className="grid gap-3">
          {MAP_NAVIGATION_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className={providerClass[option.id]}
            >
              <span className="text-base font-semibold">{option.label}</span>
              {option.description ? (
                <span className="cal-text-muted mt-1 text-xs">{option.description}</span>
              ) : null}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
