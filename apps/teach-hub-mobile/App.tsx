import { NavigationContainer, type NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from './src/auth/AuthContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { LessonScreen } from './src/screens/LessonScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { RecordDetailScreen } from './src/screens/RecordDetailScreen';
import { ReferenceScreen } from './src/screens/ReferenceScreen';
import { WorkspaceScreen } from './src/screens/WorkspaceScreen';
import type { RootStackParamList } from './src/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  const { isLoading, user } = useAuth();
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  useEffect(() => {
    if (isLoading || !user) return;
    navigationRef.current?.reset({ index: 0, routes: [{ name: 'Home' }] });
  }, [isLoading, user]);

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar style="dark" />
      <View style={styles.root}>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerStyle: { backgroundColor: '#ffffff' },
            headerTitleStyle: { color: '#0f172a', fontWeight: '600' },
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: '登录' }} />
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'TeachHub' }} />
          <Stack.Screen name="Workspace" component={WorkspaceScreen} options={{ title: '工作区' }} />
          <Stack.Screen name="Lesson" component={LessonScreen} options={{ title: '课时' }} />
          <Stack.Screen name="Reference" component={ReferenceScreen} options={{ title: '速查参考' }} />
          <Stack.Screen name="RecordDetail" component={RecordDetailScreen} options={{ title: '学习记录' }} />
        </Stack.Navigator>

        {isLoading ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#0f172a" />
          </View>
        ) : null}
      </View>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
});
