import React from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { BackAppBar } from '@shared/components/appbar/BackAppBar';
import { ImagePickerCard } from '@shared/components/form/ImagePickerCard';
import { TextFormFieldCustom } from '@shared/components/form/TextFormFieldCustom';
import { RoundedButton } from '@shared/components/button/RoundedButton';
import { VerificationHelpCard } from '@shared/components/card/VerificationHelpCard';
import { pickImageAsync } from '@shared/utils/imageUtils';
import { Colors } from '@theme/colors';
import { Spacing } from '@theme/spacing';

export function VerificacionDocumentoScreen() {
  const [frontUri, setFrontUri] = React.useState<string | null>(null);
  const [backUri, setBackUri] = React.useState<string | null>(null);

  return (
    <View style={styles.container}>
      <BackAppBar title="Documento de identificacion" />
      <ScrollView contentContainerStyle={styles.content}>
        <TextFormFieldCustom labelText="Numero documento" placeholder="12345678" keyboardType="number-pad" maxLength={11} />
        <ImagePickerCard title="Documento de identificacion (anverso)" uri={frontUri} icon="document-text-outline" onPress={async () => setFrontUri(await pickImageAsync())} />
        <ImagePickerCard title="Documento de identificacion (reverso)" uri={backUri} icon="document-outline" onPress={async () => setBackUri(await pickImageAsync())} />
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
