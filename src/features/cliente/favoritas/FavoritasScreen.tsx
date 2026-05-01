import React from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
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
import { useFavoriteAddressesStore, type FavoriteAddress } from '@store/useFavoriteAddressesStore';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';

type Nav = NativeStackNavigationProp<ClienteStackParamList, 'Favoritas'>;

export function FavoritasScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
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
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.85}>
          <Ionicons name="chevron-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Direcciones favoritas</Text>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('SearchAddress', { target: 'destination', saveFavorite: true })}
        >
          <Ionicons name="add" size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + Spacing['2xl'] }]}
      >
        {favorites.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="bookmark-outline" size={42} color={Colors.textDisabled} />
            <Text style={styles.emptyText}>Aun no tienes direcciones favoritas.</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('SearchAddress', { target: 'destination', saveFavorite: true })}
              activeOpacity={0.85}
            >
              <Text style={styles.emptyButtonText}>Agregar una</Text>
            </TouchableOpacity>
          </View>
        ) : (
          favorites.map((favorite, index) => {
            const isFirst = index === 0;
            const isLast = index === favorites.length - 1;
            return (
              <View key={favorite.id} style={styles.card}>
                <View style={styles.dot} />
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName} numberOfLines={1}>
                    {favorite.placeName}
                  </Text>
                  <Text style={styles.cardCoords}>
                    {favorite.position.latitude.toFixed(4)}, {favorite.position.longitude.toFixed(4)}
                  </Text>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    onPress={() => moveFavorite(favorite.id, 'up')}
                    disabled={isFirst}
                    activeOpacity={0.85}
                    style={[styles.iconButton, isFirst && styles.iconDisabled]}
                  >
                    <Ionicons name="chevron-up" size={18} color={Colors.textPrimary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => moveFavorite(favorite.id, 'down')}
                    disabled={isLast}
                    activeOpacity={0.85}
                    style={[styles.iconButton, isLast && styles.iconDisabled]}
                  >
                    <Ionicons name="chevron-down" size={18} color={Colors.textPrimary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => openEditor(favorite)}
                    activeOpacity={0.85}
                    style={styles.iconButton}
                  >
                    <Ionicons name="create-outline" size={18} color={Colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => confirmRemove(favorite)}
                    activeOpacity={0.85}
                    style={styles.iconButton}
                  >
                    <Ionicons name="trash-outline" size={18} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal visible={editing !== null} transparent animationType="fade" onRequestClose={closeEditor}>
        <KeyboardAvoidingView
          style={styles.modalRoot}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Renombrar direccion</Text>
            <TextInput
              style={styles.modalInput}
              value={draftName}
              onChangeText={setDraftName}
              placeholder="Nombre"
              placeholderTextColor={Colors.textDisabled}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={closeEditor} style={[styles.modalButton, styles.modalButtonGhost]} activeOpacity={0.85}>
                <Text style={styles.modalButtonGhostText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveEdit} style={styles.modalButton} activeOpacity={0.85}>
                <Text style={styles.modalButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
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
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, gap: Spacing.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    ...Shadow.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  cardInfo: { flex: 1 },
  cardName: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.textPrimary },
  cardCoords: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textDisabled },
  cardActions: { flexDirection: 'row', gap: 4 },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    backgroundColor: '#eef2f7',
  },
  iconDisabled: { opacity: 0.4 },
  emptyState: { alignItems: 'center', padding: Spacing['2xl'], gap: Spacing.sm },
  emptyText: { fontFamily: FontFamily.regular, fontSize: FontSize.md, color: Colors.textSecondary },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
  },
  emptyButtonText: { color: Colors.white, fontFamily: FontFamily.bold, fontSize: FontSize.sm },
  modalRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: Spacing.xl,
  },
  modalCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  modalTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: Colors.textPrimary },
  modalInput: {
    backgroundColor: '#eef2f7',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.sm },
  modalButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  modalButtonText: { color: Colors.white, fontFamily: FontFamily.bold, fontSize: FontSize.sm },
  modalButtonGhost: { backgroundColor: 'transparent' },
  modalButtonGhostText: { color: Colors.textSecondary, fontFamily: FontFamily.bold, fontSize: FontSize.sm },
});
