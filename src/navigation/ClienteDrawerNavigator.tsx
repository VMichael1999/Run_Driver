import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { ClienteNavigator } from './ClienteNavigator';
import { CustomDrawerContent } from './drawer/CustomDrawerContent';

const Drawer = createDrawerNavigator();

export function ClienteDrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        overlayColor: 'transparent',
        drawerStyle: {
          backgroundColor: '#1a2f4e',
          width: '65%',
        },
        sceneStyle: {
          backgroundColor: '#1a2f4e',
        },
      }}
    >
      <Drawer.Screen name="ClienteStack" component={ClienteNavigator} />
    </Drawer.Navigator>
  );
}
