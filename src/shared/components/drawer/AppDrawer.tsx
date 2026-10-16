import React from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { ClienteStackParamList } from '@navigation/types';
import { Colors } from '@theme/colors';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing } from '@theme/spacing';
import type { AppMode } from '@store/useAppModeStore';
import appJson from '../../../../app.json';

type ClienteRoute = keyof ClienteStackParamList;

export type DrawerSection = 'main' | 'wallet' | 'personal' | 'preferences';

export interface DrawerOption<Route extends string = ClienteRoute> {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: Route;
  section: DrawerSection;
}

interface AppDrawerProps<Route extends string> {
  visible: boolean;
  onClose: () => void;
  onNavigate: (route: Route) => void;
  /** Opciones del menú; por defecto, las de viajes. */
  options?: DrawerOption<Route>[];
  /** Pantalla que abre la cabecera "Mi perfil". */
  profileRoute?: Route;
  onLogout: () => void;
  phoneLabel: string;
  /** Con él, se muestra el botón para cambiar entre viajes y delivery. */
  mode?: AppMode;
  onToggleMode?: () => void;
}

const SECTION_LABELS: Record<DrawerSection, string> = {
  main: 'Navegación',
  wallet: 'Pagos y promociones',
  personal: 'Personales',
  preferences: 'Preferencias',
};

const SECTION_ORDER: DrawerSection[] = ['main', 'wallet', 'personal', 'preferences'];

const DRAWER_OPTIONS: DrawerOption[] = [
  { id: 'home', icon: 'home-outline', label: 'Mapa', route: 'ClienteHome', section: 'main' },
  { id: 'trips', icon: 'time-outline', label: 'Mis viajes', route: 'HistorialViaje', section: 'main' },
  { id: 'schedule', icon: 'alarm-outline', label: 'Programar viaje', route: 'ProgramarViaje', section: 'main' },
  { id: 'payment', icon: 'card-outline', label: 'Métodos de pago', route: 'MetodosPago', section: 'wallet' },
  { id: 'promos', icon: 'pricetag-outline', label: 'Promociones', route: 'Promociones', section: 'wallet' },
  { id: 'favorites', icon: 'bookmark-outline', label: 'Direcciones favoritas', route: 'Favoritas', section: 'personal' },
  { id: 'settings', icon: 'settings-outline', label: 'Configuración', route: 'Configuracion', section: 'preferences' },
];

const APP_VERSION: string = (appJson as { expo: { version: string } }).expo.version;

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = Math.round(SCREEN_WIDTH * 0.78);

function groupBySection<Route extends string>(options: DrawerOption<Route>[]): Array<[DrawerSection, DrawerOption<Route>[]]> {
  const groups = new Map<DrawerSection, DrawerOption<Route>[]>();
  for (const option of options) {
    const list = groups.get(option.section) ?? [];
    list.push(option);
    groups.set(option.section, list);
  }
  return SECTION_ORDER.flatMap((section) => {
    const list = groups.get(section);
    return list ? [[section, list] as [DrawerSection, DrawerOption<Route>[]]] : [];
  });
}

export function AppDrawer<Route extends string = ClienteRoute>({
  visible,
  onClose,
  onNavigate,
  options,
  profileRoute,
  sectionLabels,
  onLogout,
  phoneLabel,
  mode,
  onToggleMode,
}: AppDrawerProps<Route> & { sectionLabels?: Partial<Record<DrawerSection, string>> }) {
  const theme = useAppTheme();
  // Dentro de un Modal, SafeAreaView de iOS no recibe los márgenes: se toman del proveedor de la app.
  const insets = useSafeAreaInsets();
  const translateX = React.useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const backdropOpacity = React.useRef(new Animated.Value(0)).current;
  const [internalVisible, setInternalVisible] = React.useState<boolean>(visible);

  React.useEffect(() => {
    if (visible) {
      setInternalVisible(true);
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 240,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 240,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -DRAWER_WIDTH,
          duration: 200,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setInternalVisible(false);
      });
    }
  }, [visible, translateX, backdropOpacity]);

  const sections = React.useMemo(
    () => groupBySection(options ?? (DRAWER_OPTIONS as unknown as DrawerOption<Route>[])),
    [options],
  );

  const handleSelect = (route: Route) => {
    onClose();
    setTimeout(() => onNavigate(route), 220);
  };

  const handleToggleMode = () => {
    onClose();
    setTimeout(() => onToggleMode?.(), 220);
  };

  const handleLogout = () => {
    onClose();
    setTimeout(() => onLogout(), 220);
  };

  return (
    <Modal visible={internalVisible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} accessibilityRole="button" accessibilityLabel="Cerrar menú" />
        </Animated.View>

        <Animated.View style={[styles.panel, { backgroundColor: theme.drawer, transform: [{ translateX }] }]}>
          <View style={[styles.safeArea, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 }]}>
            <TouchableOpacity
              style={styles.profileSection}
              onPress={() => handleSelect(profileRoute ?? ('Perfil' as Route))}
              accessibilityRole="button"
              accessibilityLabel="Ver perfil"
              activeOpacity={0.85}
            >
              <View style={styles.avatarWrap}>
                <Ionicons name="person" size={34} color={Colors.white} />
              </View>
              <View style={styles.profileTextWrap}>
                <Text style={styles.profileName}>Mi perfil</Text>
                <Text style={styles.profilePhone}>{phoneLabel}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.white} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <ScrollView
              style={styles.sectionsWrap}
              contentContainerStyle={styles.sectionsContent}
              showsVerticalScrollIndicator={false}
            >
              {sections.map(([section, options]) => (
                <View key={section} style={styles.sectionWrap}>
                  <Text style={styles.sectionLabel}>{sectionLabels?.[section] ?? SECTION_LABELS[section]}</Text>
                  {options.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={styles.menuItem}
                      onPress={() => handleSelect(option.route)}
                  accessibilityRole="button"
                  accessibilityLabel={option.label}
                      activeOpacity={0.75}
                    >
                      <Ionicons name={option.icon} size={22} color={Colors.white} />
                      <Text style={styles.menuLabel}>{option.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </ScrollView>

            {mode && onToggleMode ? (
              <TouchableOpacity
                style={[styles.modeButton, mode === 'delivery' && styles.modeButtonBack]}
                onPress={handleToggleMode}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={mode === 'delivery' ? 'Volver a viajes' : 'Cambiar a modo delivery'}
              >
                <Ionicons
                  name={mode === 'delivery' ? 'car-outline' : 'bag-outline'}
                  size={20}
                  color={mode === 'delivery' ? Colors.white : Colors.onAccentLime}
                />
                <Text style={[styles.modeLabel, mode === 'delivery' && styles.modeLabelBack]}>
                  {mode === 'delivery' ? 'Volver a viajes' : 'Modo delivery'}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={mode === 'delivery' ? Colors.white : Colors.onAccentLime}
                  style={styles.modeArrow}
                />
              </TouchableOpacity>
            ) : null}

            <View style={styles.divider} />
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8} accessibilityRole="button">
              <Ionicons name="log-out-outline" size={22} color={Colors.dangerOnDark} />
              <Text style={styles.logoutText}>Cerrar sesión</Text>
            </TouchableOpacity>
            <Text style={styles.versionLabel}>Version {APP_VERSION}</Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.scrimSoft,
  },
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: DRAWER_WIDTH,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  avatarWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.onDarkLine,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileTextWrap: {
    flex: 1,
  },
  profileName: {
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    marginBottom: 2,
  },
  profilePhone: {
    color: Colors.onDarkHigh,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.onDarkLine,
    marginVertical: Spacing.sm,
  },
  sectionsWrap: {
    flex: 1,
  },
  sectionsContent: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  sectionWrap: {
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    color: Colors.onDarkMuted,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    borderRadius: 14,
    marginBottom: 4,
  },
  menuLabel: {
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
  },
  // Medidas de .modebtn en docs/delivery/run-delivery-replica.html
  modeButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.accentLime,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    marginTop: Spacing.sm,
  },
  modeButtonBack: {
    backgroundColor: Colors.primary,
    borderWidth: 1,
    borderColor: Colors.onDarkLine,
  },
  modeLabel: {
    color: Colors.onAccentLime,
    fontFamily: FontFamily.semibold,
    fontSize: 15.5,
  },
  modeLabelBack: {
    color: Colors.white,
  },
  modeArrow: {
    marginLeft: 'auto',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
  },
  logoutText: {
    color: Colors.dangerOnDark,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
  },
  versionLabel: {
    color: Colors.onDarkMuted,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    textAlign: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
});
