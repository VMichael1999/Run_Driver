import React, { useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { BackAppBar } from '@shared/components/appbar/BackAppBar';
import { useChat } from './hooks/useChat';
import type { ChatMessage } from '@shared/types';
import { Colors } from '@theme/colors';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';
import { formatTime } from '@shared/utils/dateUtils';

function MessageBubble({ message }: { message: ChatMessage }) {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.bubble,
        message.isSentByMe
          ? [styles.bubbleSent, { backgroundColor: Colors.primary }]
          : [styles.bubbleReceived, { backgroundColor: theme.surfaceMuted }],
      ]}
    >
      <Text
        style={[
          styles.bubbleText,
          message.isSentByMe
            ? [styles.bubbleTextSent, { color: Colors.white }]
            : [styles.bubbleTextReceived, { color: theme.text }],
        ]}
      >
        {message.text}
      </Text>
      <Text
        style={[
          styles.bubbleTime,
          message.isSentByMe
            ? [styles.bubbleTimeSent, { color: Colors.onDarkHigh }]
            : [styles.bubbleTimeReceived, { color: theme.textMuted }],
        ]}
      >
        {formatTime(message.timestamp)}
      </Text>
    </View>
  );
}

export function ChatScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const { messages, draft, setDraft, sendMessage } = useChat();
  const listRef = useRef<FlatList>(null);

  const handleSend = () => {
    if (!draft.trim()) return;
    Haptics.selectionAsync();
    sendMessage();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <BackAppBar title="Chat" />
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <MessageBubble message={item} />}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
      />
      <View
        style={[
          styles.inputBar,
          {
            paddingBottom: insets.bottom + Spacing.sm,
            backgroundColor: theme.surface,
            borderTopColor: theme.divider,
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.surfaceMuted,
              borderColor: theme.divider,
              color: theme.text,
            },
          ]}
          value={draft}
          onChangeText={setDraft}
          placeholder="Escribe un mensaje..."
          placeholderTextColor={theme.textDisabled}
          multiline
          accessibilityLabel="Mensaje para el conductor"
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: draft.trim() ? Colors.accentLime : theme.surfaceMuted,
            },
          ]}
          onPress={handleSend}
          disabled={!draft.trim()}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Enviar mensaje"
        >
          <Ionicons
            name="send"
            size={18}
            color={draft.trim() ? Colors.onAccentLime : theme.textDisabled}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  list: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    ...Shadow.sm,
  },
  bubbleSent: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  bubbleReceived: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.regular,
    lineHeight: 20,
  },
  bubbleTextSent: {},
  bubbleTextReceived: {},
  bubbleTime: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.regular,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  bubbleTimeSent: {},
  bubbleTimeReceived: {},
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Spacing.sm,
    borderTopWidth: 1,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.md,
    fontFamily: FontFamily.regular,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
});
