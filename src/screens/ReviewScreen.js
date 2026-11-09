import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Blob from '../components/Blob';
import Confetti from '../components/Confetti';
import { Button, Screen, Tag } from '../components/ui';
import { useData } from '../storage/DataContext';
import { dueLessons, isMastered, reviewStreak, stageLabel } from '../utils/scheduler';
import { categoryIcon, MASTERED_STAGE, REVIEW_INTERVALS } from '../utils/constants';
import { formatDate, formatInDays } from '../utils/dates';
import { colors, fonts, radius, shadow, type } from '../theme';

function StagePips({ stage }) {
  return (
    <View style={{ flexDirection: 'row', gap: 5 }}>
      {REVIEW_INTERVALS.map((d, i) => (
        <View key={d} style={[styles.pip, i < stage && styles.pipOn]} />
      ))}
    </View>
  );
}

export default function ReviewScreen({ navigation }) {
  const { mistakes, reviewMistake } = useData();
  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(0);
  const [tally, setTally] = useState({ yes: 0, no: 0 });
  const [feedback, setFeedback] = useState(null);
  const [mastered, setMastered] = useState(null);
  const [busy, setBusy] = useState(false);
  const [slide] = useState(() => new Animated.Value(0));

  const byId = useMemo(() => new Map(mistakes.map((m) => [m.id, m])), [mistakes]);
  const finished = queue.length > 0 && index >= queue.length;

  const latest = useRef({ mistakes, queue, index });
  useEffect(() => {
    latest.current = { mistakes, queue, index };
  }, [mistakes, queue, index]);

  // Rebuild the queue only when the tab gains focus and no session is in progress,
  // so answering a card never reshuffles the cards still waiting.
  useFocusEffect(
    useCallback(() => {
      const { mistakes: all, queue: q, index: i } = latest.current;
      if (q.length === 0 || i >= q.length) {
        const ids = dueLessons(all).map((m) => m.id);
        if (ids.length) {
          setQueue(ids);
          setIndex(0);
          setTally({ yes: 0, no: 0 });
          setFeedback(null);
        }
      }
    }, []),
  );

  const current = queue[index] ? byId.get(queue[index]) : null;

  const answer = async (followed) => {
    if (!current || busy) return;
    setBusy(true);
    Haptics.notificationAsync(
      followed ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning,
    ).catch(() => {});
    const updated = await reviewMistake(current.id, followed);
    setTally((t) => ({ yes: t.yes + (followed ? 1 : 0), no: t.no + (followed ? 0 : 1) }));

    Animated.timing(slide, {
      toValue: followed ? 1 : -1,
      duration: 260,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      if (updated && updated.review.stage >= MASTERED_STAGE) {
        setMastered(updated);
        setFeedback(null);
      } else if (followed) {
        setFeedback({ good: true, text: `Nice. Next check-in ${formatInDays(updated.review.nextReviewDate)}.` });
      } else {
        setFeedback({ good: false, text: "That's okay. It happens. We'll check again tomorrow." });
      }
      setIndex((i) => i + 1);
      slide.setValue(0);
      setBusy(false);
    });
  };

  const translateX = slide.interpolate({ inputRange: [-1, 0, 1], outputRange: [-420, 0, 420] });
  const rotate = slide.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-14deg', '0deg', '14deg'] });

  if (mastered) {
    return (
      <Screen contentStyle={{ alignItems: 'center', paddingTop: 50 }}>
        <Confetti trigger={mastered.id} />
        <Blob size={200} face="proud" tint="butter" breathe />
        <Text style={[type.hero, { textAlign: 'center', marginTop: 20 }]}>Lesson mastered!</Text>
        <Text style={[type.bodySoft, { textAlign: 'center', marginTop: 8 }]}>
          You kept this one through every check-in, all the way to 90 days.
        </Text>
        <View style={[styles.masteredCard, shadow.soft]}>
          <Ionicons name="trophy" size={22} color={colors.sun} />
          <Text style={[type.quote, { textAlign: 'center', marginTop: 8 }]}>“{mastered.lesson}”</Text>
        </View>
        <Button title="Keep going" onPress={() => setMastered(null)} style={{ alignSelf: 'stretch', marginTop: 26 }} />
      </Screen>
    );
  }

  if (!current) {
    const streak = reviewStreak(mistakes);
    const upcoming = mistakes
      .filter((m) => !isMastered(m))
      .sort((a, b) => new Date(a.review.nextReviewDate) - new Date(b.review.nextReviewDate))[0];
    return (
      <Screen contentStyle={{ alignItems: 'center', paddingTop: 60 }}>
        <Blob size={180} face={finished ? 'proud' : 'sleepy'} breathe />
        <Text style={[type.hero, { textAlign: 'center', marginTop: 20 }]}>
          {finished ? 'All done for today' : 'Nothing to review'}
        </Text>
        <Text style={[type.bodySoft, { textAlign: 'center', marginTop: 8, maxWidth: 300 }]}>
          {finished
            ? `You checked ${tally.yes + tally.no} ${tally.yes + tally.no === 1 ? 'lesson' : 'lessons'} and kept ${tally.yes}. That's how habits stick.`
            : upcoming
              ? `Your next check-in is ${formatInDays(upcoming.review.nextReviewDate)}. Oopsy will remind you.`
              : 'Log an oops and its lesson will show up here tomorrow.'}
        </Text>
        {feedback && finished ? (
          <Text style={[styles.feedback, { color: feedback.good ? '#2F7A5A' : '#A2404B' }]}>{feedback.text}</Text>
        ) : null}
        {streak > 0 ? (
          <View style={styles.streakPill}>
            <Ionicons name="flame" size={18} color={colors.ink} />
            <Text style={[type.body, { fontFamily: fonts.bodyBold }]}>
              {streak} {streak === 1 ? 'day' : 'days'} in a row
            </Text>
          </View>
        ) : null}
        <Button
          title={upcoming || finished ? 'Back home' : 'Log an oops'}
          variant="lavender"
          onPress={() => navigation.navigate(upcoming || finished ? 'Home' : 'NewMistake')}
          style={{ alignSelf: 'stretch', marginTop: 28 }}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ alignItems: 'center', paddingTop: 16 }}>
        <Text style={type.title}>Review</Text>
        <Text style={[type.bodySoft, { marginTop: 4 }]}>
          Lesson {index + 1} of {queue.length}
        </Text>
      </View>

      <View style={styles.stageArea}>
        {queue.length - index > 2 && <View style={[styles.ghost, styles.ghost2]} />}
        {queue.length - index > 1 && <View style={[styles.ghost, styles.ghost1]} />}
        <Animated.View style={[styles.card, shadow.lifted, { transform: [{ translateX }, { rotate }] }]}>
          <View style={styles.cardTop}>
            <View style={styles.catBadge}>
              <Ionicons name={categoryIcon(current.category)} size={18} color={colors.ink} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[type.body, { fontFamily: fonts.bodyBold }]} numberOfLines={1}>
                {current.title}
              </Text>
              <Text style={type.small}>{formatDate(current.createdAt)}, {current.category}</Text>
            </View>
          </View>
          <Text style={[styles.lesson]}>“{current.lesson}”</Text>
          <View style={styles.cardBottom}>
            <StagePips stage={current.review.stage} />
            <Text style={type.small}>{stageLabel(current.review.stage)}</Text>
          </View>
          {current.review.slips > 0 ? (
            <View style={{ alignItems: 'center', marginTop: 10 }}>
              <Tag label={`Slipped ${current.review.slips}×`} bg={colors.blushSoft} fg="#A2404B" />
            </View>
          ) : null}
        </Animated.View>
      </View>

      <Text style={[type.heading, { textAlign: 'center', marginTop: 8 }]}>Did you follow this lesson?</Text>
      {feedback ? (
        <Text style={[styles.feedback, { color: feedback.good ? '#2F7A5A' : '#A2404B' }]}>{feedback.text}</Text>
      ) : (
        <Text style={[type.small, styles.feedback]}>Be honest. Slips reset the timer, not your progress.</Text>
      )}
      <View style={styles.answers}>
        <Button title="Not yet" icon="refresh" variant="danger" onPress={() => answer(false)} style={{ flex: 1 }} disabled={busy} />
        <Button title="Yes, I did" icon="checkmark" variant="mint" onPress={() => answer(true)} style={{ flex: 1 }} disabled={busy} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stageArea: { marginTop: 28, marginBottom: 26 },
  ghost: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, borderRadius: radius.xl, backgroundColor: colors.white },
  ghost1: { transform: [{ translateY: 14 }, { scaleX: 0.93 }], opacity: 0.8 },
  ghost2: { transform: [{ translateY: 28 }, { scaleX: 0.86 }], opacity: 0.55 },
  card: { backgroundColor: colors.white, borderRadius: radius.xl, padding: 22, minHeight: 330, justifyContent: 'space-between' },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  catBadge: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.lavenderSoft, alignItems: 'center', justifyContent: 'center' },
  lesson: { fontFamily: fonts.display, fontSize: 27, lineHeight: 35, color: colors.ink, textAlign: 'center', marginVertical: 26, letterSpacing: -0.3 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pip: { width: 22, height: 6, borderRadius: 3, backgroundColor: colors.line },
  pipOn: { backgroundColor: colors.lavenderDeep },
  feedback: { textAlign: 'center', marginTop: 8, fontFamily: fonts.bodyMedium, fontSize: 14, minHeight: 20 },
  answers: { flexDirection: 'row', gap: 10, marginTop: 18 },
  masteredCard: { backgroundColor: colors.white, borderRadius: radius.lg, padding: 22, marginTop: 24, alignItems: 'center', alignSelf: 'stretch' },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.butter,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 99,
    marginTop: 20,
  },
});
