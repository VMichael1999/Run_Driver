import React from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { BackAppBar } from '@shared/components/appbar/BackAppBar';
import { ImagePickerCard } from '@shared/components/form/ImagePickerCard';
import { RoundedButton } from '@shared/components/button/RoundedButton';
import { VerificationHelpCard } from '@shared/components/card/VerificationHelpCard';
import { pickImageAsync } from '@shared/utils/imageUtils';
import { Colors } from '@theme/colors';
import { Spacing } from '@theme/spacing';

export function VerificacionAntecedentesScreen() {
  const [policeUri, setPoliceUri] = React.useState<string | null>(null);
  const [criminalUri, setCriminalUri] = React.useState<string | null>(null);

  return (
    <View style={styles.container}>
      <BackAppBar title="Antecedentes policiales y penales" />
      <ScrollView contentContainerStyle={styles.content}>
        <ImagePickerCard title="Antecedentes policiales" uri={policeUri} icon="document-text-outline" onPress={async () => setPoliceUri(await pickImageAsync())} />
        <ImagePickerCard title="Antecedentes penales" uri={criminalUri} icon="document-outline" onPress={async () => setCriminalUri(await pickImageAsync())} />
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
