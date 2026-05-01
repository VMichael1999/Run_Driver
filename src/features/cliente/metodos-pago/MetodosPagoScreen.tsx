import React from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ClienteStackParamList } from '@navigation/types';
import { usePaymentMethodsStore } from '@store/usePaymentMethodsStore';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';
import type { SavedPaymentMethod, SavedPaymentMode } from './types';

type Nav = NativeStackNavigationProp<ClienteStackParamList, 'MetodosPago'>;

const MODE_OPTIONS: ReadonlyArray<{ mode: SavedPaymentMode; icon: keyof typeof Ionicons.glyphMap }> = [
  { mode: 'Efectivo', icon: 'cash-outline' },
  { mode: 'Yape', icon: 'phone-portrait-outline' },
  { mode: 'Plin', icon: 'phone-portrait-outline' },
  { mode: 'Tunki', icon: 'phone-portrait-outline' },
  { mode: 'Tarjeta', icon: 'card-outline' },
];

export function MetodosPagoScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const methods = usePaymentMethodsStore((s) => s.methods);
  const addMethod = usePaymentMethodsStore((s) => s.addMethod);
  const removeMethod = usePaymentMethodsStore((s) => s.removeMethod);
  const setDefault = usePaymentMethodsStore((s) => s.setDefault);

  const [showForm, setShowForm] = React.useState<boolean>(false);
  const [selectedMode, setSelectedMode] = React.useState<SavedPaymentMode>('Yape');
  const [alias, setAlias] = React.useState<string>('');
  const [last4, setLast4] = React.useState<string>('');

  const resetForm = () => {
    setSelectedMode('Yape');
    setAlias('');
    setLast4('');
    setShowForm(false);
  };

  const handleAdd = () => {
    if (!alias.trim()) {
      Alert.alert('Falta el alias', 'Asigna un nombre al metodo de pago.');
      return;
    }
    if (selectedMode === 'Tarjeta' && last4.trim().length !== 4) {
      Alert.alert('Tarjeta invalida', 'Ingresa los ultimos 4 digitos de la tarjeta.');
      return;
    }
    addMethod({
      mode: selectedMode,
      alias,
      last4: selectedMode === 'Tarjeta' ? last4.trim() : undefined,
    });
    resetForm();
  };

  const confirmRemove = (method: SavedPaymentMethod) => {
    Alert.alert('Eliminar metodo', `Quieres eliminar ${method.alias}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => removeMethod(method.id) },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.85}>
          <Ionicons name="chevron-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Metodos de pago</Text>
        <TouchableOpacity
          onPress={() => setShowForm((prev) => !prev)}
          style={styles.backButton}
          activeOpacity={0.85}
        >
          <Ionicons name={showForm ? 'close' : 'add'} size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + Spacing['2xl'] }]}
        keyboardShouldPersistTaps="handled"
      >
        {showForm ? (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Nuevo metodo</Text>
            <Text style={styles.formLabel}>Tipo</Text>
            <View style={styles.modeGrid}>
              {MODE_OPTIONS.map(({ mode, icon }) => {
                const active = selectedMode === mode;
                return (
                  <Pressable
                    key={mode}
                    style={[styles.modeChip, active && styles.modeChipActive]}
                    onPress={() => setSelectedMode(mode)}
                  >
                    <Ionicons
                      name={icon}
                      size={16}
                      color={active ? Colors.white : Colors.textPrimary}
                    />
                    <Text style={[styles.modeChipText, active && styles.modeChipTextActive]}>
                      {mode}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.formLabel}>Alias</Text>
            <TextInput
              style={styles.input}
              value={alias}
              onChangeText={setAlias}
              placeholder="Ej. Yape personal"
              placeholderTextColor={Colors.textDisabled}
            />

            {selectedMode === 'Tarjeta' ? (
              <>
                <Text style={styles.formLabel}>Ultimos 4 digitos</Text>
                <TextInput
                  style={styles.input}
                  value={last4}
                  onChangeText={(value) => setLast4(value.replace(/[^0-9]/g, '').slice(0, 4))}
                  placeholder="1234"
                  placeholderTextColor={Colors.textDisabled}
                  keyboardType="number-pad"
                  maxLength={4}
                />
              </>
            ) : null}

            <TouchableOpacity style={styles.saveButton} onPress={handleAdd} activeOpacity={0.85}>
              <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {methods.length === 0 && !showForm ? (
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={42} color={Colors.textDisabled} />
            <Text style={styles.emptyText}>Aun no tienes metodos de pago.</Text>
            <TouchableOpacity onPress={() => setShowForm(true)} style={styles.emptyButton} activeOpacity={0.85}>
              <Text style={styles.emptyButtonText}>Agregar uno</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {methods.map((method) => (
          <View key={method.id} style={styles.methodCard}>
            <View style={styles.methodIconWrap}>
              <Ionicons
                name={method.mode === 'Tarjeta' ? 'card-outline' : 'phone-portrait-outline'}
                size={22}
                color={Colors.primary}
              />
            </View>
            <View style={styles.methodInfo}>
              <Text style={styles.methodAlias}>{method.alias}</Text>
              <Text style={styles.methodMode}>
                {method.mode}
                {method.last4 ? ` ${'•'.repeat(4)} ${method.last4}` : ''}
              </Text>
            </View>
            <View style={styles.methodActions}>
              {method.isDefault ? (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultBadgeText}>Predeterminado</Text>
                </View>
              ) : (
                <TouchableOpacity onPress={() => setDefault(method.id)} activeOpacity={0.85}>
                  <Text style={styles.setDefaultText}>Marcar</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => confirmRemove(method)} activeOpacity={0.85}>
                <Ionicons name="trash-outline" size={18} color={Colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f7fb' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.primary,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  headerTitle: { color: Colors.white, fontFamily: FontFamily.bold, fontSize: FontSize.lg },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, gap: Spacing.md },
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadow.sm,
  },
  formTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  formLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  modeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.sm },
  modeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: '#eef2f7',
  },
  modeChipActive: { backgroundColor: Colors.primary },
  modeChipText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.textPrimary },
  modeChipTextActive: { color: Colors.white },
  input: {
    backgroundColor: '#eef2f7',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  saveButtonText: { color: Colors.white, fontFamily: FontFamily.bold, fontSize: FontSize.md },
  emptyState: { alignItems: 'center', padding: Spacing['2xl'], gap: Spacing.sm },
  emptyText: { fontFamily: FontFamily.regular, fontSize: FontSize.md, color: Colors.textSecondary },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
  },
  emptyButtonText: { color: Colors.white, fontFamily: FontFamily.bold, fontSize: FontSize.sm },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    ...Shadow.sm,
  },
  methodIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eaf2ff',
  },
  methodInfo: { flex: 1 },
  methodAlias: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.textPrimary },
  methodMode: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textSecondary },
  methodActions: { alignItems: 'flex-end', gap: 8 },
  defaultBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  defaultBadgeText: { color: Colors.white, fontFamily: FontFamily.bold, fontSize: 10 },
  setDefaultText: { color: Colors.primary, fontFamily: FontFamily.bold, fontSize: FontSize.xs },
});
