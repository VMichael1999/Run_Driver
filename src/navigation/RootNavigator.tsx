import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { useAuthStore } from '@store/useAuthStore';
import { AuthNavigator } from './AuthNavigator';
import { ClienteNavigator } from './ClienteNavigator';
import { ConductorNavigator } from './ConductorNavigator';
import { SplashScreen } from '@features/auth/SplashScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isAuthenticated, role } = useAuthStore();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Auth" component={AuthNavigator} />
        </>
      ) : role === 'cliente' ? (
        <Stack.Screen name="ClienteApp" component={ClienteNavigator} />
      ) : (
        <Stack.Screen name="ConductorApp" component={ConductorNavigator} />
      )}
    </Stack.Navigator>
  );
}
