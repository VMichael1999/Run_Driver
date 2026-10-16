import React from 'react';
import { AppDrawer } from '@shared/components/drawer/AppDrawer';
import { useAuthStore } from '@store/useAuthStore';
import { useAppModeStore } from '@store/useAppModeStore';

interface DeliveryDrawerProps {
  visible: boolean;
  onClose: () => void;
}

/** Menú lateral de viajes dentro de delivery: sus opciones vuelven a viajes y abren esa pantalla. */
export function DeliveryDrawer({ visible, onClose }: DeliveryDrawerProps) {
  const logout = useAuthStore((s) => s.logout);
  const phone = useAuthStore((s) => s.phone);
  const countryCode = useAuthStore((s) => s.countryCode);
  const setMode = useAppModeStore((s) => s.setMode);
  const exitToRoute = useAppModeStore((s) => s.exitToRoute);

  return (
    <AppDrawer
      visible={visible}
      onClose={onClose}
      onNavigate={exitToRoute}
      onLogout={logout}
      phoneLabel={phone ? `${countryCode} ${phone}` : '+51 999 999 999'}
      mode="delivery"
      onToggleMode={() => setMode('viajes')}
    />
  );
}
