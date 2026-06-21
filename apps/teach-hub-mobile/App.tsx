import { NavigationContainer, type NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from './src/auth/AuthContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { LessonScreen } from './src/screens/LessonScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { RecordDetailScreen } from './src/screens/RecordDetailScreen';
import { ReferenceScreen } from './src/screens/ReferenceScreen';
import { WorkspaceScreen } from './src/screens/WorkspaceScreen';
import type { RootStackParamList } from './src/navigation';
import { Loading } from './src/ui';
import { thColors } from './src/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  const { isLoading, user } = useAuth();
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  useEffect(() => {
    if (isLoading || !navigationRef.current) return;
    const target = user ? 'Home' : 'Login';
    const current = navigationRef.current.getCurrentRoute()?.name;
    if (current === target) return;
    navigationRef.current.reset({ index: 0, routes: [{ name: target }] });
  }, [isLoading, user]);

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar style="dark" />
      <View style={styles.root}>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerStyle: { backgroundColor: thColors.panel },
            headerShadowVisible: false,
            headerTintColor: thColors.text,
            headerTitleStyle: { color: thColors.text, fontWeight: '600' },
            contentStyle: { backgroundColor: thColors.bg },
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Teach 学习工作区' }} />
          <Stack.Screen name="Workspace" component={WorkspaceScreen} options={{ title: '工作区' }} />
          <Stack.Screen name="Lesson" component={LessonScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Reference" component={ReferenceScreen} options={{ headerShown: false }} />
          <Stack.Screen name="RecordDetail" component={RecordDetailScreen} options={{ title: '学习记录' }} />
        </Stack.Navigator>

        {isLoading ? (
          <View style={styles.loadingOverlay}>
            <Loading fullScreen />
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
  },
});
