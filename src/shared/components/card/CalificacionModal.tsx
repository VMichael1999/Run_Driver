import React, { useEffect, useRef, useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { AppButton } from '../ui/AppButton';
import { AppIcon } from '../ui/AppIcon';
import { aspectosCalificacion, type Aspecto } from '@data/aspectosCalificacion';
import { Colors } from '@theme/colors';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';

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

/** Tiempo que se muestra "Calificación enviada" antes de volver al inicio. */
const SENT_CONFIRMATION_MS = 1600;

const STAR_PATH = 'M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8z';

function initials(name: string) {
  return name
    .replace('.', '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

/** Pantalla "Calificar conductor" del mockup: primero confirma la llegada y el pago, después pregunta. */
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
  const insets = useSafeAreaInsets();
  const [rating, setRating] = useState(5);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [comment, setComment] = useState('');
  // Tras enviar se muestra la confirmación y, al terminar, se entrega la calificación.
  const [sentRating, setSentRating] = useState<number | null>(null);
  const sentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!visible) {
      setRating(5);
      setSelected(new Set());
      setComment('');
      setSentRating(null);
    }
  }, [visible]);

  useEffect(
    () => () => {
      if (sentTimerRef.current) clearTimeout(sentTimerRef.current);
    },
    [],
  );

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
    if (sentRating !== null) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const calificacion: Calificacion = {
      puntuacion: rating,
      aspectos: aspectosCalificacion.filter((a) => selected.has(a.id)),
      comentario: comment.trim() || undefined,
    };
    setSentRating(rating);
    sentTimerRef.current = setTimeout(() => onSend(calificacion), SENT_CONFIRMATION_MS);
  };

  const handleSkip = () => {
    Haptics.selectionAsync();
    onClose();
  };

  const firstName = user.nombres.split(' ')[0] || user.nombres;
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      // Durante la confirmación el botón atrás no cancela: la calificación ya se envió.
      onRequestClose={sentRating === null ? onClose : () => undefined}
    >
      {sentRating !== null ? (
        <View
          style={[styles.sentScreen, { backgroundColor: theme.background }]}
          accessible
          accessibilityRole="alert"
          accessibilityLabel={`Calificación enviada. Le diste ${sentRating} estrella${sentRating > 1 ? 's' : ''} a ${firstName}.`}
        >
          <Animated.View entering={ZoomIn.duration(260)} style={[styles.sentCircle, { backgroundColor: theme.onlineSoft }]}>
            <AppIcon name="check" size={32} color={theme.online} />
          </Animated.View>
          <Animated.View entering={FadeIn.delay(120).duration(220)} style={styles.sentTextWrap}>
            <Text style={[styles.sentTitle, { color: theme.text }]}>Calificación enviada</Text>
            <Text style={[styles.sentSubtitle, { color: theme.textMuted }]}>
              Le diste {sentRating} estrella{sentRating > 1 ? 's' : ''} a {firstName}.
            </Text>
          </Animated.View>
        </View>
      ) : (
        <KeyboardAvoidingView
          style={[styles.screen, { backgroundColor: theme.background }]}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={[
              styles.pad,
              { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 22 },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Confirmación de llegada y pago */}
            <View style={styles.doneHead}>
              <View style={[styles.okCircle, { backgroundColor: theme.onlineSoft }]}>
                <AppIcon name="check" color={theme.online} />
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
            <View style={styles.pax}>
              <View style={[styles.avatar, { backgroundColor: theme.text }]}>
                <Text style={[styles.avatarText, { color: theme.surface }]}>{initials(user.nombres)}</Text>
              </View>
              <Text style={[styles.question, { color: theme.text }]}>¿Cómo te fue con {firstName}?</Text>
            </View>

            {/* Estrellas */}
            <View
              style={styles.starsRow}
              accessibilityRole="radiogroup"
              accessibilityLabel={`Calificación: ${rating} de 5`}
            >
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= rating;
                return (
                  <TouchableOpacity
                    key={star}
                    onPress={() => handleSelectStar(star)}
                    activeOpacity={0.7}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: star === rating }}
                    accessibilityLabel={`${star} estrella${star > 1 ? 's' : ''}`}
                  >
                    <Svg width={48} height={48} viewBox="0 0 24 24">
                      <Path
                        d={STAR_PATH}
                        fill={isFilled ? theme.sig : 'none'}
                        stroke={isFilled ? Colors.accentLimeEdge : theme.line}
                        strokeWidth={isFilled ? 1 : 1.6}
                        strokeLinejoin="round"
                      />
                    </Svg>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Aspectos de calificación */}
            <View style={styles.aspectsSection}>
              <Text style={[styles.aspectsTitle, { color: theme.text }]}>¿Qué te gustó?</Text>
              <View style={styles.chips}>
                {aspectosCalificacion.map((aspecto) => {
                  const isSelected = selected.has(aspecto.id);
                  return (
                    <TouchableOpacity
                      key={aspecto.id}
                      onPress={() => toggleAspecto(aspecto.id)}
                      activeOpacity={0.8}
                      style={[
                        styles.chip,
                        isSelected
                          ? { backgroundColor: theme.text, borderColor: theme.text }
                          : { borderColor: theme.line },
                      ]}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: isSelected }}
                      accessibilityLabel={aspecto.valor}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected
                            ? { color: theme.surface, fontFamily: FontFamily.semibold }
                            : { color: theme.text },
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
            <TextInput
              style={[
                styles.commentInput,
                { backgroundColor: theme.surface, borderColor: theme.line, color: theme.text },
              ]}
              placeholder="Comentario opcional"
              placeholderTextColor={theme.textMuted}
              value={comment}
              onChangeText={setComment}
              maxLength={200}
              multiline
              accessibilityLabel="Comentario opcional sobre el viaje"
            />

            <AppButton
              label="Enviar calificación"
              onPress={handleSend}
              style={styles.sendButton}
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
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  sentScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 20,
  },
  sentCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sentTextWrap: {
    alignItems: 'center',
    gap: 6,
  },
  sentTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  sentSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    textAlign: 'center',
  },
  pad: {
    paddingHorizontal: 18,
    gap: 16,
  },
  doneHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  okCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneTextWrap: {
    flex: 1,
  },
  doneTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.md,
  },
  doneSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  pax: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lead,
  },
  question: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    letterSpacing: -0.2,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  aspectsSection: {
    gap: 10,
  },
  aspectsTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  chipText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
  },
  commentInput: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    minHeight: 56,
    textAlignVertical: 'top',
  },
  sendButton: {
    height: 56,
    borderRadius: 16,
  },
  skipButton: {
    alignSelf: 'center',
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  skipButtonText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    textDecorationLine: 'underline',
  },
});
