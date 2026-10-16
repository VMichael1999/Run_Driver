import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { useAuthStore } from '@store/useAuthStore';
import { AuthNavigator } from './AuthNavigator';
import { ClienteNavigator } from './ClienteNavigator';
import { ConductorNavigator } from './ConductorNavigator';
import { DeliveryNavigator } from './DeliveryNavigator';
import { useAppModeStore } from '@store/useAppModeStore';
import { SplashScreen } from '@features/auth/SplashScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isAuthenticated, role } = useAuthStore();
  const mode = useAppModeStore((state) => state.mode);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Auth" component={AuthNavigator} />
        </>
      ) : role === 'cliente' ? (
        mode === 'delivery' ? (
          <Stack.Screen name="DeliveryApp" component={DeliveryNavigator} options={{ animation: 'fade' }} />
        ) : (
          <Stack.Screen name="ClienteApp" component={ClienteNavigator} options={{ animation: 'fade' }} />
        )
      ) : (
        <Stack.Screen name="ConductorApp" component={ConductorNavigator} />
      )}
    </Stack.Navigator>
  );
}
