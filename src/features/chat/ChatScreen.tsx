import React, { useRef } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackAppBar } from '@shared/components/appbar/BackAppBar';
import { useChat } from './hooks/useChat';
import type { ChatMessage } from '@shared/types';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius } from '@theme/spacing';
import { formatTime } from '@shared/utils/dateUtils';

function MessageBubble({ message }: { message: ChatMessage }) {
  return (
    <View style={[styles.bubble, message.isSentByMe ? styles.bubbleSent : styles.bubbleReceived]}>
      <Text style={[styles.bubbleText, message.isSentByMe ? styles.bubbleTextSent : styles.bubbleTextReceived]}>
        {message.text}
      </Text>
      <Text style={[styles.bubbleTime, message.isSentByMe ? styles.bubbleTimeSent : styles.bubbleTimeReceived]}>
        {formatTime(message.timestamp)}
      </Text>
    </View>
  );
}

export function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { messages, draft, setDraft, sendMessage } = useChat();
  const listRef = useRef<FlatList>(null);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
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
      />
      <View style={[styles.inputBar, { paddingBottom: insets.bottom + Spacing.sm }]}>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          placeholder="Escribe un mensaje…"
          placeholderTextColor={Colors.textDisabled}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={!draft.trim()}>
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.white },
  list: { padding: Spacing.lg, gap: Spacing.sm },
  bubble: {
    maxWidth: '75%',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  bubbleSent: { alignSelf: 'flex-end', backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  bubbleReceived: { alignSelf: 'flex-start', backgroundColor: Colors.backgroundLight, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: FontSize.md, fontFamily: FontFamily.regular },
  bubbleTextSent: { color: Colors.white },
  bubbleTextReceived: { color: Colors.textPrimary },
  bubbleTime: { fontSize: FontSize.xs, fontFamily: FontFamily.regular, marginTop: 2, alignSelf: 'flex-end' },
  bubbleTimeSent: { color: 'rgba(255,255,255,0.7)' },
  bubbleTimeReceived: { color: Colors.textDisabled },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    backgroundColor: Colors.white,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.md,
    fontFamily: FontFamily.regular,
    color: Colors.textPrimary,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: { color: Colors.white, fontSize: FontSize.md },
});
