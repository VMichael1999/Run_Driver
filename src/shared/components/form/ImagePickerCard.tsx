import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, type ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ExpandedCard } from '@shared/components/card/ExpandedCard';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { BorderRadius, Spacing } from '@theme/spacing';

interface Props {
  title: string;
  subtitle?: string;
  uri?: string | null;
  icon?: keyof typeof Ionicons.glyphMap;
  placeholderImage?: ImageSourcePropType;
  onPress: () => void;
  circular?: boolean;
}

export function ImagePickerCard({
  title,
  subtitle,
  uri,
  icon = 'document-outline',
  placeholderImage,
  onPress,
  circular = false,
}: Props) {
  return (
    <ExpandedCard>
      <Text style={styles.title}>{title}</Text>
      <View style={[styles.preview, circular && styles.previewCircle]}>
        {uri ? (
          <Image source={{ uri }} style={[styles.image, circular && styles.imageCircle]} />
        ) : placeholderImage ? (
          <Image source={placeholderImage} style={[styles.image, circular && styles.imageCircle]} resizeMode="cover" />
        ) : (
          <Ionicons name={icon} size={48} color={Colors.textSecondary} />
        )}
      </View>
      <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.85}>
        <Text style={styles.buttonText}>Anadir imagen</Text>
      </TouchableOpacity>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </ExpandedCard>
  );
}

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    color: Colors.textPrimary,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    marginBottom: Spacing.sm,
  },
  preview: {
    width: '100%',
    height: 168,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.divider,
    backgroundColor: Colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  previewCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignSelf: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageCircle: {
    borderRadius: 52,
  },
  button: {
    alignSelf: 'center',
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  buttonText: {
    color: Colors.primary,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
  },
  subtitle: {
    marginTop: Spacing.md,
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
});
