import React from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing } from '@theme/spacing';

interface SwipeableFavoriteItemProps {
  id: string;
  placeName: string;
  onPress: () => void;
  onDelete: (id: string) => void;
}

export function SwipeableFavoriteItem({ id, placeName, onPress, onDelete }: SwipeableFavoriteItemProps) {
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
      <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.85}>
        <View style={styles.dot} />
        <Text style={styles.itemText} numberOfLines={1}>
          {placeName}
        </Text>
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
