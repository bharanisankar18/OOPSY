import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, severityColors, type } from '../theme';
import { Card, Tag } from './ui';
import { formatDateTime } from '../utils/dates';
import { categoryIcon } from '../utils/constants';
import { isMastered } from '../utils/scheduler';

export default function MistakeCard({ mistake, onPress }) {
  const sev = severityColors[mistake.severity] || severityColors.small;
  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.top}>
        <View style={styles.cat}>
          <Ionicons name={categoryIcon(mistake.category)} size={14} color={colors.inkSoft} />
          <Text style={styles.catText}>{mistake.category}</Text>
        </View>
        <Text style={type.small}>
          {mistake.mood ? `${mistake.mood}  ` : ''}
          {formatDateTime(mistake.createdAt)}
        </Text>
      </View>
      <Text style={[type.heading, { fontSize: 19, lineHeight: 25 }]} numberOfLines={2}>
        {mistake.title}
      </Text>
      <View style={styles.lessonRow}>
        <View style={styles.bar} />
        <Text style={[type.bodySoft, { flex: 1 }]} numberOfLines={2}>
          {mistake.lesson}
        </Text>
      </View>
      <View style={styles.tags}>
        <Tag label={mistake.severity[0].toUpperCase() + mistake.severity.slice(1)} bg={sev.bg} fg={sev.fg} />
        {mistake.causes.slice(0, 2).map((c) => (
          <Tag key={c} label={c} />
        ))}
        {mistake.causes.length > 2 && <Tag label={`+${mistake.causes.length - 2}`} />}
        {isMastered(mistake) && <Tag label="Mastered" bg={colors.mintSoft} fg="#2F7A5A" />}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12, padding: 18 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  catText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.inkSoft },
  lessonRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  bar: { width: 3, borderRadius: 2, backgroundColor: colors.lavenderDeep },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 14 },
});
