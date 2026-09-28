import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { UserNetworkAvatar } from '../avatar/UserNetworkAvatar';
import { AppButton } from '../ui/AppButton';
import { aspectosCalificacion, type Aspecto } from '@data/aspectosCalificacion';
import { Colors } from '@theme/colors';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius } from '@theme/spacing';

export interface CalificacionUser {
  nombres: string;
  cantViajes: number;
  imageUrl: string;
  rol: string;
}

export interface Calificacion {
  puntuacion: number;
  aspectos: Aspecto[];
  comentario?: string;
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
  fareAmount?: number;
  currency?: string;
  durationMinutes?: number;
  vehicleImageSource?: any;
}

export function CalificacionModal({
  visible,
  user,
  onClose,
  onSend,
  destination,
  paymentMethod = 'Efectivo',
  fareAmount = 24.0,
  currency = 'S/',
  durationMinutes = 19,
}: Props) {
  const theme = useAppTheme();
  const [rating, setRating] = useState(5);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!visible) {
      setRating(5);
      setSelected(new Set());
      setComment('');
    }
  }, [visible]);

  const toggleAspecto = (id: number) => {
    Haptics.selectionAsync();
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectStar = (stars: number) => {
    Haptics.selectionAsync();
    setRating(stars);
  };

  const handleSend = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const aspectos = aspectosCalificacion.filter((a) => selected.has(a.id));
    onSend({
      puntuacion: rating,
      aspectos,
      comentario: comment.trim() || undefined,
    });
  };

  const handleSkip = () => {
    Haptics.selectionAsync();
    onClose();
  };

  const firstName = user.nombres.split(' ')[0] || user.nombres;
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={[styles.screen, { backgroundColor: theme.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.topBar}>
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: theme.surfaceMuted }]}
            onPress={onClose}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Cerrar calificación"
          >
            <Ionicons name="close" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Confirmación de llegada y pago */}
          <View style={[styles.doneCard, { backgroundColor: theme.surface, borderColor: theme.divider }]}>
            <View style={styles.doneIconWrap}>
              <Ionicons name="checkmark-circle" size={32} color={Colors.success} />
            </View>
            <View style={styles.doneTextWrap}>
              <Text style={[styles.doneTitle, { color: theme.text }]} numberOfLines={2}>
                Llegaste a {destination || 'tu destino'}
              </Text>
              <Text style={[styles.doneSubtitle, { color: theme.textMuted }]}>
                {timeStr} · {durationMinutes} min · {currency} {fareAmount.toFixed(2)} en {paymentMethod.toLowerCase()}
              </Text>
            </View>
          </View>

          {/* Pregunta sobre el conductor */}
          <View style={styles.driverSection}>
            <UserNetworkAvatar imageUrl={user.imageUrl} radius={26} />
            <Text style={[styles.driverQuestion, { color: theme.text }]}>
              ¿Cómo te fue con {firstName}?
            </Text>
          </View>

          {/* Estrellas */}
          <View
            style={styles.starsRow}
            accessibilityRole="radiogroup"
            accessibilityLabel={`Calificación actual: ${rating} de 5 estrellas`}
          >
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = star <= rating;
              return (
                <TouchableOpacity
                  key={star}
                  onPress={() => handleSelectStar(star)}
                  activeOpacity={0.7}
                  style={styles.starTouchable}
                  accessibilityRole="button"
                  accessibilityLabel={`${star} estrella${star > 1 ? 's' : ''}`}
                >
                  <Ionicons
                    name={isFilled ? 'star' : 'star-outline'}
                    size={38}
                    color={isFilled ? Colors.star : theme.divider}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Aspectos de calificación */}
          <View style={styles.aspectsSection}>
            <Text style={[styles.aspectsTitle, { color: theme.text }]}>¿Qué te gustó?</Text>
            <View style={styles.chipsContainer}>
              {aspectosCalificacion.map((aspecto) => {
                const isSelected = selected.has(aspecto.id);
                return (
                  <TouchableOpacity
                    key={aspecto.id}
                    onPress={() => toggleAspecto(aspecto.id)}
                    activeOpacity={0.8}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected ? Colors.accentLime : theme.surfaceMuted,
                        borderColor: isSelected ? Colors.accentLime : theme.divider,
                      },
                    ]}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected }}
                    accessibilityLabel={aspecto.valor}
                  >
                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={14}
                        color={Colors.onAccentLime}
                        style={styles.chipCheck}
                      />
                    )}
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color: isSelected ? Colors.onAccentLime : theme.text,
                          fontFamily: isSelected ? FontFamily.semibold : FontFamily.regular,
                        },
                      ]}
                    >
                      {aspecto.valor}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Comentario opcional */}
          <View style={styles.commentSection}>
            <TextInput
              style={[
                styles.commentInput,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.divider,
                  color: theme.text,
                },
              ]}
              placeholder="Comentario opcional"
              placeholderTextColor={theme.textDisabled}
              value={comment}
              onChangeText={setComment}
              maxLength={200}
              multiline
              numberOfLines={3}
              accessibilityLabel="Comentario opcional sobre el viaje"
            />
          </View>

          {/* Botones de acción */}
          <View style={styles.actionButtons}>
            <AppButton
              label="Enviar calificación"
              variant="sig"
              size="md"
              onPress={handleSend}
              accessibilityLabel="Enviar calificación del viaje"
            />
            <TouchableOpacity
              onPress={handleSkip}
              style={styles.skipButton}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Omitir calificación"
            >
              <Text style={[styles.skipButtonText, { color: theme.textMuted }]}>Omitir</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  doneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  doneIconWrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneTextWrap: {
    flex: 1,
  },
  doneTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.md,
    lineHeight: 22,
  },
  doneSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  driverSection: {
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  driverQuestion: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    marginVertical: Spacing.md,
  },
  starTouchable: {
    padding: Spacing.xs,
  },
  aspectsSection: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  aspectsTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    marginBottom: Spacing.sm,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  chipCheck: {
    marginRight: 4,
  },
  chipText: {
    fontSize: FontSize.sm,
  },
  commentSection: {
    marginBottom: Spacing.xl,
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    minHeight: 76,
    textAlignVertical: 'top',
  },
  actionButtons: {
    gap: Spacing.md,
    alignItems: 'center',
  },
  skipButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  skipButtonText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
  },
});
