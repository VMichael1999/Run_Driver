import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { DriverAlert } from '@shared/types';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { BorderRadius } from '@theme/spacing';
import { formatDistance } from '@shared/utils/mapUtils';
import { CountdownButton } from './CountdownButton';

interface DriverOfferCardProps {
  driver: DriverAlert;
  startTime: Date;
  totalDurationSeconds?: number;
  offeredFare: number;
  onAccept: () => void;
  onReject: () => void;
  /** La oferta venció: la lista la retira. */
  onExpired?: () => void;
}

function initials(name: string) {
  return name
    .replace('.', '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

/** Tarjeta de oferta del diseño (.off). El tiempo restante vive en el botón "Aceptar". */
export function DriverOfferCard({
  driver,
  startTime,
  totalDurationSeconds = 25,
  offeredFare,
  onAccept,
  onReject,
  onExpired,
}: DriverOfferCardProps) {
  const theme = useAppTheme();
  const startedAt = startTime.getTime();
  const durationMs = totalDurationSeconds * 1000;
  const [secondsLeft, setSecondsLeft] = React.useState(() =>
    Math.max(0, Math.ceil((durationMs - (Date.now() - startedAt)) / 1000)),
  );

  React.useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft(Math.max(0, Math.ceil((durationMs - (Date.now() - startedAt)) / 1000)));
    }, 1000);
    return () => clearInterval(id);
  }, [durationMs, startedAt]);

  const diff = Number((driver.price - offeredFare).toFixed(2));
  const isYourPrice = Math.abs(diff) < 0.01;
  const priceLabel = `${driver.currency} ${driver.price.toFixed(2)}`;

  return (
    <View
      style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.line }]}
      accessible={false}
    >
      <View style={styles.top}>
        <View style={[styles.avatar, { backgroundColor: theme.text }]}>
          <Text style={[styles.avatarText, { color: theme.surface }]}>{initials(driver.driverName)}</Text>
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
            {driver.driverName}
          </Text>
          <Text style={[styles.meta, { color: theme.textMuted }]} numberOfLines={1}>
            ★ {driver.rating.toFixed(1)} · {driver.vehicleModel} {driver.vehicleColor.toLowerCase()} · {driver.vehiclePlate}
          </Text>
        </View>
        <View style={styles.priceBlock}>
          <Text style={[styles.price, { color: theme.text }]}>{priceLabel}</Text>
          <View
            style={[
              styles.tag,
              { backgroundColor: isYourPrice ? theme.onlineSoft : theme.background },
            ]}
          >
            <Text style={[styles.tagText, { color: isYourPrice ? theme.online : theme.textMuted }]}>
              {isYourPrice ? 'Tu precio' : `${diff > 0 ? '+' : '−'} S/ ${Math.abs(diff).toFixed(2)}`}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={[styles.small, { color: theme.textMuted }]}>
          Llega en {driver.etaMinutes} min · {formatDistance(driver.distanceKm)}
        </Text>
        <Text style={[styles.small, { color: theme.textMuted }]} accessibilityLabel={`Vence en ${secondsLeft} segundos`}>
          {secondsLeft} s
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.ignore, { borderColor: theme.line }]}
          onPress={onReject}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Ignorar oferta de ${driver.driverName}`}
        >
          <Text style={[styles.ignoreText, { color: theme.textMuted }]}>Ignorar</Text>
        </TouchableOpacity>
        <CountdownButton
          style={styles.accept}
          label={`Aceptar ${priceLabel}`}
          accessibilityLabel={`Aceptar oferta de ${driver.driverName} por ${priceLabel}. Vence en ${secondsLeft} segundos`}
          onPress={onAccept}
          startedAt={startedAt}
          durationMs={durationMs}
          onExpire={onExpired}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.body,
  },
  meta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
  },
  priceBlock: {
    alignItems: 'flex-end',
    gap: 2,
  },
  price: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
  },
  tag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  tagText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize['2xs'],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  small: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.caption,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  ignore: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ignoreText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
  },
  accept: {
    flex: 1.6,
  },
});
