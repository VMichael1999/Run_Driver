import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BackAppBar } from '@shared/components/appbar/BackAppBar';
import { ExpandedCard } from '@shared/components/card/ExpandedCard';
import { VerificationHelpCard } from '@shared/components/card/VerificationHelpCard';
import { TextFormFieldCustom } from '@shared/components/form/TextFormFieldCustom';
import { RoundedButton } from '@shared/components/button/RoundedButton';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing } from '@theme/spacing';

export function VerificacionContactoEmergenciaScreen() {
  return (
    <View style={styles.container}>
      <BackAppBar title="Contacto de emergencia" />
      <ScrollView contentContainerStyle={styles.content}>
        <ExpandedCard>
          <Text style={styles.title}>Persona de emergencia (opcional)</Text>
          <TextFormFieldCustom labelText="Numero de telefono" placeholder="999 999 999" keyboardType="phone-pad" maxLength={10} />
          <Text style={styles.body}>
            Un contacto de emergencia puede ser cualquier persona de confianza que pueda recibir informacion critica sobre tu ubicacion o situacion si ocurre una emergencia.
          </Text>
        </ExpandedCard>
        <RoundedButton label="Siguiente" onPress={() => Alert.alert('Listo', 'Paso completado en modo demo.')} />
        <VerificationHelpCard />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundLight },
  content: { padding: Spacing.lg, gap: Spacing.md },
  title: {
    marginBottom: Spacing.sm,
    color: Colors.textPrimary,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    textAlign: 'center',
  },
  body: {
    marginTop: Spacing.md,
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
});
