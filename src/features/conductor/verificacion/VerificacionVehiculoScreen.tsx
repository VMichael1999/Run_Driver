import React from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { BackAppBar } from '@shared/components/appbar/BackAppBar';
import { ImagePickerCard } from '@shared/components/form/ImagePickerCard';
import { TextFormFieldCustom } from '@shared/components/form/TextFormFieldCustom';
import { SimpleYearPicker } from '@shared/components/form/SimpleYearPicker';
import { RoundedButton } from '@shared/components/button/RoundedButton';
import { VerificationHelpCard } from '@shared/components/card/VerificationHelpCard';
import { pickImageAsync } from '@shared/utils/imageUtils';
import { Colors } from '@theme/colors';
import { Spacing } from '@theme/spacing';

export function VerificacionVehiculoScreen() {
  const [year, setYear] = React.useState<Date | null>(null);
  const [vehicleUri, setVehicleUri] = React.useState<string | null>(null);
  const [cardUri, setCardUri] = React.useState<string | null>(null);

  return (
    <View style={styles.container}>
      <BackAppBar title="Informacion acerca del vehiculo" />
      <ScrollView contentContainerStyle={styles.content}>
        <ImagePickerCard title="Foto del vehiculo" uri={vehicleUri} icon="car-outline" onPress={async () => setVehicleUri(await pickImageAsync())} />
        <ImagePickerCard title="Foto tarjeta propiedad" uri={cardUri} icon="card-outline" onPress={async () => setCardUri(await pickImageAsync())} />
        <TextFormFieldCustom labelText="Marca" placeholder="Toyota" />
        <TextFormFieldCustom labelText="Modelo" placeholder="Corolla" />
        <TextFormFieldCustom labelText="Color" placeholder="Negro" />
        <SimpleYearPicker
          labelText="Anio de fabricacion"
          text={year ? String(year.getFullYear()) : ''}
          currentDate={year}
          minDate={new Date(1990, 0, 1)}
          maxDate={new Date()}
          onConfirm={setYear}
        />
        <TextFormFieldCustom labelText="Placa" placeholder="ABC-123" maxLength={10} autoCapitalize="characters" />
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
