import React from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import type { ClienteStackParamList } from '@navigation/types';
import {
  useFavoriteAddressesStore,
  type FavoriteAddress,
} from '@store/useFavoriteAddressesStore';
import {
  AppButton,
  AppCard,
  AppHeader,
  AppListRow,
  AppScreen,
  AppTextInput,
} from '@shared/components/ui';
import { Colors } from '@theme/colors';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { BorderRadius, Spacing, Shadow } from '@theme/spacing';

type Nav = NativeStackNavigationProp<ClienteStackParamList, 'Favoritas'>;

export function FavoritasScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const favorites = useFavoriteAddressesStore((s) => s.favorites);
  const removeFavorite = useFavoriteAddressesStore((s) => s.removeFavorite);
  const renameFavorite = useFavoriteAddressesStore((s) => s.renameFavorite);
  const moveFavorite = useFavoriteAddressesStore((s) => s.moveFavorite);

  const [editing, setEditing] = React.useState<FavoriteAddress | null>(null);
  const [draftName, setDraftName] = React.useState<string>('');

  const openEditor = (favorite: FavoriteAddress) => {
    Haptics.selectionAsync();
    setEditing(favorite);
    setDraftName(favorite.placeName);
  };

  const closeEditor = () => {
    setEditing(null);
    setDraftName('');
  };

  const saveEdit = () => {
    if (!editing) return;
    if (!draftName.trim()) {
      Alert.alert('Nombre requerido', 'Asigna un nombre a la dirección.');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    renameFavorite(editing.id, draftName);
    closeEditor();
  };

  const confirmRemove = (favorite: FavoriteAddress) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Eliminar dirección',
      `¿Deseas eliminar "${favorite.placeName}" de tus favoritos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            Haptics.selectionAsync();
            removeFavorite(favorite.id);
          },
        },
      ]
    );
  };

  return (
    <AppScreen>
      <AppHeader
        title="Direcciones favoritas"
        right={
          <TouchableOpacity
            style={[
              styles.headerAddBtn,
              { backgroundColor: Colors.accentLime, ...Shadow.sm },
            ]}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate('SearchAddress', {
                target: 'destination',
                saveFavorite: true,
              })
            }
            accessibilityRole="button"
            accessibilityLabel="Agregar nueva dirección favorita"
          >
            <Ionicons name="add" size={22} color={Colors.onAccentLime} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + Spacing['2xl'] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {favorites.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.surface }]}>
            <Ionicons name="bookmark-outline" size={44} color={theme.textDisabled} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              Aún no tienes direcciones favoritas
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
              Guarda tus lugares frecuentes para pedir viajes en un solo toque.
            </Text>
            <AppButton
              label="Agregar dirección"
              variant="sig"
              size="md"
              onPress={() =>
                navigation.navigate('SearchAddress', {
                  target: 'destination',
                  saveFavorite: true,
                })
              }
              style={styles.emptyAddButton}
            />
          </View>
        ) : (
          favorites.map((favorite, index) => {
            const isFirst = index === 0;
            const isLast = index === favorites.length - 1;

            return (
              <AppCard key={favorite.id} padded={false} style={styles.cardContainer}>
                <AppListRow
                  title={favorite.placeName}
                  subtitle={`${favorite.position.latitude.toFixed(4)}, ${favorite.position.longitude.toFixed(4)}`}
                  left={
                    <View
                      style={[
                        styles.pinIconWrap,
                        { backgroundColor: Colors.onlineSoft },
                      ]}
                    >
                      <Ionicons name="location" size={18} color={Colors.origin} />
                    </View>
                  }
                  right={
                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        onPress={() => {
                          Haptics.selectionAsync();
                          moveFavorite(favorite.id, 'up');
                        }}
                        disabled={isFirst}
                        activeOpacity={0.8}
                        style={[
                          styles.actionBtn,
                          { backgroundColor: theme.surfaceMuted },
                          isFirst && styles.btnDisabled,
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel="Mover arriba"
                      >
                        <Ionicons name="chevron-up" size={16} color={theme.text} />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          Haptics.selectionAsync();
                          moveFavorite(favorite.id, 'down');
                        }}
                        disabled={isLast}
                        activeOpacity={0.8}
                        style={[
                          styles.actionBtn,
                          { backgroundColor: theme.surfaceMuted },
                          isLast && styles.btnDisabled,
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel="Mover abajo"
                      >
                        <Ionicons name="chevron-down" size={16} color={theme.text} />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => openEditor(favorite)}
                        activeOpacity={0.8}
                        style={[styles.actionBtn, { backgroundColor: theme.surfaceMuted }]}
                        accessibilityRole="button"
                        accessibilityLabel="Renombrar dirección"
                      >
                        <Ionicons name="pencil-outline" size={16} color={theme.text} />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => confirmRemove(favorite)}
                        activeOpacity={0.8}
                        style={[styles.actionBtn, { backgroundColor: Colors.dangerSoft }]}
                        accessibilityRole="button"
                        accessibilityLabel="Eliminar dirección"
                      >
                        <Ionicons name="trash-outline" size={16} color={Colors.danger} />
                      </TouchableOpacity>
                    </View>
                  }
                  style={styles.rowStyle}
                />
              </AppCard>
            );
          })
        )}
      </ScrollView>

      {/* Modal de Renombrar Dirección */}
      <Modal
        visible={editing !== null}
        transparent
        animationType="fade"
        onRequestClose={closeEditor}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.surface, borderColor: theme.divider },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Renombrar dirección
            </Text>
            <AppTextInput
              value={draftName}
              onChangeText={setDraftName}
              placeholder="Nombre del lugar (ej. Casa, Oficina)"
              autoFocus
            />
            <View style={styles.modalButtonsRow}>
              <AppButton
                label="Cancelar"
                variant="ghost"
                size="md"
                onPress={closeEditor}
                style={styles.modalBtnHalf}
              />
              <AppButton
                label="Guardar"
                variant="sig"
                size="md"
                onPress={saveEdit}
                style={styles.modalBtnHalf}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  headerAddBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  cardContainer: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  rowStyle: {
    paddingHorizontal: Spacing.md,
    minHeight: 64,
  },
  pinIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.3,
  },
  emptyCard: {
    alignItems: 'center',
    padding: Spacing['2xl'],
    borderRadius: BorderRadius.xl,
    gap: Spacing.sm,
    marginTop: Spacing.xl,
    ...Shadow.sm,
  },
  emptyTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  emptyAddButton: {
    minWidth: 180,
  },
  modalBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: Spacing.xl,
  },
  modalCard: {
    width: '100%',
    padding: Spacing.xl,
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    gap: Spacing.md,
    ...Shadow.sheet,
  },
  modalTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  modalBtnHalf: {
    flex: 1,
  },
});
