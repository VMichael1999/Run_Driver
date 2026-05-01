import React, { useRef } from 'react'
import { Animated, PanResponder, View, Text, StyleSheet } from 'react-native'

type Props = {
  onDelete: () => void
  children: React.ReactNode
  height?: number
  backColor?: string
}

const SWIPE_THRESHOLD = 80

export function SwipeToDelete({ onDelete, children, height = 60, backColor }: Props) {
  const translateX = useRef(new Animated.Value(0)).current
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > Math.abs(gs.dy),
      onPanResponderMove: (_, gs) => {
        if (gs.dx < 0) {
          translateX.setValue(gs.dx)
        }
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dx < -SWIPE_THRESHOLD) {
          Animated.timing(translateX, {
            toValue: -200,
            duration: 150,
            useNativeDriver: true,
          }).start(() => onDelete())
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start()
        }
      },
    })
  ).current

  // pick text color based on background brightness (simple heuristic)
  const deleteTextColor = backColor && typeof backColor === 'string' && (backColor.toLowerCase().includes('e5e7eb') || backColor.toLowerCase().includes('f3f4f6')) ? '#374151' : '#ffffff'
  return (
    <View style={[styles.wrapper, { height }]}> 
      <View style={[styles.back, { backgroundColor: backColor ?? '#e5e7eb' }]}> 
        <Text style={[styles.deleteText, { color: deleteTextColor }]}>Eliminar</Text>
      </View>
      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.foreground, { transform: [{ translateX }] }]}
      >
        {children}
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    overflow: 'hidden',
  },
  back: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#ff4d4f',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 16,
  },
  deleteText: {
    color: 'white',
    fontWeight: 'bold',
  },
  foreground: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 8,
    justifyContent: 'center',
    height: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
});
