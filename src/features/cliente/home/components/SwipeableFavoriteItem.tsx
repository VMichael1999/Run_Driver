import React from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { Colors } from '@theme/colors';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius } from '@theme/spacing';
import { AppIcon, type AppIconName } from '@shared/components/ui/AppIcon';

interface SwipeableFavoriteItemProps {
  id: string;
  placeName: string;
  address?: string;
  onPress: () => void;
  onDelete: (id: string) => void;
  loading?: boolean;
  disabled?: boolean;
  showDivider?: boolean;
}

export function SwipeableFavoriteItem({
  id,
  placeName,
  address,
  onPress,
  onDelete,
  loading = false,
  disabled = false,
  showDivider = false,
}: SwipeableFavoriteItemProps) {
  const theme = useAppTheme();
  const swipeableRef = React.useRef<Swipeable | null>(null);

  const getIconName = (): AppIconName => {
    const lower = placeName.toLowerCase();
    if (lower.includes('casa') || lower.includes('hogar')) return 'home';
    if (lower.includes('trabajo') || lower.includes('oficina')) return 'brief';
    return 'pin';
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
          { backgroundColor: theme.surface },
          showDivider && { borderTopWidth: 1, borderTopColor: theme.line },
          disabled && styles.itemDisabled,
        ]}
        onPress={onPress}
        activeOpacity={0.8}
        disabled={disabled}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`Seleccionar destino favorito ${placeName}`}
      >
        <View style={[styles.iconWrap, { backgroundColor: theme.background }]}>
          <AppIcon name={getIconName()} color={theme.text} />
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
    paddingHorizontal: 2,
    paddingVertical: 8,
    gap: 12,
  },
  itemDisabled: {
    opacity: 0.6,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.body,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.caption,
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
