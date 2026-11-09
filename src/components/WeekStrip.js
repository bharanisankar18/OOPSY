import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BORDER, colors, fonts, radius, shadow } from '../theme';
import { addDays, dayKey, startOfDay } from '../utils/dates';

const LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/** This week at a glance: today is filled, a dot marks days you logged an oops. */
export default function WeekStrip({ mistakes }) {
  const days = useMemo(() => {
    const today = startOfDay();
    const monday = addDays(today, -((today.getDay() + 6) % 7));
    const logged = new Set(mistakes.map((m) => dayKey(m.createdAt)));
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(monday, i);
      return { d, letter: LETTERS[d.getDay()], num: d.getDate(), isToday: dayKey(d) === dayKey(today), logged: logged.has(dayKey(d)) };
    });
  }, [mistakes]);

  return (
    <View style={[styles.wrap, shadow.soft]}>
      {days.map((x) => (
        <View key={x.d.toISOString()} style={[styles.day, x.isToday && styles.today]} accessible accessibilityLabel={`${x.d.toDateString()}${x.logged ? ', oops logged' : ''}`}>
          <Text style={[styles.letter, x.isToday && { color: colors.paper }]}>{x.letter}</Text>
          <Text style={[styles.num, x.isToday && { color: colors.white }]}>{x.num}</Text>
          <View style={[styles.dot, x.logged && { backgroundColor: x.isToday ? colors.blush : colors.lavenderDeep }]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: BORDER,
    borderColor: colors.ink,
    padding: 6,
    marginTop: 16,
  },
  day: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: radius.md },
  today: { backgroundColor: colors.ink },
  letter: { fontFamily: fonts.bodyMedium, fontSize: 11, color: colors.inkFaint },
  num: { fontFamily: fonts.display, fontSize: 17, color: colors.ink, marginTop: 2 },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 4, backgroundColor: 'transparent' },
});
