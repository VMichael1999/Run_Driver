import React from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { BackAppBar } from '@shared/components/appbar/BackAppBar';
import { ImagePickerCard } from '@shared/components/form/ImagePickerCard';
import { TextFormFieldCustom } from '@shared/components/form/TextFormFieldCustom';
import { SimpleDatePicker } from '@shared/components/form/SimpleDatePicker';
import { RoundedButton } from '@shared/components/button/RoundedButton';
import { VerificationHelpCard } from '@shared/components/card/VerificationHelpCard';
import { LegacyImages } from '@shared/assets/legacyAssets';
import { pickImageAsync } from '@shared/utils/imageUtils';
import { Colors } from '@theme/colors';
import { Spacing } from '@theme/spacing';

export function VerificacionInformacionBasicaScreen() {
  const [birthDate, setBirthDate] = React.useState<Date | null>(null);
  const [imageUri, setImageUri] = React.useState<string | null>(null);

  return (
    <View style={styles.container}>
      <BackAppBar title="Informacion basica" />
      <ScrollView contentContainerStyle={styles.content}>
        <ImagePickerCard
          title="Foto del conductor"
          uri={imageUri}
          placeholderImage={LegacyImages.logoShadow}
          onPress={async () => setImageUri(await pickImageAsync())}
          circular
        />
        <TextFormFieldCustom labelText="Nombres" placeholder="Ingresa tus nombres" />
        <TextFormFieldCustom labelText="Apellidos" placeholder="Ingresa tus apellidos" />
        <SimpleDatePicker
          labelText="Fecha nacimiento"
          text={birthDate ? birthDate.toLocaleDateString('es-PE') : ''}
          currentTime={birthDate}
          minTime={new Date(1900, 0, 1)}
          maxTime={new Date(new Date().getFullYear() - 18, 11, 31)}
          onConfirm={setBirthDate}
        />
        <TextFormFieldCustom labelText="Correo electronico" placeholder="correo@ejemplo.com" keyboardType="email-address" />
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
