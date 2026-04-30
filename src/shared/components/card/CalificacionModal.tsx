import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserNetworkAvatar } from '../avatar/UserNetworkAvatar';
import { aspectosCalificacion, type Aspecto } from '@data/aspectosCalificacion';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';

export interface CalificacionUser {
  nombres: string;
  cantViajes: number;
  imageUrl: string;
  rol: string;
}

export interface Calificacion {
  puntuacion: number;
  aspectos: Aspecto[];
}

interface Props {
  visible: boolean;
  user: CalificacionUser;
  onClose: () => void;
  onSend: (calificacion: Calificacion) => void;
  vehicleModel?: string;
  vehiclePlate?: string;
  origin?: string;
  destination?: string;
  paymentMethod?: string;
  vehicleImageSource?: any;
}

export function CalificacionModal({
  visible,
  user,
  onClose,
  onSend,
  vehicleModel,
  vehiclePlate,
  origin,
  destination,
  paymentMethod,
  vehicleImageSource,
}: Props) {
  const [rating, setRating] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!visible) {
      setRating(0);
      setSelected(new Set());
    }
  }, [visible]);

  const toggleAspecto = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSend = () => {
    const aspectos = aspectosCalificacion.filter((a) => selected.has(a.id));
    onSend({ puntuacion: rating, aspectos });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.screen}>
        <View style={styles.topHandle} />

        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={onClose} activeOpacity={0.85}>
            <Ionicons name="close" size={18} color="#334155" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Has llegado</Text>
          <TouchableOpacity style={styles.headerButton} activeOpacity={0.85}>
            <Ionicons name="share-social-outline" size={18} color="#334155" />
          </TouchableOpacity>
        </View>

        <View style={styles.noticeBanner}>
          <Text style={styles.noticeText}>Asegurate de no olvidar tus pertenencias</Text>
          <Ionicons name="eye-outline" size={14} color={Colors.white} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroSection}>
            {vehicleImageSource ? (
              <Image source={vehicleImageSource} style={styles.heroCar} resizeMode="contain" />
            ) : null}
            <View style={styles.heroAvatarWrap}>
              <UserNetworkAvatar imageUrl={user.imageUrl} radius={22} />
            </View>
          </View>

          <Text style={styles.userName}>{user.nombres}</Text>
          <Text style={styles.userVehicleMeta}>
            {vehicleModel || 'Vehiculo'} • {vehiclePlate || 'L-2323-RF'}
          </Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Viaje completado</Text>
              <Text style={styles.infoValue}>GoCab#2252031636</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fecha</Text>
              <Text style={styles.infoValue}>Lunes, 22 mayo 2023</Text>
            </View>
          </View>

          <View style={styles.ratingBlock}>
            <Text style={styles.ratingTitle}>¿Como estuvo tu viaje?</Text>
            <Text style={styles.ratingSubtitle}>Dale de una a cinco estrellas a tu viaje</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.8}>
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={34}
                    color={star <= rating ? '#f3c623' : '#d8dee7'}
                    style={styles.starIcon}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailTitle}>Detalle del viaje</Text>
              <View style={styles.coinsBadge}>
                <Ionicons name="leaf-outline" size={12} color="#1e7d4d" />
                <Text style={styles.coinsText}>+3023 coins</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Recojo</Text>
              <Text style={styles.detailValue}>{origin || 'Ubicacion de origen'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Destino</Text>
              <Text style={styles.detailValue}>{destination || 'Ubicacion de destino'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Metodo de pago</Text>
              <Text style={styles.detailValue}>{paymentMethod || 'Efectivo'}</Text>
            </View>

            <View style={styles.tagWrap}>
              {aspectosCalificacion.slice(0, 4).map((a) => {
                const isSelected = selected.has(a.id);
                return (
                  <TouchableOpacity
                    key={a.id}
                    style={[styles.tagChip, isSelected && styles.tagChipSelected]}
                    onPress={() => toggleAspecto(a.id)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.tagChipText, isSelected && styles.tagChipTextSelected]}>
                      {a.valor}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.primaryButtonSingle} onPress={handleSend} activeOpacity={0.85}>
            <Text style={styles.primaryButtonText}>Calificar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  topHandle: {
    alignSelf: 'center',
    width: 56,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#d7dee9',
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  headerButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#e7ebf2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#111827',
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
  },
  noticeBanner: {
    backgroundColor: '#3151ff',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  noticeText: {
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontSize: 12,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  heroCar: {
    width: 144,
    height: 72,
  },
  heroAvatarWrap: {
    position: 'absolute',
    right: '34%',
    bottom: 0,
    borderWidth: 2,
    borderColor: Colors.white,
    borderRadius: BorderRadius.full,
  },
  userName: {
    textAlign: 'center',
    color: '#111827',
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
  },
  userVehicleMeta: {
    textAlign: 'center',
    color: '#5b6778',
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    marginTop: 4,
    marginBottom: Spacing.md,
  },
  infoGrid: {
    borderBottomWidth: 1,
    borderBottomColor: '#edf1f6',
    paddingBottom: Spacing.md,
    marginBottom: Spacing.lg,
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  infoLabel: {
    color: '#111827',
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
  },
  infoValue: {
    flex: 1,
    textAlign: 'right',
    color: '#4b5563',
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
  },
  ratingBlock: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  ratingTitle: {
    color: '#111827',
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    marginBottom: 4,
  },
  ratingSubtitle: {
    color: '#6b7280',
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    marginBottom: Spacing.md,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginHorizontal: 5,
  },
  detailCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#edf1f6',
    backgroundColor: '#ffffff',
    padding: Spacing.md,
    ...Shadow.sm,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  detailTitle: {
    color: '#111827',
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
  },
  coinsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#edf9f1',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  coinsText: {
    color: '#1e7d4d',
    fontFamily: FontFamily.bold,
    fontSize: 11,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingVertical: 6,
  },
  detailLabel: {
    color: '#111827',
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    width: 92,
  },
  detailValue: {
    flex: 1,
    textAlign: 'right',
    color: '#475569',
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: Spacing.md,
  },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    backgroundColor: '#f3f6fb',
  },
  tagChipSelected: {
    backgroundColor: '#3151ff',
  },
  tagChipText: {
    color: '#334155',
    fontFamily: FontFamily.bold,
    fontSize: 12,
  },
  tagChipTextSelected: {
    color: Colors.white,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#edf1f6',
  },
  primaryButtonSingle: {
    borderRadius: BorderRadius.full,
    backgroundColor: '#3151ff',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
  },
});
