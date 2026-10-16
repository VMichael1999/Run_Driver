import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Reanimated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useDeliveryColors } from '../theme';
import { useStatusBarStyle } from '../hooks/useStatusBarStyle';
import { DeliveryDrawer } from '../components/DeliveryDrawer';
import { HomeHeader } from '../components/inicio/HomeHeader';
import { CategoryStrip, DealStrip, HeroBanner, SectionHeader } from '../components/inicio/HomeBlocks';
import { OrderPill } from '../components/inicio/OrderPill';
import { RestaurantCard } from '../components/RestaurantCard';
import { ACTIVE_ORDER, CATEGORIES, DEALS, HOME_SECTIONS, RESTAURANTS } from '../data/mock';

/** Alto de la cabecera abierta sin la barra de estado: 10 + fila de dirección 40 + 12 + buscador 46 + 14. */
const HEADER_BODY = 122;
/** El aviso del pedido queda 21 por encima de la barra de pestañas (bottom:90px sobre una barra de 68.8). */
const PILL_GAP = 21;
const PILL_HEIGHT = 58;

/** Inicio de delivery (del-03 / del-04). */
export function DeliveryInicioScreen() {
  const colors = useDeliveryColors();
  const insets = useSafeAreaInsets();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [categoryId, setCategoryId] = React.useState(CATEGORIES[0].id);
  const scrollY = useSharedValue(0);
  // La cabecera es oscura (.sb.w).
  useStatusBarStyle('light');

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const noop = React.useCallback(() => undefined, []);

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <Reanimated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + HEADER_BODY + 4, paddingBottom: PILL_GAP + PILL_HEIGHT + 14 },
        ]}
      >
        <HeroBanner />
        <SectionHeader title="Categorías" onSeeAll={noop} />
        <CategoryStrip categories={CATEGORIES} selectedId={categoryId} onSelect={setCategoryId} />
        <SectionHeader title="Ofertas para ti" onSeeAll={noop} />
        <DealStrip deals={DEALS} />
        {HOME_SECTIONS.map((section) => (
          <React.Fragment key={section.id}>
            <SectionHeader title={section.title} onSeeAll={noop} />
            <View style={styles.grid}>
              {section.restaurantIds.map((id) => (
                <RestaurantCard key={id} restaurant={RESTAURANTS[id]} />
              ))}
            </View>
          </React.Fragment>
        ))}
      </Reanimated.ScrollView>

      <HomeHeader topInset={insets.top} scrollY={scrollY} onAvatarPress={() => setDrawerOpen(true)} />
      <OrderPill status={ACTIVE_ORDER.status} bottom={PILL_GAP} />
      <DeliveryDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  // .pad: padding 4 14 14, gap 12
  content: {
    paddingHorizontal: 14,
    gap: 12,
  },
  grid: {
    flexDirection: 'row',
    gap: 10,
  },
});
