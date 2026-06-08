'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button, Card, Input, Modal } from 'animal-island-ui';
import { fitnessPlanClient } from '../../services/fitnessPlanClient';
import type { FoodItemRecord } from '../types';

interface FoodSearchPanelProps {
  open: boolean;
  onClose: () => void;
  onSelect: (food: FoodItemRecord) => void;
}

export function FoodSearchPanel({ open, onClose, onSelect }: FoodSearchPanelProps) {
  const [foods, setFoods] = useState<FoodItemRecord[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fitnessPlanClient.listFoodItems({
        search: search || undefined,
      });
      setFoods(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    if (open) void load();
  }, [load, open]);

  return (
    <Modal open={open} onClose={onClose} title="选择食物">
      <div className="fp-food-search">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索食物名称…"
        />
        <Button type="default" size="small" onClick={() => void load()}>
          搜索
        </Button>
      </div>

      {error ? <p style={{ color: '#e05a5a', margin: '8px 0 0' }}>{error}</p> : null}
      {loading ? <p style={{ color: '#9f927d' }}>加载中…</p> : null}

      <div className="fp-food-list">
        {foods.map((food) => (
          <Card key={food.id} pattern="default">
            <div className="fp-food-item">
              <div>
                <strong>{food.name}</strong>
                <p>
                  {food.calories} kcal
                  {food.protein != null ? ` · 蛋白 ${food.protein}g` : ''}
                  {food.isCustom ? ' · 自定义' : ''}
                </p>
              </div>
              <Button type="primary" size="small" onClick={() => onSelect(food)}>
                选用
              </Button>
            </div>
          </Card>
        ))}
        {!loading && foods.length === 0 ? (
          <p style={{ color: '#9f927d', margin: 0 }}>未找到匹配食物，可手动输入。</p>
        ) : null}
      </div>
    </Modal>
  );
}
