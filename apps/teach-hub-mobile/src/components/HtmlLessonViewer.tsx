import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { LessonReadingProgress } from './LessonReadingProgress';
import { useLessonReaderSettings, isVerticalReaderPosition } from '../hooks/useLessonReaderSettings';
import { TEACH_HUB_API_BASE_URL } from '../config';
import {
  buildEndScrollDragScript,
  buildSetScrollPercentScript,
  LESSON_SCROLL_TRACKER_JS,
} from '../utils/lessonWebViewScripts';
import { thDesc, thPrimaryBtn, thPrimaryBtnText, thScreen } from '../theme';

type Props = {
  html: string | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  title?: string;
};

/** 对齐 teach-hub-core LessonViewer（WebView + 阅读进度条） */
export function HtmlLessonViewer({ html, loading, error, onRetry, title }: Props) {
  const webViewRef = useRef<WebView>(null);
  const draggingRef = useRef(false);
  const [percent, setPercent] = useState(0);
  const { settings, setBarExpanded } = useLessonReaderSettings();
  const { barPosition, barExpanded } = settings;
  const vertical = isVerticalReaderPosition(barPosition);
  const showBarFirst = barPosition === 'top' || barPosition === 'left';

  useEffect(() => {
    setPercent(0);
    draggingRef.current = false;
  }, [html]);

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    if (draggingRef.current) return;
    try {
      const data = JSON.parse(event.nativeEvent.data) as { type?: string; percent?: number };
      if (data.type === 'lesson-scroll' && typeof data.percent === 'number') {
        setPercent(data.percent);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSliderChange = useCallback((value: number) => {
    draggingRef.current = true;
    setPercent(value);
    webViewRef.current?.injectJavaScript(buildSetScrollPercentScript(value));
  }, []);

  const endDragging = useCallback(() => {
    webViewRef.current?.injectJavaScript(buildEndScrollDragScript());
    draggingRef.current = false;
  }, []);

  const progressBar = (
    <LessonReadingProgress
      position={barPosition}
      expanded={barExpanded}
      percent={percent}
      onPercentChange={handleSliderChange}
      onDragEnd={endDragging}
      onExpandedChange={(next) => void setBarExpanded(next)}
    />
  );

  if (loading) {
    return (
      <View className={`${thScreen} items-center justify-center`}>
        <ActivityIndicator color="#2c5282" />
        <Text className={`mt-3 ${thDesc}`}>加载课时内容…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className={`${thScreen} items-center justify-center gap-3 p-6`}>
        <Text className="text-center text-red-600">{error}</Text>
        {onRetry ? (
          <Pressable className={thPrimaryBtn} onPress={onRetry}>
            <Text className={thPrimaryBtnText}>重试</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  if (!html) return null;

  const webView = (
    <WebView
      ref={webViewRef}
      originWhitelist={['*']}
      source={{ html, baseUrl: `${TEACH_HUB_API_BASE_URL}/` }}
      sharedCookiesEnabled
      javaScriptEnabled
      domStorageEnabled
      injectedJavaScript={LESSON_SCROLL_TRACKER_JS}
      onMessage={handleMessage}
      onLoadEnd={() => webViewRef.current?.injectJavaScript(LESSON_SCROLL_TRACKER_JS)}
      className="flex-1 bg-[#faf9f7]"
      {...(title ? { accessibilityLabel: title } : {})}
    />
  );

  return (
    <View className="min-h-0 flex-1 bg-[#faf9f7]">
      {!vertical && showBarFirst ? progressBar : null}
      <View className={`min-h-0 flex-1 ${vertical ? 'relative' : ''}`}>
        {webView}
        {vertical ? (
          <View
            className={`absolute inset-y-3 z-10 ${barPosition === 'left' ? 'left-3' : 'right-3'}`}
            pointerEvents="box-none"
          >
            {progressBar}
          </View>
        ) : null}
      </View>
      {!vertical && !showBarFirst ? progressBar : null}
    </View>
  );
}
