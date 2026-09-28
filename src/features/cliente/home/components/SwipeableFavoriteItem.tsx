import React from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { Colors } from '@theme/colors';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius } from '@theme/spacing';

interface SwipeableFavoriteItemProps {
  id: string;
  placeName: string;
  address?: string;
  onPress: () => void;
  onDelete: (id: string) => void;
  loading?: boolean;
  disabled?: boolean;
}

export function SwipeableFavoriteItem({
  id,
  placeName,
  address,
  onPress,
  onDelete,
  loading = false,
  disabled = false,
}: SwipeableFavoriteItemProps) {
  const theme = useAppTheme();
  const swipeableRef = React.useRef<Swipeable | null>(null);

  const getIconName = (): keyof typeof Ionicons.glyphMap => {
    const lower = placeName.toLowerCase();
    if (lower.includes('casa') || lower.includes('hogar')) return 'home-outline';
    if (lower.includes('trabajo') || lower.includes('oficina')) return 'briefcase-outline';
    if (lower.includes('aeropuerto')) return 'airplane-outline';
    if (lower.includes('gym') || lower.includes('gimnasio')) return 'barbell-outline';
    return 'location-outline';
  };

  const renderRightActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0.6],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => {
          swipeableRef.current?.close();
          onDelete(id);
        }}
        activeOpacity={0.85}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`Eliminar ${placeName} de favoritos`}
      >
        <Animated.View style={[styles.deleteContent, { backgroundColor: theme.danger, transform: [{ scale }] }]}>
          <Ionicons name="trash-outline" size={20} color={Colors.white} />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      rightThreshold={40}
    >
      <TouchableOpacity
        style={[
          styles.item,
          { backgroundColor: theme.surfaceMuted, borderColor: theme.line },
          disabled && styles.itemDisabled,
        ]}
        onPress={onPress}
        activeOpacity={0.8}
        disabled={disabled}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`Seleccionar destino favorito ${placeName}`}
      >
        <View style={[styles.iconWrap, { backgroundColor: theme.surface }]}>
          <Ionicons name={getIconName()} size={18} color={theme.text} />
        </View>

        <View style={styles.textWrap}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {placeName}
          </Text>
          {address ? (
            <Text style={[styles.subtitle, { color: theme.textMuted }]} numberOfLines={1}>
              {address}
            </Text>
          ) : null}
        </View>

        {loading ? <ActivityIndicator size="small" color={theme.primary} /> : null}
      </TouchableOpacity>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  itemDisabled: {
    opacity: 0.6,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
  },
  deleteAction: {
    width: 70,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: Spacing.xs,
  },
  deleteContent: {
    width: 52,
    height: '85%',
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
