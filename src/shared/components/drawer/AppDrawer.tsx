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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { ClienteStackParamList } from '@navigation/types';
import { Colors } from '@theme/colors';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing } from '@theme/spacing';
import appJson from '../../../../app.json';

type ClienteRoute = keyof ClienteStackParamList;

type DrawerSection = 'main' | 'wallet' | 'personal' | 'preferences';

interface DrawerOption {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: ClienteRoute;
  section: DrawerSection;
}

interface AppDrawerProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (route: ClienteRoute) => void;
  onLogout: () => void;
  phoneLabel: string;
}

const SECTION_LABELS: Record<DrawerSection, string> = {
  main: 'Navegacion',
  wallet: 'Pagos y promociones',
  personal: 'Personales',
  preferences: 'Preferencias',
};

const SECTION_ORDER: DrawerSection[] = ['main', 'wallet', 'personal', 'preferences'];

const DRAWER_OPTIONS: DrawerOption[] = [
  { id: 'home', icon: 'home-outline', label: 'Mapa', route: 'ClienteHome', section: 'main' },
  { id: 'trips', icon: 'time-outline', label: 'Mis viajes', route: 'HistorialViaje', section: 'main' },
  { id: 'schedule', icon: 'alarm-outline', label: 'Programar viaje', route: 'ProgramarViaje', section: 'main' },
  { id: 'payment', icon: 'card-outline', label: 'Metodos de pago', route: 'MetodosPago', section: 'wallet' },
  { id: 'promos', icon: 'pricetag-outline', label: 'Promociones', route: 'Promociones', section: 'wallet' },
  { id: 'favorites', icon: 'bookmark-outline', label: 'Direcciones favoritas', route: 'Favoritas', section: 'personal' },
  { id: 'settings', icon: 'settings-outline', label: 'Configuracion', route: 'Configuracion', section: 'preferences' },
];

const APP_VERSION: string = (appJson as { expo: { version: string } }).expo.version;

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = Math.round(SCREEN_WIDTH * 0.78);

function groupBySection(options: DrawerOption[]): Array<[DrawerSection, DrawerOption[]]> {
  const groups = new Map<DrawerSection, DrawerOption[]>();
  for (const option of options) {
    const list = groups.get(option.section) ?? [];
    list.push(option);
    groups.set(option.section, list);
  }
  return SECTION_ORDER.flatMap((section) => {
    const list = groups.get(section);
    return list ? [[section, list] as [DrawerSection, DrawerOption[]]] : [];
  });
}

export function AppDrawer({ visible, onClose, onNavigate, onLogout, phoneLabel }: AppDrawerProps) {
  const theme = useAppTheme();
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

  const sections = React.useMemo(() => groupBySection(DRAWER_OPTIONS), []);

  const handleSelect = (route: ClienteRoute) => {
    onClose();
    setTimeout(() => onNavigate(route), 220);
  };

  const handleLogout = () => {
    onClose();
    setTimeout(() => onLogout(), 220);
  };

  return (
    <Modal visible={internalVisible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        </Animated.View>

        <Animated.View style={[styles.panel, { backgroundColor: theme.drawer, transform: [{ translateX }] }]}>
          <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <TouchableOpacity
              style={styles.profileSection}
              onPress={() => handleSelect('Perfil')}
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
                  <Text style={styles.sectionLabel}>{SECTION_LABELS[section]}</Text>
                  {options.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={styles.menuItem}
                      onPress={() => handleSelect(option.route)}
                      activeOpacity={0.75}
                    >
                      <Ionicons name={option.icon} size={22} color={Colors.white} />
                      <Text style={styles.menuLabel}>{option.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </ScrollView>

            <View style={styles.divider} />
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
              <Ionicons name="log-out-outline" size={22} color="#ff6b6b" />
              <Text style={styles.logoutText}>Cerrar sesion</Text>
            </TouchableOpacity>
            <Text style={styles.versionLabel}>Version {APP_VERSION}</Text>
          </SafeAreaView>
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
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#1a2f4e',
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
    backgroundColor: 'rgba(255,255,255,0.2)',
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
    color: 'rgba(255,255,255,0.7)',
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
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
    color: 'rgba(255,255,255,0.5)',
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
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
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
  },
  logoutText: {
    color: '#ff6b6b',
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
  },
  versionLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    textAlign: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
});
