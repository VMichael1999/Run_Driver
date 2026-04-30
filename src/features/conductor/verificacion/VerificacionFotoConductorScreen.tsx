import React from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { BackAppBar } from '@shared/components/appbar/BackAppBar';
import { ImagePickerCard } from '@shared/components/form/ImagePickerCard';
import { RoundedButton } from '@shared/components/button/RoundedButton';
import { VerificationHelpCard } from '@shared/components/card/VerificationHelpCard';
import { pickImageAsync } from '@shared/utils/imageUtils';
import { Colors } from '@theme/colors';
import { Spacing } from '@theme/spacing';

export function VerificacionFotoConductorScreen() {
  const [imageUri, setImageUri] = React.useState<string | null>(null);

  return (
    <View style={styles.container}>
      <BackAppBar title="Confirmacion foto conductor" />
      <ScrollView contentContainerStyle={styles.content}>
        <ImagePickerCard
          title="Foto del conductor"
          subtitle="Muestre la licencia de conducir delante de usted y tome una foto nitida, con buena luz y sin accesorios que cubran el rostro."
          uri={imageUri}
          icon="camera-outline"
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
