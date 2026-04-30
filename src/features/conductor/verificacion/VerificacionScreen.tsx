import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ConductorStackParamList } from '@navigation/types';
import { BackAppBar } from '@shared/components/appbar/BackAppBar';
import { RoundedButton } from '@shared/components/button/RoundedButton';
import { VerificationHelpCard } from '@shared/components/card/VerificationHelpCard';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';
import { verificationSteps } from './shared';

type Nav = NativeStackNavigationProp<ConductorStackParamList, 'Verificacion'>;

export function VerificacionScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [completedRoutes, setCompletedRoutes] = React.useState<string[]>(['VerificacionContactoEmergencia']);
  const completedCount = completedRoutes.length;

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <BackAppBar title="Verificacion" />

      <View style={styles.progress}>
        <Text style={styles.progressText}>
          {completedCount} de {verificationSteps.length} completados
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(completedCount / verificationSteps.length) * 100}%` }]} />
        </View>
      </View>

      <FlatList
        data={verificationSteps}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.stepCard}
            activeOpacity={0.8}
            onPress={() => {
              navigation.navigate(item.route);
              setCompletedRoutes((prev) => (prev.includes(item.route) ? prev : [...prev, item.route]));
            }}
          >
            <Ionicons name={item.icon} size={20} color={Colors.textPrimary} style={styles.icon} />
            <Text style={styles.stepLabel}>{item.value}</Text>
            {completedRoutes.includes(item.route) ? (
              <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
            ) : (
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            )}
          </TouchableOpacity>
        )}
      />

      <View style={styles.footer}>
        <RoundedButton label="Enviar" onPress={() => navigation.replace('ConductorHome')} disabled={completedCount < 2} />
        <VerificationHelpCard />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundLight },
  progress: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    ...Shadow.sm,
  },
  progressText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.divider,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  list: { padding: Spacing.lg, gap: Spacing.sm },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    ...Shadow.sm,
  },
  icon: { marginRight: Spacing.md },
  stepLabel: {
    flex: 1,
    fontSize: FontSize.md,
    fontFamily: FontFamily.regular,
    color: Colors.textPrimary,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
});
