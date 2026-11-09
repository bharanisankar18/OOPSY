import React, { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { colors } from '../theme';

const PALETTE = [colors.lavender, colors.sun, colors.blush, colors.mint, colors.lavenderDeep];

// Deterministic pseudo-random in [0, 1) so the burst is pure to render.
const rand = (i, salt, seed) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233 + seed * 3.7) * 43758.5453;
  return x - Math.floor(x);
};

const seedFrom = (trigger) =>
  String(trigger)
    .split('')
    .reduce((s, c) => s + c.charCodeAt(0), 0);

/** A one-shot burst of confetti from the centre of its parent. Change `trigger` to replay. */
export default function Confetti({ trigger, count = 26 }) {
  const [progress] = useState(() => new Animated.Value(0));

  const pieces = useMemo(() => {
    const seed = seedFrom(trigger);
    return Array.from({ length: count }, (_, i) => {
      const angle = (Math.PI * 2 * i) / count + rand(i, 1, seed) * 0.5;
      const dist = 90 + rand(i, 2, seed) * 90;
      const round = rand(i, 3, seed) > 0.6;
      const w = 6 + rand(i, 4, seed) * 6;
      return {
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist - 40,
        rot: `${Math.round(rand(i, 5, seed) * 540 - 270)}deg`,
        color: PALETTE[i % PALETTE.length],
        w,
        h: round ? w : 10 + rand(i, 6, seed) * 8,
        round,
      };
    });
  }, [trigger, count]);

  useEffect(() => {
    if (!trigger) return;
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: 1300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [trigger, progress]);

  if (!trigger) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.origin}>
        {pieces.map((p, i) => (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              width: p.w,
              height: p.h,
              borderRadius: p.round ? p.w : 2,
              backgroundColor: p.color,
              opacity: progress.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] }),
              transform: [
                { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [0, p.dx] }) },
                {
                  translateY: progress.interpolate({
                    inputRange: [0, 0.6, 1],
                    outputRange: [0, p.dy, p.dy + 60],
                  }),
                },
                { rotate: progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', p.rot] }) },
              ],
            }}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  origin: { position: 'absolute', top: '35%', left: '50%' },
});
