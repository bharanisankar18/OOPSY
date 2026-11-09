import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Blob from '../components/Blob';
import MistakeCard from '../components/MistakeCard';
import { Button, Card, IconButton, Screen, SectionTitle, Squish } from '../components/ui';
import { useData } from '../storage/DataContext';
import { dueLessons, isMastered, reviewStreak, reviewedToday } from '../utils/scheduler';
import { latestRepeat } from '../utils/repeatDetector';
import Clock from '../components/Clock';
import WeekStrip from '../components/WeekStrip';
import { formatInDays, greeting } from '../utils/dates';
import { BORDER, colors, fonts, radius, shadow, type } from '../theme';

function DueStack({ due, nextUp, onStart, onLog, empty }) {
  const first = due[0];
  return (
    <View style={styles.stackWrap}>
      {due.length > 1 && <View style={[styles.stackCard, styles.stackBack2]} />}
      {due.length > 0 && <View style={[styles.stackCard, styles.stackBack1]} />}
      <View style={[styles.dueCard, shadow.lifted]}>
        <Blob size={78} face={empty ? 'calm' : due.length ? 'oops' : 'proud'} style={styles.peek} />
        {empty ? (
          <>
            <Text style={type.label}>Your diary is empty</Text>
            <Text style={[type.quote, { marginTop: 10 }]}>Log your first oops. It takes about a minute.</Text>
            <Button title="Log an oops" icon="add" onPress={onLog} size="sm" style={styles.cardBtn} />
          </>
        ) : due.length ? (
          <>
            <Text style={type.label}>
              {due.length === 1 ? '1 lesson to check today' : `${due.length} lessons to check today`}
            </Text>
            <Text style={[type.quote, { marginTop: 10 }]} numberOfLines={3}>
              “{first.lesson}”
            </Text>
            <Button title="Start review" icon="play" onPress={onStart} size="sm" style={styles.cardBtn} />
          </>
        ) : (
          <>
            <Text style={type.label}>All caught up</Text>
            <Text style={[type.quote, { marginTop: 10 }]}>Nothing to review today. Nice work.</Text>
            {nextUp ? (
              <Text style={[type.bodySoft, { marginTop: 10 }]}>
                Next check-in {formatInDays(nextUp.review.nextReviewDate)}
              </Text>
            ) : null}
          </>
        )}
      </View>
    </View>
  );
}

function StatTile({ icon, value, label, bg, iconBg }) {
  return (
    <View style={[styles.tile, { backgroundColor: bg }]}>
      <View style={[styles.tileIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={colors.ink} />
      </View>
      <Text style={[type.number, { marginTop: 14 }]}>{value}</Text>
      <Text style={type.label}>{label}</Text>
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const { mistakes, settings } = useData();

  const data = useMemo(() => {
    const due = dueLessons(mistakes);
    const upcoming = mistakes
      .filter((m) => !isMastered(m))
      .sort((a, b) => new Date(a.review.nextReviewDate) - new Date(b.review.nextReviewDate));
    return {
      due,
      nextUp: upcoming[0],
      streak: reviewStreak(mistakes),
      doneToday: reviewedToday(mistakes),
      mastered: mistakes.filter(isMastered).length,
      repeat: latestRepeat(mistakes),
      recent: [...mistakes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3),
    };
  }, [mistakes]);

  const name = settings.name?.trim();

  return (
    <Screen>
      <View style={styles.topRow}>
        <View style={styles.avatar}>
          <Blob size={50} face="calm" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={type.label}>{greeting()}</Text>
          <Text style={[type.title, { fontSize: 26, lineHeight: 30 }]} numberOfLines={1}>
            {name || 'Friend'}
          </Text>
        </View>
        <IconButton icon="settings-outline" label="Settings" onPress={() => navigation.navigate('Settings')} size={44} />
      </View>
      <View style={{ marginTop: 12 }}>
        <Clock />
      </View>
      <WeekStrip mistakes={mistakes} />

      <DueStack
        due={data.due}
        nextUp={data.nextUp}
        empty={mistakes.length === 0}
        onStart={() => navigation.navigate('Review')}
        onLog={() => navigation.navigate('NewMistake')}
      />

      {mistakes.length > 0 && (
        <Squish onPress={() => navigation.navigate('NewMistake')} style={styles.logBtn} accessibilityRole="button" accessibilityLabel="Log an oops">
          <View style={styles.logPlus}>
            <Ionicons name="add" size={22} color={colors.ink} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[type.heading, { fontSize: 19 }]}>Log an oops</Text>
            <Text style={type.label}>What happened? Let’s turn it into a lesson.</Text>
          </View>
        </Squish>
      )}

      <View style={styles.tiles}>
        <StatTile
          icon="flame"
          value={data.streak}
          label={data.streak === 1 ? 'day in a row reviewing' : 'days in a row reviewing'}
          bg={colors.sun}
          iconBg={colors.white}
        />
        <StatTile icon="trophy" value={data.mastered} label="lessons mastered" bg={colors.lavender} iconBg={colors.white} />
      </View>
      {data.streak > 0 && !data.doneToday && data.due.length > 0 ? (
        <Text style={[type.small, { marginTop: 8, textAlign: 'center' }]}>
          Review today to keep your streak going.
        </Text>
      ) : null}

      {data.repeat ? (
        <Card tint={colors.blushSoft} style={styles.repeat} onPress={() => navigation.navigate('MistakeDetail', { id: data.repeat.sourceId })}>
          <Blob size={64} face="wow" tint="blush" />
          <View style={{ flex: 1 }}>
            <Text style={[type.heading, { fontSize: 18 }]}>Hmm, sounds familiar</Text>
            <Text style={[type.body, { marginTop: 4 }]}>{data.repeat.message}</Text>
            <Text style={styles.link}>See the lessons you wrote before</Text>
          </View>
        </Card>
      ) : null}

      {data.recent.length > 0 && (
        <>
          <SectionTitle title="Recent oopsies" action="See all" onAction={() => navigation.navigate('Log')} />
          {data.recent.map((m) => (
            <MistakeCard key={m.id} mistake={m} onPress={() => navigation.navigate('MistakeDetail', { id: m.id })} />
          ))}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 8 },
  avatar: { width: 58, height: 58, borderRadius: 29, backgroundColor: colors.white, borderWidth: BORDER, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  stackWrap: { marginTop: 70, marginBottom: 22 },
  stackCard: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, borderRadius: radius.xl, backgroundColor: colors.white, borderWidth: BORDER, borderColor: colors.ink },
  stackBack1: { transform: [{ translateY: 12 }, { scaleX: 0.94 }], backgroundColor: colors.blush },
  stackBack2: { transform: [{ translateY: 24 }, { scaleX: 0.88 }], backgroundColor: colors.lavender },
  dueCard: { backgroundColor: colors.white, borderRadius: radius.xl, padding: 24, paddingTop: 28, borderWidth: BORDER, borderColor: colors.ink },
  peek: { position: 'absolute', top: -50, right: 18 },
  cardBtn: { alignSelf: 'flex-start', marginTop: 18 },
  logBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.lavender,
    borderRadius: radius.lg,
    padding: 16,
    marginTop: 10,
    borderWidth: BORDER,
    borderColor: colors.ink,
    ...shadow.soft,
  },
  logPlus: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: colors.ink, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  tiles: { flexDirection: 'row', gap: 12, marginTop: 14 },
  tile: { flex: 1, borderRadius: radius.lg, padding: 18, borderWidth: BORDER, borderColor: colors.ink, ...shadow.soft },
  tileIcon: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  repeat: { flexDirection: 'row', gap: 14, alignItems: 'center', marginTop: 14, shadowOpacity: 0 },
  link: { fontFamily: fonts.bodyBold, fontSize: 13, color: '#A0173F', marginTop: 8 },
});
