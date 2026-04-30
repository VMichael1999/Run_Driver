import React from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
  icon: React.ReactNode;
  text: React.ReactNode;
  separationSize?: number;
  expanded?: boolean;
}

export function IconText({ icon, text, separationSize = 8, expanded = true }: Props) {
  return (
    <View style={styles.row}>
      {icon}
      <View style={{ width: separationSize }} />
      {expanded ? <View style={styles.flex}>{text}</View> : text}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  flex: { flex: 1 },
});
