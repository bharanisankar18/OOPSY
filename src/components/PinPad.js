import React, { useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, fonts } from '../theme';
import { Squish } from './ui';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'bio', '0', 'del'];

/**
 * 4-digit PIN entry. `onComplete(pin)` returns true/false (or a Promise of it);
 * false shakes the dots and clears. Give it a new `key` to start a fresh entry.
 */
export default function PinPad({ onComplete, onBiometric, length = 4 }) {
  const [pin, setPin] = useState('');
  const [shake] = useState(() => new Animated.Value(0));

  const press = async (k) => {
    if (k === 'bio') return onBiometric?.();
    if (k === 'del') return setPin((p) => p.slice(0, -1));
    if (pin.length >= length) return undefined;
    const next = pin + k;
    setPin(next);
    if (next.length === length) {
      const ok = await onComplete(next);
      if (ok === false) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        Animated.sequence(
          [12, -12, 8, -8, 0].map((v) => Animated.timing(shake, { toValue: v, duration: 55, useNativeDriver: true })),
        ).start(() => setPin(''));
      }
    }
    return undefined;
  };

  return (
    <View style={{ alignItems: 'center' }}>
      <Animated.View style={[styles.dots, { transform: [{ translateX: shake }] }]}>
        {Array.from({ length }, (_, i) => (
          <View key={i} style={[styles.dot, i < pin.length && styles.dotOn]} />
        ))}
      </Animated.View>
      <View style={styles.grid}>
        {KEYS.map((k) => {
          if (k === 'bio' && !onBiometric) return <View key={k} style={styles.key} />;
          return (
            <Squish
              key={k}
              onPress={() => press(k)}
              scaleTo={0.9}
              accessibilityRole="button"
              accessibilityLabel={k === 'del' ? 'Delete' : k === 'bio' ? 'Use biometrics' : k}
              style={[styles.key, (k === 'del' || k === 'bio') && styles.keyPlain]}
            >
              {k === 'del' ? (
                <Ionicons name="backspace-outline" size={26} color={colors.ink} />
              ) : k === 'bio' ? (
                <Ionicons name="finger-print" size={28} color={colors.lavenderDeep} />
              ) : (
                <Text style={styles.keyText}>{k}</Text>
              )}
            </Squish>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dots: { flexDirection: 'row', gap: 18, marginBottom: 36 },
  dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.lavenderDeep },
  dotOn: { backgroundColor: colors.lavenderDeep },
  grid: { flexDirection: 'row', flexWrap: 'wrap', width: 288, justifyContent: 'space-between', rowGap: 16 },
  key: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyPlain: { backgroundColor: 'transparent' },
  keyText: { fontFamily: fonts.display, fontSize: 30, color: colors.ink },
});
