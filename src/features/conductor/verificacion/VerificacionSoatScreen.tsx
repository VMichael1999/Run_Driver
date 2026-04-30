import React from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { BackAppBar } from '@shared/components/appbar/BackAppBar';
import { ImagePickerCard } from '@shared/components/form/ImagePickerCard';
import { RoundedButton } from '@shared/components/button/RoundedButton';
import { VerificationHelpCard } from '@shared/components/card/VerificationHelpCard';
import { pickImageAsync } from '@shared/utils/imageUtils';
import { Colors } from '@theme/colors';
import { Spacing } from '@theme/spacing';

export function VerificacionSoatScreen() {
  const [imageUri, setImageUri] = React.useState<string | null>(null);

  return (
    <View style={styles.container}>
      <BackAppBar title="SOAT" />
      <ScrollView contentContainerStyle={styles.content}>
        <ImagePickerCard
          title="Seguro Obligatorio de Accidentes de Transito"
          subtitle="La imagen debe ser lo mas nitida posible."
          uri={imageUri}
          icon="shield-checkmark-outline"
          onPress={async () => setImageUri(await pickImageAsync())}
        />
        <RoundedButton label="Siguiente" onPress={() => Alert.alert('Listo', 'Paso completado en modo demo.')} />
        <VerificationHelpCard />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundLight },
  content: { padding: Spacing.lg, gap: Spacing.md },
});
