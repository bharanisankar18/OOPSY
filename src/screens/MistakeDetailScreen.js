import React, { useMemo } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Blob from '../components/Blob';
import { Button, Card, Header, IconButton, Screen, SectionTitle, Squish, Tag } from '../components/ui';
import { useData } from '../storage/DataContext';
import { detectRepeat } from '../utils/repeatDetector';
import { isMastered, isDue } from '../utils/scheduler';
import { categoryIcon, moodByEmoji, REVIEW_INTERVALS } from '../utils/constants';
import { formatDateInline, formatDateTime, formatInDays } from '../utils/dates';
import { colors, fonts, radius, severityColors, type } from '../theme';

function Journey({ review }) {
  const steps = [...REVIEW_INTERVALS.map((d) => `${d}d`), 'Mastered'];
  return (
    <View style={styles.journey}>
      <View style={styles.journeyLine} />
      {steps.map((label, i) => {
        const done = i < review.stage || (i === 4 && review.stage >= 4);
        const current = i === review.stage && review.stage < 4;
        return (
          <View key={label} style={{ alignItems: 'center', flex: 1 }}>
            <View style={[styles.node, done && styles.nodeDone, current && styles.nodeCurrent, i === 4 && done && { backgroundColor: colors.sun, borderColor: colors.sun }]}>
              {done ? <Ionicons name={i === 4 ? 'star' : 'checkmark'} size={12} color={colors.white} /> : null}
            </View>
            <Text style={[type.small, { marginTop: 6 }, current && { color: colors.ink, fontFamily: fonts.bodyBold }]}>{label}</Text>
          </View>
        );
      })}
    </View>
  );
}

export default function MistakeDetailScreen({ navigation, route }) {
  const { mistakes, deleteMistake } = useData();
  const mistake = mistakes.find((m) => m.id === route.params?.id);
  const repeat = useMemo(() => (mistake ? detectRepeat(mistake, mistakes) : null), [mistake, mistakes]);

  if (!mistake) {
    return (
      <Screen>
        <Header onBack={() => navigation.goBack()} />
        <Text style={type.title}>This oops was deleted.</Text>
      </Screen>
    );
  }

  const sev = severityColors[mistake.severity];
  const mood = moodByEmoji(mistake.mood);
  const r = mistake.review;

  const confirmDelete = () =>
    Alert.alert('Delete this oops?', 'Its lesson and review history will be removed for good.', [
      { text: 'Keep it', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          navigation.goBack();
          await deleteMistake(mistake.id);
        },
      },
    ]);

  return (
    <Screen bottomInset={40} edges={['top', 'bottom']}>
      <Header
        onBack={() => navigation.goBack()}
        right={
          <>
            <IconButton icon="create-outline" label="Edit" onPress={() => navigation.navigate('NewMistake', { id: mistake.id })} />
            <IconButton icon="trash-outline" label="Delete" color="#A2404B" onPress={confirmDelete} />
          </>
        }
      />

      <View style={styles.metaRow}>
        <View style={styles.cat}>
          <Ionicons name={categoryIcon(mistake.category)} size={15} color={colors.inkSoft} />
          <Text style={type.label}>{mistake.category}</Text>
        </View>
        <Text style={type.label}>{formatDateTime(mistake.createdAt)}</Text>
      </View>
      <Text style={[type.hero, { marginTop: 10 }]}>{mistake.title}</Text>
      {mistake.description ? <Text style={[type.body, { marginTop: 12, lineHeight: 24 }]}>{mistake.description}</Text> : null}

      <View style={styles.tags}>
        <Tag label={`${mistake.severity[0].toUpperCase()}${mistake.severity.slice(1)}`} bg={sev.bg} fg={sev.fg} />
        {mistake.causes.map((c) => (
          <Tag key={c} label={c} bg={colors.white} />
        ))}
        {mood ? <Tag label={`${mood.emoji} ${mood.label}`} bg={colors.white} /> : null}
      </View>

      <View style={styles.lessonCard}>
        <Blob size={64} face={isMastered(mistake) ? 'proud' : 'calm'} style={styles.lessonBlob} />
        <Text style={[type.label, { color: colors.lavenderDeep, fontFamily: fonts.bodyBold }]}>The lesson</Text>
        <Text style={[type.quote, { marginTop: 8 }]}>“{mistake.lesson}”</Text>
      </View>

      <SectionTitle title="Review journey" />
      <Card>
        <Journey review={r} />
        <View style={styles.reviewStats}>
          <View style={{ flex: 1 }}>
            <Text style={type.small}>Next check-in</Text>
            <Text style={[type.body, { fontFamily: fonts.bodyBold }]}>
              {isMastered(mistake) ? 'Mastered' : isDue(mistake) ? 'Due today' : formatInDays(r.nextReviewDate)}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={type.small}>Slips</Text>
            <Text style={[type.body, { fontFamily: fonts.bodyBold }]}>{r.slips}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={type.small}>Check-ins</Text>
            <Text style={[type.body, { fontFamily: fonts.bodyBold }]}>{r.history.length}</Text>
          </View>
        </View>
        {isDue(mistake) ? (
          <Button title="Review now" size="sm" variant="lavender" onPress={() => navigation.navigate('Main', { screen: 'Review' })} style={{ marginTop: 16 }} />
        ) : null}
      </Card>

      {repeat ? (
        <>
          <SectionTitle title="Sounds familiar" />
          <Text style={[type.bodySoft, { marginBottom: 12 }]}>{repeat.message}</Text>
          {repeat.related.slice(0, 5).map((m) => (
            <Squish key={m.id} onPress={() => navigation.push('MistakeDetail', { id: m.id })} style={styles.related} accessibilityRole="button">
              <Text style={[type.quote, { fontSize: 18, lineHeight: 24 }]}>“{m.lesson}”</Text>
              <Text style={[type.small, { marginTop: 6 }]}>
                {m.title}, {formatDateInline(m.createdAt)}
              </Text>
            </Squish>
          ))}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 16 },
  lessonCard: { backgroundColor: colors.lavenderSoft, borderRadius: radius.lg, padding: 22, marginTop: 28 },
  lessonBlob: { position: 'absolute', right: 14, top: -36 },
  journey: { flexDirection: 'row', marginBottom: 6 },
  journeyLine: { position: 'absolute', top: 10, left: '10%', right: '10%', height: 2, backgroundColor: colors.line },
  node: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.white, borderWidth: 2, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  nodeDone: { backgroundColor: colors.lavenderDeep, borderColor: colors.lavenderDeep },
  nodeCurrent: { borderColor: colors.lavenderDeep, borderWidth: 3 },
  reviewStats: { flexDirection: 'row', marginTop: 18, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.line },
  related: { backgroundColor: colors.white, borderRadius: radius.md, padding: 16, marginBottom: 10 },
});
