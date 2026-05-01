import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated, Dimensions, ScrollView, TouchableOpacity } from 'react-native'
import { DriverOfferCard } from './DriverOfferCard'
import { useAppTheme } from '@theme/useAppTheme'

// Lightweight auction overlay for showing driver offers on top of the map
type AuctionOffer = any
type Props = {
  visible: boolean
  offers: AuctionOffer[]
  onAccept?: (offer: AuctionOffer) => void
  onReject?: (offer: AuctionOffer) => void
  onCancel?: () => void
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window')
const DRAWER_HEIGHT = Math.min(SCREEN_HEIGHT * 0.58, 420)

export const AuctionOverlayDrawer: React.FC<Props> = ({ visible, offers, onAccept, onReject, onCancel }) => {
  const theme = useAppTheme()
  const translateY = useRef(new Animated.Value(DRAWER_HEIGHT)).current

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: visible ? 0 : DRAWER_HEIGHT,
      duration: 260,
      useNativeDriver: true,
    }).start()
  }, [visible, translateY])

  // Do not render if not visible; the Animated.View will slide in/out
  if (!visible) {
    // render invisible placeholder to keep layout stable if needed
  }

  return (
    <Animated.View style={[styles.drawer, { backgroundColor: theme.surface, transform: [{ translateY }] }]}> 
      <View style={[styles.handle, { backgroundColor: theme.divider }]} />
      <View style={styles.header}> 
        <Text style={[styles.headerTitle, { color: theme.text }]}>Buscando conductores...</Text>
      </View>
      <ScrollView contentContainerStyle={styles.listContent} style={styles.list} showsVerticalScrollIndicator={false}>
        {offers.map((offer) => (
          <View key={offer.id} style={styles.cardContainer}>
            <DriverOfferCard
              driver={offer.driver}
              startTime={offer.startTime}
              totalDurationSeconds={offer.totalDuration}
              offeredFare={offer.offeredFare ?? offer.driver?.price ?? 0}
              onAccept={() => onAccept?.(offer)}
              onReject={() => onReject?.(offer)}
            />
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.cancelButton} onPress={onCancel} activeOpacity={0.9}>
        <Text style={styles.cancelButtonText}>CANCELAR</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  drawer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: DRAWER_HEIGHT,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  handle: {
    width: 40,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 6,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  list: {
    paddingHorizontal: 8,
  },
  listContent: {
    paddingVertical: 6,
  },
  cardContainer: {
    marginVertical: 6,
  },
  cancelButton: {
    backgroundColor: '#f87125',
    paddingVertical: 12,
    margin: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
})
