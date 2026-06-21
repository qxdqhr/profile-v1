import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { LessonReadingProgress } from './LessonReadingProgress';
import { useLessonReaderSettings, isVerticalReaderPosition } from '../hooks/useLessonReaderSettings';
import {
  buildEndScrollDragScript,
  buildSetScrollPercentScript,
  LESSON_SCROLL_TRACKER_JS,
} from '../utils/lessonWebViewScripts';
import { prepareLessonHtmlForWebView } from '../utils/prepareLessonHtmlForWebView';
import { Button } from '../ui';
import { ai } from '../ui/tokens';
import { thDesc } from '../theme';

type Props = {
  html: string | null;
  /** 课时/参考页文件 URL，用作 WebView baseUrl（相对资源解析） */
  documentBaseUrl?: string;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  title?: string;
};

/** 对齐 teach-hub-core LessonViewer（WebView + 阅读进度条） */
export function HtmlLessonViewer({
  html,
  documentBaseUrl,
  loading,
  error,
  onRetry,
  title,
}: Props) {
  const webViewRef = useRef<WebView>(null);
  const draggingRef = useRef(false);
  const [percent, setPercent] = useState(0);
  const [webViewError, setWebViewError] = useState<string | null>(null);
  const { settings, setBarExpanded } = useLessonReaderSettings();
  const { barPosition, barExpanded } = settings;
  const vertical = isVerticalReaderPosition(barPosition);
  const showBarFirst = barPosition === 'top' || barPosition === 'left';

  const preparedHtml = useMemo(() => {
    if (!html?.trim()) return null;
    return prepareLessonHtmlForWebView(html);
  }, [html]);

  const webViewBaseUrl = documentBaseUrl?.trim() || 'about:blank';

  useEffect(() => {
    setPercent(0);
    draggingRef.current = false;
    setWebViewError(null);
  }, [html, documentBaseUrl]);

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
      <View style={[styles.fill, styles.centered]}>
        <ActivityIndicator size="large" color={ai.primary} />
        <Text className={`mt-3 ${thDesc}`}>加载课时内容…</Text>
      </View>
    );
  }

  if (error || webViewError) {
    return (
      <View style={[styles.fill, styles.centered, styles.pad]}>
        <Text className="text-center text-red-600">{error || webViewError}</Text>
        {onRetry ? (
          <Button type="primary" onPress={onRetry}>
            重试
          </Button>
        ) : null}
      </View>
    );
  }

  if (!preparedHtml) {
    return (
      <View style={[styles.fill, styles.centered, styles.pad]}>
        <Text className={`text-center ${thDesc}`}>课时内容为空</Text>
        {onRetry ? (
          <Button type="primary" onPress={onRetry}>
            重试
          </Button>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.fill}>
      {!vertical && showBarFirst ? progressBar : null}
      <View style={[styles.fill, vertical && styles.relative]}>
        <WebView
          ref={webViewRef}
          style={styles.webView}
          originWhitelist={['*']}
          source={{ html: preparedHtml, baseUrl: webViewBaseUrl }}
          sharedCookiesEnabled
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          setSupportMultipleWindows={false}
          injectedJavaScript={LESSON_SCROLL_TRACKER_JS}
          onMessage={handleMessage}
          onLoadEnd={() => webViewRef.current?.injectJavaScript(LESSON_SCROLL_TRACKER_JS)}
          onError={() => setWebViewError('WebView 加载失败')}
          onHttpError={(event) => {
            if (event.nativeEvent.statusCode >= 400) {
              setWebViewError(`WebView 加载失败 (${event.nativeEvent.statusCode})`);
            }
          }}
          {...(title ? { accessibilityLabel: title } : {})}
        />
        {vertical ? (
          <View
            style={[
              styles.verticalProgressOverlay,
              barPosition === 'left' ? styles.overlayLeft : styles.overlayRight,
            ]}
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

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    minHeight: 0,
    backgroundColor: ai.bg,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pad: {
    gap: 12,
    padding: 24,
  },
  relative: {
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: ai.bg,
  },
  verticalProgressOverlay: {
    position: 'absolute',
    top: 12,
    bottom: 12,
    zIndex: 10,
  },
  overlayLeft: {
    left: 12,
  },
  overlayRight: {
    right: 12,
  },
});
