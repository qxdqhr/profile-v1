'use client';

import React, { useState } from 'react';
import {
  COLOR_THEMES,
  DEFAULT_CALENDAR_SETTINGS,
  resolveTheme,
  type CalendarSettings,
  type CalendarThemeKey,
} from '../utils/calendarSettingsCore';
import { useCalendarSettings } from '../context/CalendarSettingsContext';

export type { CalendarSettings, CalendarThemeKey };

const WEEK_START_OPTIONS = [
  { value: 0, label: '周日开始' },
  { value: 1, label: '周一开始' },
];

const TIME_FORMAT_OPTIONS = [
  { value: '12h', label: '12小时制' },
  { value: '24h', label: '24小时制' },
];

const LANGUAGE_OPTIONS = [
  { value: 'zh-CN', label: '简体中文' },
  { value: 'en-US', label: 'English' },
];

export default function CalendarSettings() {
  const { settings, updateSettings, resetSettings, replaceSettings } = useCalendarSettings();
  const [activeTab, setActiveTab] = useState<'theme' | 'general' | 'time'>('theme');

  const currentTheme = resolveTheme(settings);

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { key: 'theme', label: '主题样式', icon: '🎨' },
            { key: 'general', label: '常规设置', icon: '⚙️' },
            { key: 'time', label: '时间设置', icon: '⏰' },
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as 'theme' | 'general' | 'time')}
              className={`border-b-2 py-4 text-sm font-medium transition-colors ${
                activeTab === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <span className="mr-2">{icon}</span>
              {label}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'theme' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-md mb-4 font-medium text-gray-900">预设主题</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {Object.entries(COLOR_THEMES).map(([key, theme]) => (
                  <div
                    key={key}
                    onClick={() => updateSettings({ theme: key as CalendarThemeKey })}
                    className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                      settings.theme === key
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{theme.name}</h4>
                      {settings.theme === key && (
                        <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>

                    <div className="mb-3 flex space-x-1">
                      {Object.values(theme.colors)
                        .slice(0, 6)
                        .map((color, index) => (
                          <div
                            key={index}
                            className="h-6 w-6 rounded-full border border-gray-200"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                    </div>

                    <div className="text-xs">
                      <div
                        className="grid grid-cols-7 gap-1 rounded border p-2"
                        style={{
                          backgroundColor: theme.background.calendar,
                          borderColor: theme.border.calendar,
                        }}
                      >
                        {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
                          <div
                            key={day}
                            className="py-1 text-center text-xs"
                            style={{ color: theme.text.secondary }}
                          >
                            {day}
                          </div>
                        ))}
                        {Array.from({ length: 7 }, (_, index) => (
                          <div
                            key={index}
                            className="flex aspect-square items-center justify-center rounded text-xs"
                            style={{
                              backgroundColor:
                                index === 3 ? theme.background.today : theme.background.cell,
                              color: index === 3 ? theme.text.today : theme.text.primary,
                              border: `1px solid ${index === 3 ? theme.border.today : theme.border.cell}`,
                            }}
                          >
                            {index + 1}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-md mb-4 font-medium text-gray-900">自定义颜色</h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {Object.entries(currentTheme.colors).map(([key, defaultColor]) => (
                  <div key={key} className="space-y-2">
                    <label className="block text-sm font-medium capitalize text-gray-700">
                      {key === 'primary'
                        ? '主色'
                        : key === 'secondary'
                          ? '次要色'
                          : key === 'accent'
                            ? '强调色'
                            : key === 'danger'
                              ? '危险色'
                              : key}
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={settings.customColors?.[key] || defaultColor}
                        onChange={(e) =>
                          updateSettings({
                            customColors: {
                              ...settings.customColors,
                              [key]: e.target.value,
                            },
                          })
                        }
                        className="h-8 w-12 cursor-pointer rounded border border-gray-300"
                      />
                      <input
                        type="text"
                        value={settings.customColors?.[key] || defaultColor}
                        onChange={(e) =>
                          updateSettings({
                            customColors: {
                              ...settings.customColors,
                              [key]: e.target.value,
                            },
                          })
                        }
                        className="flex-1 rounded-md border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={defaultColor}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'general' && (
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">一周开始于</label>
              <select
                value={settings.weekStartsOn}
                onChange={(e) => updateSettings({ weekStartsOn: Number(e.target.value) })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {WEEK_START_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">语言</label>
              <select
                value={settings.language}
                onChange={(e) => updateSettings({ language: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-900">显示选项</h3>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.showWeekNumbers}
                  onChange={(e) => updateSettings({ showWeekNumbers: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">显示周数</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.showLunarCalendar}
                  onChange={(e) => updateSettings({ showLunarCalendar: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">显示农历</span>
              </label>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                默认活动时长（分钟）
              </label>
              <input
                type="number"
                min="15"
                max="480"
                step="15"
                value={settings.defaultEventDuration}
                onChange={(e) => updateSettings({ defaultEventDuration: Number(e.target.value) })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {activeTab === 'time' && (
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">时间格式</label>
              <select
                value={settings.timeFormat}
                onChange={(e) => updateSettings({ timeFormat: e.target.value as '12h' | '24h' })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TIME_FORMAT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <h3 className="text-md mb-4 font-medium text-gray-900">工作时间</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">开始时间</label>
                  <input
                    type="time"
                    value={settings.workingHours.start}
                    onChange={(e) =>
                      updateSettings({
                        workingHours: {
                          ...settings.workingHours,
                          start: e.target.value,
                        },
                      })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">结束时间</label>
                  <input
                    type="time"
                    value={settings.workingHours.end}
                    onChange={(e) =>
                      updateSettings({
                        workingHours: {
                          ...settings.workingHours,
                          end: e.target.value,
                        },
                      })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between border-t border-gray-200 pt-6">
          <button
            onClick={resetSettings}
            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            重置为默认
          </button>

          <div className="flex space-x-3">
            <button
              onClick={() => {
                const dataStr = JSON.stringify(settings, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'calendar-settings.json';
                link.click();
                URL.revokeObjectURL(url);
              }}
              className="rounded-md bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100"
            >
              导出设置
            </button>

            <label className="cursor-pointer rounded-md bg-green-50 px-4 py-2 text-sm font-medium text-green-600 transition-colors hover:bg-green-100">
              导入设置
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const importedSettings = JSON.parse(event.target?.result as string);
                        replaceSettings({ ...DEFAULT_CALENDAR_SETTINGS, ...importedSettings });
                      } catch {
                        alert('导入设置失败，请检查文件格式');
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
