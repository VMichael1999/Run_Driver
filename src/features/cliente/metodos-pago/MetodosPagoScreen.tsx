import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ClienteStackParamList } from '@navigation/types';
import { usePaymentSelectionStore } from '@store/usePaymentSelectionStore';
import { PAYMENT_METHODS, type PaymentMethodId } from '@shared/data/paymentMethods';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius } from '@theme/spacing';

type Nav = NativeStackNavigationProp<ClienteStackParamList, 'MetodosPago'>;

const ACCENT = '#1d5fa8';

export function MetodosPagoScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const selectedId = usePaymentSelectionStore((s) => s.selectedId);
  const setSelected = usePaymentSelectionStore((s) => s.setSelected);

  const handleSelect = (id: PaymentMethodId) => {
    setSelected(id);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.85}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Metodos de pago</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + Spacing['2xl'] }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Otros metodos</Text>

        <View style={styles.section}>
          {PAYMENT_METHODS.map((method, index) => {
            const isSelected = selectedId === method.id;
            const isLast = index === PAYMENT_METHODS.length - 1;
            return (
              <TouchableOpacity
                key={method.id}
                style={[styles.row, !isLast && styles.rowDivider]}
                onPress={() => handleSelect(method.id)}
                activeOpacity={0.85}
              >
                <View style={styles.iconWrap}>
                  <Image source={method.image} style={styles.icon} resizeMode="contain" />
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.rowLabel}>{method.label}</Text>
                  <Text style={styles.rowDescription}>{method.description}</Text>
                </View>
                <View
                  style={[
                    styles.radio,
                    isSelected ? styles.radioSelected : styles.radioEmpty,
                  ]}
                >
                  {isSelected ? <Ionicons name="checkmark" size={16} color={Colors.white} /> : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f7fb' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
    backgroundColor: '#f4f7fb',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#eef2f7',
  },
  iconWrap: {
    width: 44,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 40,
    height: 28,
  },
  rowText: { flex: 1 },
  rowLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  rowDescription: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioEmpty: {
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    backgroundColor: 'transparent',
  },
  radioSelected: {
    backgroundColor: ACCENT,
  },
});
