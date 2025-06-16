'use client';

import { useState, useEffect } from 'react';
import BackButton from '@/components/BackButton';
import '@pixi/events'

interface SyncBox {
    id: string;
    text: string;
    lastUpdateTime: string;
}

export default function SyncText() {
  const [syncBoxes, setSyncBoxes] = useState<SyncBox[]>([
    { id: '1', text: '', lastUpdateTime: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchText = async () => {
    try {
      setError(null);
      const response = await fetch('/api/syncText');
      const data = await response.json();
      if (data.success) {
        setSyncBoxes(boxes => boxes.map(box => ({
          ...box,
          text: data.data.text,
          lastUpdateTime: data.data.updateTime
        })));
      }
    } catch (error) {
      setError('获取数据失败');
    }
  };

  useEffect(() => {
    fetchText();
  }, []);

  const handlePull = async () => {
    setLoading(true);
    await fetchText();
    setLoading(false);
  };

  const handlePush = async (text: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/syncText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      });

      const data = await response.json();
      if (!data.success) {
        setError(data.error);
      } else {
        setSyncBoxes(boxes => boxes.map(box => ({
          ...box,
          lastUpdateTime: data.data.updateTime
        })));
      }
    } catch (error) {
      setError('同步失败');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    setLoading(true);
    setError(null);

    try {
      await fetch('/api/syncText', { method: 'DELETE' });
      setSyncBoxes(boxes => boxes.map(box => ({
        ...box,
        text: '',
        lastUpdateTime: ''
      })));
    } catch (error) {
      setError('清除失败');
    } finally {
      setLoading(false);
    }
  };

  const addSyncBox = () => {
    setSyncBoxes(boxes => [
      ...boxes,
      { id: Date.now().toString(), text: '', lastUpdateTime: '' }
    ]);
  };

  const removeSyncBox = (id: string) => {
    setSyncBoxes(boxes => boxes.filter(box => box.id !== id));
  };

  const updateBoxText = (id: string, newText: string) => {
    setSyncBoxes(boxes => boxes.map(box => 
      box.id === id ? { ...box, text: newText } : box
    ));
  };

  return (
    <div className="sync-text-container">
      <div className="sync-text-wrapper">
        <div className="sync-text-card">
          <div className="sync-text-header">
            <BackButton href="/testField" />
            <h1 className="sync-text-title">
                            多端文本同步
            </h1>
          </div>

          <div className="sync-text-add-button-wrapper">
            <button
              type="button"
              onClick={addSyncBox}
              className="sync-text-add-button"
            >
                            添加同步框
            </button>
          </div>

          {error && (
            <div className="sync-text-error">
              {error}
            </div>
          )}

          <div className="sync-text-boxes">
            {syncBoxes.map((box) => (
              <div key={box.id} className="sync-text-box">
                <div className="sync-text-box-header">
                  <span className="sync-text-box-title">同步框 {box.id}</span>
                  {syncBoxes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSyncBox(box.id)}
                      className="sync-text-remove-button"
                    >
                                            删除
                    </button>
                  )}
                </div>
                <div className="sync-text-textarea-wrapper">
                  <textarea
                    value={box.text}
                    onChange={(e) => updateBoxText(box.id, e.target.value)}
                    className="sync-text-textarea"
                    placeholder="在此输入要同步的文本..."
                  />
                  {box.lastUpdateTime && (
                    <div className="sync-text-update-time">
                                            最后更新: {new Date(box.lastUpdateTime).toLocaleString()}
                    </div>
                  )}
                </div>
                <div className="sync-text-box-buttons">
                  <button
                    type="button"
                    onClick={handlePull}
                    disabled={loading}
                    className="sync-text-pull-button"
                  >
                    {loading ? '同步中...' : '从服务器同步'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePush(box.text)}
                    disabled={loading}
                    className="sync-text-push-button"
                  >
                    {loading ? '同步中...' : '同步到服务器'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="sync-text-global-buttons">
            <button
              type="button"
              onClick={handleClear}
              disabled={loading}
              className="sync-text-clear-button"
            >
                            清除所有
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 