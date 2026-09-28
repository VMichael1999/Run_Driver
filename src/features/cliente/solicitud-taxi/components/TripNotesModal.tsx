import React, { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';
import { AppButton } from '@shared/components/ui/AppButton';

interface TripNotesModalProps {
  visible: boolean;
  initialNotes: string;
  onSave: (notes: string) => void;
  onClose: () => void;
}

export function TripNotesModal({
  visible,
  initialNotes,
  onSave,
  onClose,
}: TripNotesModalProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const [notes, setNotes] = useState(initialNotes);

  useEffect(() => {
    if (visible) {
      setNotes(initialNotes);
    }
  }, [visible, initialNotes]);

  const handleSave = () => {
    onSave(notes.trim());
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onClose}>
          <Pressable
            style={[
              styles.sheet,
              { backgroundColor: theme.surface, paddingBottom: Math.max(insets.bottom, Spacing.lg) },
              Shadow.sheet,
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[styles.handle, { backgroundColor: theme.line }]} />
            <Text style={[styles.title, { color: theme.text }]}>Notas del viaje</Text>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>
              Instrucciones breves para el conductor (ej. 'Esperando en la reja negra')
            </Text>

            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Escribe un comentario o referencia..."
              placeholderTextColor={theme.textDisabled}
              style={[
                styles.textArea,
                {
                  backgroundColor: theme.surfaceMuted,
                  color: theme.text,
                  borderColor: theme.line,
                },
              ]}
              multiline
              numberOfLines={4}
              maxLength={150}
              autoFocus
            />

            <View style={styles.actions}>
              <AppButton
                label="Guardar notas"
                variant="primary"
                onPress={handleSave}
              />
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 10, 0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.md,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.xs,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    textAlign: 'center',
    marginTop: -8,
  },
  textArea: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    height: 100,
    textAlignVertical: 'top',
  },
  actions: {
    marginTop: Spacing.xs,
  },
});
