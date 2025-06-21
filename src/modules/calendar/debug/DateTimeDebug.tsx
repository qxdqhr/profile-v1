'use client';

import React, { useState } from 'react';
import { formatDate, toLocalISOString } from '../utils/dateUtils';

const DateTimeDebug: React.FC = () => {
  const [testDate, setTestDate] = useState(new Date('2024-12-28T15:30:00'));

  const formatTests = [
    {
      name: '原始 toISOString()',
      value: testDate.toISOString()
    },
    {
      name: '新的 toLocalISOString()',
      value: toLocalISOString(testDate)
    },
    {
      name: '原始 formatDate (toISOString().split)',
      value: testDate.toISOString().split('T')[0]
    },
    {
      name: '新的 formatDate (本地时区)',
      value: formatDate(testDate)
    },
    {
      name: '本地日期字符串',
      value: testDate.toLocaleDateString('zh-CN')
    },
    {
      name: '本地时间字符串',
      value: testDate.toLocaleString('zh-CN')
    }
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl">
      <h2 className="text-2xl font-bold mb-4">日期时间调试工具</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          测试日期时间：
        </label>
        <input
          type="datetime-local"
          value={testDate.toISOString().slice(0, 16)}
          onChange={(e) => setTestDate(new Date(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">格式化测试结果：</h3>
        
        {formatTests.map((test, index) => (
          <div key={index} className="bg-gray-50 p-3 rounded">
            <div className="text-sm font-medium text-gray-600">{test.name}:</div>
            <div className="font-mono text-sm">{test.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800">说明：</h4>
        <p className="text-blue-700 text-sm mt-1">
          如果你在东八区（UTC+8），原始的 toISOString() 会将本地时间转换为 UTC 时间，
          可能导致日期显示错误。新的实现避免了这个问题。
        </p>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>当前时区偏移: {testDate.getTimezoneOffset()} 分钟</p>
        <p>时区信息: {Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
      </div>
    </div>
  );
};

export default DateTimeDebug; 