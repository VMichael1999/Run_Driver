import React from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import type { CountryOption } from '@shared/types';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { BorderRadius, Spacing } from '@theme/spacing';

interface Props {
  visible: boolean;
  countries: CountryOption[];
  onClose: () => void;
  onSelect: (country: CountryOption) => void;
}

function getFlagEmoji(countryCode: string): string {
  const code = countryCode.replace('+', '').trim();
  if (code === '51') return '🇵🇪';
  if (code === '54') return '🇦🇷';
  if (code === '56') return '🇨🇱';
  return '🌎';
}

export function CountryBottomSheet({ visible, countries, onClose, onSelect }: Props) {
  const [query, setQuery] = React.useState('');
  const filtered = countries.filter((country) => `${country.value} ${country.code}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Seleccione su pais</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar un pais"
            placeholderTextColor={Colors.textDisabled}
            style={styles.search}
          />
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.item}
                activeOpacity={0.8}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text style={styles.flag}>{getFlagEmoji(item.code)}</Text>
                <Text style={styles.itemText}>
                  {item.value} ({item.code})
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    maxHeight: '78%',
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    color: Colors.textPrimary,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
  },
  close: {
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  search: {
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    color: Colors.textPrimary,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    marginBottom: Spacing.md,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  flag: {
    marginRight: Spacing.sm,
    fontSize: 18,
  },
  itemText: {
    color: Colors.textPrimary,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
  },
});
