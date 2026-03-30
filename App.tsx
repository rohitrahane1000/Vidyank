import { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppState, View, ActivityIndicator, Text } from 'react-native';
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/auth/LoginScreen';
import CourseListScreen from './src/screens/CourseListScreen';
import { useAuthStore } from './src/store/authStore';
import { notificationService } from './src/services/notificationService';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const { isAuthenticated, isLoading, initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialize authentication first
    const initApp = async () => {
      await initializeAuth();
      
      // Initialize notification service after auth
      notificationService.initialize();
    };

    initApp();

    // Handle app state changes for activity tracking
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        // Update last active time when app becomes active
        notificationService.updateLastActiveTime();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Cleanup on unmount
    return () => {
      subscription?.remove();
      notificationService.cleanup();
    };
  }, []);

  // Show loading screen while initializing auth
  if (isLoading) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>Loading...</Text>
        </View>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    );
  }

  if (showSplash) {
    return (
      <SafeAreaProvider>
        <SplashScreen onFinish={() => setShowSplash(false)} />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    );
  }

  if (isAuthenticated) {
    return (
      <SafeAreaProvider>
        <CourseListScreen />
        <StatusBar style="dark" />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <LoginScreen />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
