import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import EmptyState from '../components/EmptyState';
import { Screen, Squish } from '../components/ui';
import { useData } from '../storage/DataContext';
import { isDue, isMastered } from '../utils/scheduler';
import { categoryIcon, REVIEW_INTERVALS } from '../utils/constants';
import { formatDateInline, formatInDays } from '../utils/dates';
import { colors, fonts, radius, shadow, type } from '../theme';

function Segmented({ value, onChange, options }) {
  return (
    <View style={styles.seg} accessibilityRole="tablist">
      {options.map((o) => {
        const on = value === o.key;
        return (
          <Squish key={o.key} onPress={() => onChange(o.key)} scaleTo={0.97} style={[styles.segItem, on && styles.segOn]}
            accessibilityRole="tab" accessibilityState={{ selected: on }}>
            <Text style={[styles.segText, on && { color: colors.white }]}>{o.label}</Text>
          </Squish>
        );
      })}
    </View>
  );
}

function LessonRow({ m, onPress }) {
  const due = isDue(m);
  return (
    <Squish onPress={onPress} scaleTo={0.98} style={styles.row} accessibilityRole="button">
      <Text style={styles.rowLesson}>{m.lesson}</Text>
      <View style={styles.rowMeta}>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {REVIEW_INTERVALS.map((d, i) => (
            <View key={d} style={[styles.pip, i < m.review.stage && styles.pipOn]} />
          ))}
        </View>
        <Text style={[type.small, due && { color: colors.lavenderDeep, fontFamily: fonts.bodyBold }]}>
          {due ? 'Due today' : `Next ${formatInDays(m.review.nextReviewDate)}`}
        </Text>
      </View>
    </Squish>
  );
}

export default function LessonsScreen({ navigation }) {
  const { mistakes } = useData();
  const [tab, setTab] = useState('rulebook');

  const { groups, mastered } = useMemo(() => {
    const active = mistakes.filter((m) => !isMastered(m));
    const byCat = {};
    active.forEach((m) => {
      (byCat[m.category] = byCat[m.category] || []).push(m);
    });
    const g = Object.entries(byCat)
      .map(([category, items]) => ({
        category,
        items: items.sort((a, b) => new Date(a.review.nextReviewDate) - new Date(b.review.nextReviewDate)),
      }))
      .sort((a, b) => b.items.length - a.items.length);
    const done = mistakes
      .filter(isMastered)
      .map((m) => ({ m, at: m.review.history[m.review.history.length - 1]?.date || m.updatedAt }))
      .sort((a, b) => new Date(b.at) - new Date(a.at));
    return { groups: g, mastered: done };
  }, [mistakes]);

  const open = (id) => navigation.navigate('MistakeDetail', { id });

  return (
    <Screen>
      <Text style={[type.title, { marginTop: 16 }]}>Lessons</Text>
      <Text style={[type.bodySoft, { marginTop: 4 }]}>Your personal rulebook, written by experience.</Text>

      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { key: 'rulebook', label: 'Rulebook' },
          { key: 'mastered', label: `Mastered${mastered.length ? ` (${mastered.length})` : ''}` },
        ]}
      />

      {tab === 'rulebook' ? (
        groups.length === 0 ? (
          <EmptyState
            face={mistakes.length ? 'proud' : 'calm'}
            title={mistakes.length ? 'Every lesson is mastered' : 'No lessons yet'}
            body={mistakes.length ? 'Look at you. Check the Mastered tab to see them all.' : 'Each oops you log adds one rule to this book.'}
            action={mistakes.length ? undefined : 'Log an oops'}
            onAction={() => navigation.navigate('NewMistake')}
          />
        ) : (
          groups.map((g) => (
            <View key={g.category} style={{ marginTop: 24 }}>
              <View style={styles.groupHead}>
                <View style={styles.groupIcon}>
                  <Ionicons name={categoryIcon(g.category)} size={16} color={colors.ink} />
                </View>
                <Text style={[type.heading, { flex: 1 }]}>{g.category}</Text>
                <Text style={type.label}>{g.items.length}</Text>
              </View>
              <View style={[styles.groupCard, shadow.soft]}>
                {g.items.map((m, i) => (
                  <View key={m.id}>
                    {i > 0 && <View style={styles.divider} />}
                    <LessonRow m={m} onPress={() => open(m.id)} />
                  </View>
                ))}
              </View>
            </View>
          ))
        )
      ) : mastered.length === 0 ? (
        <EmptyState
          face="sleepy"
          tint="butter"
          title="Nothing mastered yet"
          body="Keep a lesson through its 1, 7, 30 and 90-day check-ins and it earns a spot here."
        />
      ) : (
        <View style={{ marginTop: 20, gap: 12 }}>
          {mastered.map(({ m, at }) => (
            <Squish key={m.id} onPress={() => open(m.id)} scaleTo={0.98} style={styles.masteredCard} accessibilityRole="button">
              <View style={styles.trophy}>
                <Ionicons name="trophy" size={18} color={colors.ink} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[type.quote, { fontSize: 19, lineHeight: 25 }]}>{m.lesson}</Text>
                <Text style={[type.small, { marginTop: 6 }]}>
                  Mastered {formatDateInline(at)}, {m.category}
                </Text>
              </View>
            </Squish>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  seg: { flexDirection: 'row', backgroundColor: colors.white, borderRadius: 99, padding: 5, marginTop: 20, ...shadow.soft },
  segItem: { flex: 1, height: 42, borderRadius: 99, alignItems: 'center', justifyContent: 'center' },
  segOn: { backgroundColor: colors.ink },
  segText: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.inkSoft },
  groupHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  groupIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.lavenderSoft, alignItems: 'center', justifyContent: 'center' },
  groupCard: { backgroundColor: colors.white, borderRadius: radius.lg, paddingHorizontal: 18 },
  divider: { height: 1, backgroundColor: colors.line },
  row: { paddingVertical: 16 },
  rowLesson: { fontFamily: fonts.display, fontSize: 18, lineHeight: 24, color: colors.ink },
  rowMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  pip: { width: 16, height: 5, borderRadius: 3, backgroundColor: colors.line },
  pipOn: { backgroundColor: colors.lavenderDeep },
  masteredCard: { flexDirection: 'row', gap: 14, backgroundColor: colors.butter, borderRadius: radius.lg, padding: 18 },
  trophy: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.sun, alignItems: 'center', justifyContent: 'center' },
});
