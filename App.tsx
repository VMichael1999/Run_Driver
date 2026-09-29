import React from 'react';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useAppTheme } from './src/theme';
import { LogBox } from 'react-native';
import { useThemeStore } from './src/store/useThemeStore';

LogBox.ignoreAllLogs();

// Mantiene el splash nativo (fondo negro) hasta que las fuentes estén listas, en vez de una pantalla en blanco.
void SplashScreen.preventAutoHideAsync();

export default function App() {
  const theme = useAppTheme();
  const isDark = useThemeStore((state) => state.isDark);
  const loadTheme = useThemeStore((state) => state.loadTheme);
  const [fontsLoaded, fontError] = useFonts({
    'GeneralSans-Regular': require('./assets/legacy/fonts/GeneralSans-Regular.ttf'),
    'GeneralSans-Italic': require('./assets/legacy/fonts/GeneralSans-Italic.ttf'),
    'GeneralSans-Medium': require('./assets/legacy/fonts/GeneralSans-Medium.ttf'),
    'GeneralSans-Semibold': require('./assets/legacy/fonts/GeneralSans-Semibold.ttf'),
    'GeneralSans-Bold': require('./assets/legacy/fonts/GeneralSans-Bold.ttf'),
    'GeneralSans-BoldItalic': require('./assets/legacy/fonts/GeneralSans-BoldItalic.ttf'),
  });

  React.useEffect(() => {
    void loadTheme();
  }, [loadTheme]);

  React.useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
          <StatusBar style={theme.statusBar} />
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
