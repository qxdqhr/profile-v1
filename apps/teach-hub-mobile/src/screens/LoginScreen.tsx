import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { WebView } from 'react-native-webview';

import { useAuth } from '../auth/AuthContext';
import type { RootStackParamList } from '../navigation';
import { AUTH_BASE_URL } from '../config';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { completeLoginIfReady } = useAuth();
  const [checking, setChecking] = useState(false);
  const doneRef = useRef(false);

  const finishLogin = useCallback(async () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setChecking(true);
    try {
      const ok = await completeLoginIfReady();
      if (ok) navigation.replace('Home');
    } finally {
      setChecking(false);
      doneRef.current = false;
    }
  }, [completeLoginIfReady, navigation]);

  useEffect(() => {
    const timer = setInterval(() => {
      void finishLogin();
    }, 1500);
    return () => clearInterval(timer);
  }, [finishLogin]);

  return (
    <View className="flex-1 bg-slate-50 pt-3">
      <Text className="px-4 text-lg font-bold text-slate-900">登录 TeachHub</Text>
      <Text className="mb-2 mt-1.5 px-4 text-sm text-slate-500">
        在下方页面完成登录。同步 Cookie（含 HttpOnly）后会自动进入应用。
      </Text>
      <Text className="mb-2 px-4 text-xs text-slate-400">{AUTH_BASE_URL}</Text>

      {checking ? (
        <ActivityIndicator className="flex-1 self-center" />
      ) : (
        <WebView
          source={{ uri: AUTH_BASE_URL }}
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
          setSupportMultipleWindows={false}
          onNavigationStateChange={() => void finishLogin()}
          className="flex-1 bg-white"
        />
      )}

      <Pressable className="items-center p-4" onPress={() => navigation.replace('Home')}>
        <Text className="text-sm text-slate-500">跳过（未登录预览）</Text>
      </Pressable>
    </View>
  );
}
