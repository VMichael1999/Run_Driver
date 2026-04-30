import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@theme/colors';
import { Shadow } from '@theme/spacing';

interface Props {
  imageUrl: string;
  radius?: number;
}

export function UserNetworkAvatar({ imageUrl, radius = 30 }: Props) {
  const size = radius * 2;
  const [error, setError] = React.useState(false);

  return (
    <View style={[styles.container, Shadow.sm, { width: size, height: size, borderRadius: radius }]}>
      {error || !imageUrl ? (
        <View style={[styles.fallback, { borderRadius: radius }]}>
          <Ionicons name="person" size={radius} color={Colors.textSecondary} />
        </View>
      ) : (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: size, height: size, borderRadius: radius }}
          onError={() => setError(true)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: Colors.backgroundLight,
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundLight,
  },
});
