import React from 'react';
import { Text, View } from 'react-native';
import Blob from './Blob';
import { Button } from './ui';
import { type } from '../theme';

export default function EmptyState({ face = 'calm', title, body, action, onAction, tint }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 28, paddingHorizontal: 12 }}>
      <Blob size={130} face={face} tint={tint} />
      <Text style={[type.heading, { textAlign: 'center', marginTop: 18 }]}>{title}</Text>
      {body ? <Text style={[type.bodySoft, { textAlign: 'center', marginTop: 6, maxWidth: 300 }]}>{body}</Text> : null}
      {action ? <Button title={action} onPress={onAction} variant="lavender" style={{ marginTop: 20 }} size="sm" /> : null}
    </View>
  );
}
