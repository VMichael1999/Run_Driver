import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  const [fontsLoaded] = useFonts({
    'GeneralSans-Regular': require('./assets/legacy/fonts/GeneralSans-Regular.ttf'),
    'GeneralSans-Italic': require('./assets/legacy/fonts/GeneralSans-Italic.ttf'),
    'GeneralSans-Bold': require('./assets/legacy/fonts/GeneralSans-Bold.ttf'),
    'GeneralSans-BoldItalic': require('./assets/legacy/fonts/GeneralSans-BoldItalic.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
