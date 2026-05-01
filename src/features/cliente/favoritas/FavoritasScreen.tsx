import React from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ClienteStackParamList } from '@navigation/types';
import { useFavoriteAddressesStore, type FavoriteAddress } from '@store/useFavoriteAddressesStore';
import { AppButton, AppCard, AppHeader, AppListRow, AppScreen, AppTextInput } from '@shared/components/ui';
import { Colors } from '@theme/colors';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { BorderRadius, Spacing } from '@theme/spacing';

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
      Alert.alert('Nombre requerido', 'Asigna un nombre a la direccion.');
      return;
    }
    renameFavorite(editing.id, draftName);
    closeEditor();
  };

  const confirmRemove = (favorite: FavoriteAddress) => {
    Alert.alert('Eliminar direccion', `Quieres eliminar ${favorite.placeName}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => removeFavorite(favorite.id) },
    ]);
  };

  return (
    <AppScreen>
      <AppHeader
        title="Direcciones favoritas"
        right={(
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: theme.accent }]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('SearchAddress', { target: 'destination', saveFavorite: true })}
          >
            <Ionicons name="add" size={22} color={Colors.white} />
          </TouchableOpacity>
        )}
      />

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + Spacing['2xl'] }]}>
        {favorites.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="bookmark-outline" size={42} color={theme.textDisabled} />
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>Aun no tienes direcciones favoritas.</Text>
            <AppButton
              label="Agregar una"
              onPress={() => navigation.navigate('SearchAddress', { target: 'destination', saveFavorite: true })}
              style={styles.emptyButton}
              labelStyle={styles.emptyButtonText}
            />
          </View>
        ) : (
          favorites.map((favorite, index) => {
            const isFirst = index === 0;
            const isLast = index === favorites.length - 1;

            return (
              <AppCard key={favorite.id} padded={false}>
                <AppListRow
                  title={favorite.placeName}
                  subtitle={`${favorite.position.latitude.toFixed(4)}, ${favorite.position.longitude.toFixed(4)}`}
                  left={<View style={[styles.dot, { backgroundColor: theme.accent }]} />}
                  right={(
                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        onPress={() => moveFavorite(favorite.id, 'up')}
                        disabled={isFirst}
                        activeOpacity={0.85}
                        style={[styles.iconButton, { backgroundColor: theme.surfaceMuted }, isFirst && styles.iconDisabled]}
                      >
                        <Ionicons name="chevron-up" size={18} color={theme.text} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => moveFavorite(favorite.id, 'down')}
                        disabled={isLast}
                        activeOpacity={0.85}
                        style={[styles.iconButton, { backgroundColor: theme.surfaceMuted }, isLast && styles.iconDisabled]}
                      >
                        <Ionicons name="chevron-down" size={18} color={theme.text} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => openEditor(favorite)} activeOpacity={0.85} style={[styles.iconButton, { backgroundColor: theme.surfaceMuted }]}>
                        <Ionicons name="create-outline" size={18} color={theme.accent} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => confirmRemove(favorite)} activeOpacity={0.85} style={[styles.iconButton, { backgroundColor: theme.surfaceMuted }]}>
                        <Ionicons name="trash-outline" size={18} color={Colors.error} />
                      </TouchableOpacity>
                    </View>
                  )}
                  style={styles.favoriteRow}
                />
              </AppCard>
            );
          })
        )}
      </ScrollView>

      <Modal visible={editing !== null} transparent animationType="fade" onRequestClose={closeEditor}>
        <KeyboardAvoidingView style={styles.modalRoot} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <AppCard style={styles.modalCard}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Renombrar direccion</Text>
            <AppTextInput value={draftName} onChangeText={setDraftName} placeholder="Nombre" autoFocus />
            <View style={styles.modalActions}>
              <AppButton label="Cancelar" variant="ghost" onPress={closeEditor} style={styles.modalButton} />
              <AppButton label="Guardar" onPress={saveEdit} style={styles.modalButton} />
            </View>
          </AppCard>
        </KeyboardAvoidingView>
      </Modal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.sm,
  },
  favoriteRow: {
    paddingHorizontal: Spacing.md,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 4,
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
  },
  iconDisabled: {
    opacity: 0.4,
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing['2xl'],
    gap: Spacing.sm,
  },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
  },
  emptyButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
  },
  emptyButtonText: {
    fontSize: FontSize.sm,
  },
  modalRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: Spacing.xl,
  },
  modalCard: {
    width: '100%',
    gap: Spacing.md,
  },
  modalTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
  modalButton: {
    borderRadius: BorderRadius.md,
    paddingVertical: 10,
  },
});
