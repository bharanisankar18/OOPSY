import React, { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Blob from './Blob';
import { MOODS } from '../utils/constants';
import { colors, fonts, type } from '../theme';

const BARS_PER_MOOD = 5;
const BAR_COUNT = MOODS.length * BARS_PER_MOOD;

/** Drag or tap along the waveform to pick a mood; Oopsy's face mirrors it. */
export default function MoodPicker({ value, onChange }) {
  const index = MOODS.findIndex((m) => m.emoji === value);
  const startX = useRef(0);
  const last = useRef(index);
  const widthRef = useRef(1);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
    last.current = index;
  }, [onChange, index]);

  const startPageX = useRef(0);

  const pick = (x) => {
    const i = Math.max(0, Math.min(MOODS.length - 1, Math.floor((x / widthRef.current) * MOODS.length)));
    if (i !== last.current) {
      last.current = i;
      Haptics.selectionAsync().catch(() => {});
      onChangeRef.current(MOODS[i].emoji);
    }
  };

  const touch = {
    onStartShouldSetResponder: () => true,
    onMoveShouldSetResponder: () => true,
    onResponderTerminationRequest: () => false,
    onResponderGrant: (e) => {
      startX.current = e.nativeEvent.locationX;
      startPageX.current = e.nativeEvent.pageX;
      pick(startX.current);
    },
    onResponderMove: (e) => pick(startX.current + (e.nativeEvent.pageX - startPageX.current)),
  };

  const mood = index >= 0 ? MOODS[index] : null;
  // With nothing picked, show a soft resting wave in the middle as a hint to slide.
  const center = index >= 0 ? index * BARS_PER_MOOD + (BARS_PER_MOOD - 1) / 2 : (BAR_COUNT - 1) / 2;
  const resting = index < 0;

  return (
    <View style={{ alignItems: 'center' }}>
      <Blob size={210} face={mood ? mood.face : 'calm'} breathe />
      <Text style={[type.title, { textAlign: 'center', marginTop: 18 }]}>How do you feel about it?</Text>
      <Text style={[type.bodySoft, { marginTop: 4 }]}>
        {mood ? `${mood.emoji}  ${mood.label}` : 'Slide to pick the closest match'}
      </Text>

      <View
        style={styles.wave}
        onLayout={(e) => {
          widthRef.current = e.nativeEvent.layout.width;
        }}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel="Mood"
        accessibilityValue={{ text: mood ? mood.label : 'None' }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) => {
          const next = e.nativeEvent.actionName === 'increment' ? index + 1 : index - 1;
          onChange(MOODS[Math.max(0, Math.min(MOODS.length - 1, next))].emoji);
        }}
        {...touch}
      >
        {Array.from({ length: BAR_COUNT }, (_, i) => {
          const d = i - center;
          const h = 10 + (resting ? 34 : 58) * Math.exp(-(d * d) / (resting ? 40 : 14));
          const near = !resting && Math.abs(d) < 0.6;
          return (
            <View
              key={i}
              pointerEvents="none"
              style={[
                styles.bar,
                {
                  height: h,
                  backgroundColor: near ? colors.lavenderDeep : colors.lavender,
                  opacity: near ? 1 : 0.35 + 0.5 * Math.exp(-(d * d) / 30),
                  width: near ? 4 : 3,
                },
              ]}
            />
          );
        })}
      </View>
      <View style={styles.ends}>
        <Text style={type.small}>Rough</Text>
        <Text style={type.small}>Calm</Text>
      </View>
      {mood ? (
        <Pressable onPress={() => onChange(undefined)} hitSlop={10} style={{ marginTop: 14 }}>
          <Text style={[type.label, { fontFamily: fonts.bodyBold }]}>Clear mood</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wave: {
    marginTop: 26,
    height: 80,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  bar: { borderRadius: 2 },
  ends: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 8, paddingHorizontal: 4 },
});
