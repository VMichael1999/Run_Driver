import React from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { Colors } from '@theme/colors';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing } from '@theme/spacing';

interface SwipeableFavoriteItemProps {
  id: string;
  placeName: string;
  onPress: () => void;
  onDelete: (id: string) => void;
  loading?: boolean;
  disabled?: boolean;
}

export function SwipeableFavoriteItem({ id, placeName, onPress, onDelete, loading = false, disabled = false }: SwipeableFavoriteItemProps) {
  const theme = useAppTheme();
  const swipeableRef = React.useRef<Swipeable | null>(null);

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
      >
        <Animated.View style={[styles.deleteContent, { transform: [{ scale }] }]}>
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
        style={[styles.item, { backgroundColor: theme.surfaceMuted }, disabled && styles.itemDisabled]}
        onPress={onPress}
        activeOpacity={0.85}
        disabled={disabled}
      >
        <View style={[styles.dot, { backgroundColor: theme.accent }]} />
        <Text style={[styles.itemText, { color: theme.text }]} numberOfLines={1}>
          {placeName}
        </Text>
        {loading ? <ActivityIndicator size="small" color={theme.accent} /> : null}
      </TouchableOpacity>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fbff',
    borderRadius: 14,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  itemDisabled: {
    opacity: 0.72,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1d5fa8',
    marginRight: Spacing.sm,
  },
  itemText: {
    flex: 1,
    color: '#334155',
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
  },
  deleteAction: {
    width: 70,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: Spacing.xs,
  },
  deleteContent: {
    width: 56,
    height: '85%',
    borderRadius: 14,
    backgroundColor: '#e53e3e',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
