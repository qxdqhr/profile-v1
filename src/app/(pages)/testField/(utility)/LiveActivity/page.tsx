'use client';

import { useState } from 'react';
import { ActivityForm } from './_components/ActivityForm';
import { JsonEditor } from './_components/JsonEditor';
import { ResponseDisplay } from './_components/ResponseDisplay';
import { FormData, ApiResponse } from './_components/types';
import { BackButton } from '@/app/_components/BackButton';
import Link from 'next/link';

export default function LiveActivity() {
  const [formData, setFormData] = useState<FormData>({
    pushToken: '80bb4f151d60eacb5e80374478c251b12efd6b32c4085196615a65316d22f1ee716c1d261321461305ac44080bad4d838e4877f0f4ecae2e56a17395a7e3c739f0ecd490ba57584b589850190f693e51',
    apns_topic: 'com.duxiaoman.walletappdebug.push-type.liveactivity',
    apns_priority: '10',
    event: 'update'
  });

  const [contentStateJson, setContentStateJson] = useState(JSON.stringify({
    endTime: 759810093.822517,
    isRunning: false,
    completedCount: 2,
    currentPhase: "work",
    totalTime: 2000,
    elapsedTime: 1000    
  }, null, 2));

  const [jsonError, setJsonError] = useState<string | null>(null);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [liveState, setLiveState] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditorChange = (value: string | undefined) => {
    if (!value) return;
    setContentStateJson(value);
    try {
      JSON.parse(value);
      setJsonError(null);
    } catch (e) {
      setJsonError(e instanceof Error ? e.message : '无效的 JSON 格式');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const contentState = JSON.parse(contentStateJson);
      setJsonError(null);

      setLoading(true);
      const payload = {
        pushToken: formData.pushToken,
        apns_topic: formData.apns_topic,
        apns_priority: formData.apns_priority,
        event: formData.event,
        contentState
      };

      const response = await fetch('/api/activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      setResponse(data);
            
      if (data.success) {
        setLiveState(contentState);
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        setJsonError('无效的 JSON 格式');
      }
      setResponse({
        success: false,
        error: error instanceof Error ? error.message : '请求失败'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="live-activity-container">
      <div className="live-activity-wrapper">
        <div className="live-activity-card">
          <div className="live-activity-header">
            <BackButton href="/testField"/>
            <h1 className="live-activity-title">
                            Live Activity API 测试
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="live-activity-form">
            <ActivityForm
              formData={formData}
              onChange={handleInputChange}
            />

            <JsonEditor
              value={contentStateJson}
              onChange={handleEditorChange}
              error={jsonError}
            />

            <button
              type="submit"
              disabled={loading || !!jsonError}
              className="live-activity-submit-button"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="live-activity-loading-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                                    发送中...
                </span>
              ) : '发送请求'}
            </button>
          </form>

          <ResponseDisplay response={response} />
        </div>
      </div>
    </div>
  );
}
