import React from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { BackAppBar } from '@shared/components/appbar/BackAppBar';
import { ImagePickerCard } from '@shared/components/form/ImagePickerCard';
import { TextFormFieldCustom } from '@shared/components/form/TextFormFieldCustom';
import { SimpleDatePicker } from '@shared/components/form/SimpleDatePicker';
import { RoundedButton } from '@shared/components/button/RoundedButton';
import { VerificationHelpCard } from '@shared/components/card/VerificationHelpCard';
import { pickImageAsync } from '@shared/utils/imageUtils';
import { Colors } from '@theme/colors';
import { Spacing } from '@theme/spacing';

export function VerificacionLicenciaScreen() {
  const [expiryDate, setExpiryDate] = React.useState<Date | null>(null);
  const [frontUri, setFrontUri] = React.useState<string | null>(null);
  const [backUri, setBackUri] = React.useState<string | null>(null);

  return (
    <View style={styles.container}>
      <BackAppBar title="Licencia de conducir" />
      <ScrollView contentContainerStyle={styles.content}>
        <TextFormFieldCustom labelText="Numero licencia" placeholder="A123456789" maxLength={10} />
        <SimpleDatePicker
          labelText="Fecha de expiracion"
          text={expiryDate ? expiryDate.toLocaleDateString('es-PE') : ''}
          currentTime={expiryDate}
          minTime={new Date()}
          maxTime={new Date(new Date().getFullYear() + 10, 11, 31)}
          onConfirm={setExpiryDate}
        />
        <ImagePickerCard title="Licencia de conducir (anverso)" uri={frontUri} icon="card-outline" onPress={async () => setFrontUri(await pickImageAsync())} />
        <ImagePickerCard title="Licencia de conducir (reverso)" uri={backUri} icon="card-outline" onPress={async () => setBackUri(await pickImageAsync())} />
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
