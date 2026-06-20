import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
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

function AppNavigator() {
  const { isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Stack.Navigator
      key={user ? 'auth' : 'guest'}
      initialRouteName={user ? 'Home' : 'Login'}
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
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
