'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, Input, Modal, Select, Title } from 'animal-island-ui';
import { FoodSearchPanel } from '../components/diet/FoodSearchPanel';
import { fitnessPlanClient } from '../services/fitnessPlanClient';
import { useFitnessPlanStore } from '../store/fitnessPlanStore';
import type {
  DietDayPayload,
  DietLogEntryRecord,
  FoodItemRecord,
  MealType,
} from '../types';
import {
  MEAL_TYPE_LABELS,
  MEAL_TYPE_ORDER,
  formatDateKey,
} from '../types';

function shiftDate(dateKey: string, delta: number) {
  const date = new Date(`${dateKey}T12:00:00`);
  date.setDate(date.getDate() + delta);
  return formatDateKey(date);
}

function formatDisplayDate(dateKey: string) {
  const date = new Date(`${dateKey}T12:00:00`);
  return date.toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
}

function groupEntries(entries: DietLogEntryRecord[]) {
  const groups = new Map<MealType, DietLogEntryRecord[]>();
  for (const meal of MEAL_TYPE_ORDER) {
    groups.set(meal, []);
  }
  for (const entry of entries) {
    const list = groups.get(entry.mealType) ?? [];
    list.push(entry);
    groups.set(entry.mealType, list);
  }
  return groups;
}

const mealOptions = MEAL_TYPE_ORDER.map((key) => ({
  key,
  label: MEAL_TYPE_LABELS[key],
}));

export function DietPage() {
  const selectedDate = useFitnessPlanStore((s) => s.ui.selectedDate);
  const setSelectedDate = useFitnessPlanStore((s) => s.setSelectedDate);
  const setCheckinToday = useFitnessPlanStore((s) => s.setCheckinToday);

  const [day, setDay] = useState<DietDayPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [foodSearchOpen, setFoodSearchOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    mealType: 'lunch' as MealType,
    foodName: '',
    foodItemId: null as number | null,
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    imageUrl: null as string | null,
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fitnessPlanClient.getDietDay(selectedDate);
      setDay(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    void load();
  }, [load]);

  const grouped = useMemo(
    () => groupEntries(day?.entries ?? []),
    [day?.entries],
  );

  const caloriePercent = day
    ? Math.min(100, Math.round((day.totals.calories / Math.max(day.calorieGoal, 1)) * 100))
    : 0;

  const resetForm = () => {
    setForm({
      mealType: 'lunch',
      foodName: '',
      foodItemId: null,
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      imageUrl: null,
    });
  };

  const handleSelectFood = (food: FoodItemRecord) => {
    setFoodSearchOpen(false);
    setForm((prev) => ({
      ...prev,
      foodName: food.name,
      foodItemId: food.id,
      calories: String(food.calories),
      protein: food.protein != null ? String(food.protein) : '',
      carbs: food.carbs != null ? String(food.carbs) : '',
      fat: food.fat != null ? String(food.fat) : '',
    }));
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const result = await fitnessPlanClient.uploadDietImage(file);
      setForm((prev) => ({ ...prev, imageUrl: result.imageUrl }));
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleAddEntry = async () => {
    if (!form.foodName.trim()) {
      setError('请填写食物名称');
      return;
    }
    const calories = Number(form.calories);
    if (!Number.isFinite(calories) || calories < 0) {
      setError('请填写有效热量');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const data = await fitnessPlanClient.addDietEntry({
        logDate: selectedDate,
        mealType: form.mealType,
        foodName: form.foodName.trim(),
        foodItemId: form.foodItemId ?? undefined,
        calories,
        protein: form.protein === '' ? null : Number(form.protein),
        carbs: form.carbs === '' ? null : Number(form.carbs),
        fat: form.fat === '' ? null : Number(form.fat),
        imageUrl: form.imageUrl,
      });
      setDay(data);
      if (selectedDate === formatDateKey(new Date())) {
        setCheckinToday({ diet: true });
      }
      setAddOpen(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (entryId: number) => {
    if (!window.confirm('确定删除这条饮食记录？')) return;
    try {
      const data = await fitnessPlanClient.deleteDietEntry(entryId);
      setDay(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    }
  };

  return (
    <div className="fp-page">
      <Title size="middle" color="app-pink">
        饮食记录
      </Title>
      <p className="fp-page__desc">按日记录餐次、热量与饮食截图（不上线 OCR）。</p>

      <div className="fp-diet-toolbar">
        <Button type="default" size="small" onClick={() => setSelectedDate(shiftDate(selectedDate, -1))}>
          前一天
        </Button>
        <div className="fp-diet-toolbar__date">
          <strong>{formatDisplayDate(selectedDate)}</strong>
          <span>{selectedDate}</span>
        </div>
        <Button type="default" size="small" onClick={() => setSelectedDate(shiftDate(selectedDate, 1))}>
          后一天
        </Button>
        <Button type="default" size="small" onClick={() => setSelectedDate(formatDateKey(new Date()))}>
          今天
        </Button>
      </div>

      <Card pattern="app-pink">
        <div className="fp-diet-summary">
          <div>
            <span className="fp-diet-summary__label">今日摄入</span>
            <strong className="fp-diet-summary__value">
              {day?.totals.calories ?? 0}
              <small> / {day?.calorieGoal ?? 2000} kcal</small>
            </strong>
          </div>
          <div className="fp-diet-summary__macros">
            <span>蛋白 {Math.round(day?.totals.protein ?? 0)}g</span>
            <span>碳水 {Math.round(day?.totals.carbs ?? 0)}g</span>
            <span>脂肪 {Math.round(day?.totals.fat ?? 0)}g</span>
          </div>
        </div>
        <div className="fp-diet-progress">
          <div className="fp-diet-progress__bar" style={{ width: `${caloriePercent}%` }} />
        </div>
      </Card>

      <div className="fp-action-row">
        <Button type="primary" onClick={() => setAddOpen(true)}>
          添加饮食
        </Button>
      </div>

      {error ? <p style={{ color: '#e05a5a', margin: 0 }}>{error}</p> : null}
      {loading ? <p style={{ color: '#9f927d' }}>加载中…</p> : null}

      {MEAL_TYPE_ORDER.map((mealType) => {
        const entries = grouped.get(mealType) ?? [];
        if (entries.length === 0 && !loading) return null;

        return (
          <Card key={mealType} pattern="default">
            <Title size="small" color="app-pink">
              {MEAL_TYPE_LABELS[mealType]}
            </Title>
            <div className="fp-diet-entry-list">
              {entries.map((entry) => (
                <div key={entry.id} className="fp-diet-entry">
                  {entry.imageUrl ? (
                    <a
                      href={entry.imageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="fp-diet-entry__thumb-wrap"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={entry.imageUrl}
                        alt={entry.foodName}
                        className="fp-diet-entry__thumb"
                      />
                    </a>
                  ) : (
                    <div className="fp-diet-entry__thumb-wrap fp-diet-entry__thumb-wrap--empty">
                      🍽
                    </div>
                  )}
                  <div className="fp-diet-entry__body">
                    <strong>{entry.foodName}</strong>
                    <p>
                      {entry.calories} kcal
                      {entry.protein != null ? ` · 蛋白 ${entry.protein}g` : ''}
                    </p>
                  </div>
                  <Button type="default" size="small" onClick={() => void handleDelete(entry.id)}>
                    删除
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        );
      })}

      {!loading && (day?.entries.length ?? 0) === 0 ? (
        <Card pattern="default" type="dashed">
          <p style={{ margin: 0, color: '#9f927d' }}>
            今天还没有饮食记录，点击「添加饮食」开始记录吧。
          </p>
        </Card>
      ) : null}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="添加饮食">
        <div className="fp-diet-form">
          <label className="fp-field">
            <span>餐次</span>
            <Select
              value={form.mealType}
              options={mealOptions}
              onChange={(value) => setForm((prev) => ({ ...prev, mealType: value as MealType }))}
            />
          </label>

          <div className="fp-action-row">
            <Input
              value={form.foodName}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  foodName: e.target.value,
                  foodItemId: null,
                }))
              }
              placeholder="食物名称"
            />
            <Button type="default" onClick={() => setFoodSearchOpen(true)}>
              从食物库选
            </Button>
          </div>

          <div className="fp-diet-form__grid">
            <label className="fp-field">
              <span>热量 (kcal)</span>
              <Input
                type="number"
                min={0}
                value={form.calories}
                onChange={(e) => setForm((prev) => ({ ...prev, calories: e.target.value }))}
              />
            </label>
            <label className="fp-field">
              <span>蛋白 (g)</span>
              <Input
                type="number"
                min={0}
                value={form.protein}
                onChange={(e) => setForm((prev) => ({ ...prev, protein: e.target.value }))}
              />
            </label>
            <label className="fp-field">
              <span>碳水 (g)</span>
              <Input
                type="number"
                min={0}
                value={form.carbs}
                onChange={(e) => setForm((prev) => ({ ...prev, carbs: e.target.value }))}
              />
            </label>
            <label className="fp-field">
              <span>脂肪 (g)</span>
              <Input
                type="number"
                min={0}
                value={form.fat}
                onChange={(e) => setForm((prev) => ({ ...prev, fat: e.target.value }))}
              />
            </label>
          </div>

          <div className="fp-diet-upload">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleUpload(file);
                e.target.value = '';
              }}
            />
            <Button
              type="default"
              loading={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              上传饮食截图
            </Button>
            {form.imageUrl ? (
              <a href={form.imageUrl} target="_blank" rel="noreferrer" className="fp-diet-upload__preview">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.imageUrl} alt="预览" />
              </a>
            ) : null}
          </div>

          <div className="fp-action-row">
            <Button type="primary" loading={saving} onClick={() => void handleAddEntry()}>
              保存
            </Button>
            <Button
              type="default"
              onClick={() => {
                setAddOpen(false);
                resetForm();
              }}
            >
              取消
            </Button>
          </div>
        </div>
      </Modal>

      <FoodSearchPanel
        open={foodSearchOpen}
        onClose={() => setFoodSearchOpen(false)}
        onSelect={handleSelectFood}
      />
    </div>
  );
}
