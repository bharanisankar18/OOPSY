import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../theme';
import useNow from '../utils/useNow';
import { formatTime } from '../utils/dates';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Small live date and time chip. */
export default function Clock() {
  const now = useNow(15000);
  const date = `${WEEKDAYS[now.getDay()]} ${now.getDate()} ${MONTHS[now.getMonth()]}`;
  const time = formatTime(now);
  return (
    <View style={styles.chip} accessible accessibilityLabel={`${date}, ${time}`}>
      <Ionicons name="time-outline" size={13} color={colors.inkSoft} />
      <Text style={styles.text}>{date}</Text>
      <Text style={styles.time}>{time}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: colors.ink,
  },
  text: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.inkSoft },
  time: { fontFamily: fonts.mono, fontSize: 11, color: colors.ink },
});
