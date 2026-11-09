import React, { useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Blob from '../components/Blob';
import Backdrop from '../components/Backdrop';
import { Button, Chip, MadeBy } from '../components/ui';
import { useData } from '../storage/DataContext';
import { previewStep } from '../utils/devPreview';
import { ensurePermission } from '../utils/notifications';
import { colors, fonts, radius, shadow, type } from '../theme';

function FannedCards() {
  return (
    <View style={styles.stage}>
      <View style={[styles.phoneGhost]} />
      <View style={[styles.miniCard, styles.cardBack, shadow.soft]}>
        <Text style={styles.miniTitle}>Paid for a course I never opened</Text>
        <Text style={styles.miniMeta}>Emotional decision</Text>
      </View>
      <View style={[styles.miniCard, styles.cardFront, shadow.lifted]}>
        <View style={styles.miniBlob}>
          <Blob size={34} face="oops" />
        </View>
        <Text style={styles.miniTitle}>Started the assignment the night before it was due</Text>
        <Text style={styles.miniMeta}>Procrastination</Text>
      </View>
      <View style={[styles.bubble, { top: 40, right: 18, backgroundColor: colors.lavender }, shadow.soft]}>
        <Ionicons name="heart" size={22} color={colors.white} />
      </View>
      <View style={[styles.bubble, { bottom: 30, left: 14, backgroundColor: colors.sun }, shadow.soft]}>
        <Ionicons name="star" size={20} color={colors.white} />
      </View>
    </View>
  );
}

function LessonCard() {
  return (
    <View style={styles.stage}>
      <View style={[styles.lessonCard, shadow.lifted]}>
        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
          {['Procrastination', 'Poor planning'].map((c) => (
            <View key={c} style={styles.pill}>
              <Text style={styles.pillText}>{c}</Text>
            </View>
          ))}
        </View>
        <Text style={[type.quote, { marginTop: 18 }]}>“Start the first 20 minutes the day it’s assigned.”</Text>
        <Text style={[type.small, { marginTop: 14 }]}>Your lesson, in your words</Text>
      </View>
      <Blob size={96} face="calm" style={{ position: 'absolute', bottom: 6, right: 10 }} />
    </View>
  );
}

function Schedule() {
  const steps = ['1 day', '7 days', '30 days', '90 days'];
  return (
    <View style={[styles.stage, { justifyContent: 'center' }]}>
      <Blob size={150} face="proud" breathe />
      <View style={styles.timeline}>
        <View style={styles.timelineLine} />
        {steps.map((s, i) => (
          <View key={s} style={{ alignItems: 'center', width: 64 }}>
            <View style={[styles.node, i === 3 && { backgroundColor: colors.sun, borderColor: colors.sun }]}>
              {i === 3 ? <Ionicons name="star" size={12} color={colors.white} /> : null}
            </View>
            <Text style={[type.small, { marginTop: 6, color: colors.inkSoft }]}>{s}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const PAGES = [
  {
    key: 'log',
    art: FannedCards,
    title: 'Oops happens.\nWrite it down.',
    body: 'Log what went wrong in under a minute. No judgement here, just honest notes for future you.',
  },
  {
    key: 'learn',
    art: LessonCard,
    title: 'Find the lesson\ninside it.',
    body: 'Pick why it happened, then write the one rule you will keep next time.',
  },
  {
    key: 'repeat',
    art: Schedule,
    title: 'Never repeat\nthe same oops.',
    body: 'Oopsy brings each lesson back after 1, 7, 30 and 90 days, and nudges you when a pattern shows up.',
  },
  { key: 'profile' },
];

const ROLES = ['Student', 'Working', 'Both', 'Something else'];
const FOCUS = ['Studies', 'Work', 'Money', 'Health', 'Relationships', 'Habits'];
const TIMES = [
  ['Morning', '08:00'],
  ['Afternoon', '14:00'],
  ['Evening', '20:00'],
  ['Night', '22:00'],
];

function ProfileForm({ name, setName, role, setRole, focus, toggleFocus, remind, setRemind, time, setTime }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 12 }}>
      <View style={styles.hello}>
        <Blob size={72} face={name.trim() ? 'proud' : 'happy'} />
        <View style={{ flex: 1 }}>
          <Text style={[type.title, { fontSize: 28, lineHeight: 32 }]}>
            {name.trim() ? `Hi, ${name.trim()}!` : 'Nice to meet you.'}
          </Text>
          <Text style={[type.bodySoft, { marginTop: 4 }]}>A few quick questions to set up your diary.</Text>
        </View>
      </View>

      <Text style={styles.q}>What should Oopsy call you?</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Your nickname"
        placeholderTextColor={colors.inkFaint}
        style={styles.nameInput}
        returnKeyType="done"
        maxLength={24}
        autoCapitalize="words"
        accessibilityLabel="Nickname"
      />

      <Text style={styles.q}>You are</Text>
      <View style={styles.chips}>
        {ROLES.map((r) => (
          <Chip key={r} label={r} selected={role === r} onPress={() => setRole(role === r ? '' : r)} />
        ))}
      </View>

      <Text style={styles.q}>What do you want to get better at?</Text>
      <View style={styles.chips}>
        {FOCUS.map((f) => (
          <Chip key={f} label={f} selected={focus.includes(f)} onPress={() => toggleFocus(f)} tone="butter" />
        ))}
      </View>

      <Text style={styles.q}>Remind me to review</Text>
      <View style={styles.chips}>
        <Chip label="Yes, daily" icon="notifications" selected={remind} onPress={() => setRemind(true)} />
        <Chip label="Not now" selected={!remind} onPress={() => setRemind(false)} />
      </View>
      {remind ? (
        <View style={[styles.chips, { marginTop: 10 }]}>
          {TIMES.map(([label, value]) => (
            <Chip key={value} label={label} small selected={time === value} onPress={() => setTime(value)} />
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const { updateSettings } = useData();
  const [page, setPage] = useState(previewStep() ?? 0);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [focus, setFocus] = useState([]);
  const [remind, setRemind] = useState(true);
  const [time, setTime] = useState('20:00');
  const toggleFocus = (f) => setFocus((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]));
  const list = useRef(null);
  const last = page === PAGES.length - 1;
  const canFinish = !last || name.trim().length > 0;

  const next = async () => {
    if (!last) {
      list.current?.scrollToIndex({ index: page + 1 });
      return;
    }
    const allowed = remind ? await ensurePermission() : false;
    await updateSettings({
      onboardingDone: true,
      name: name.trim(),
      role,
      focus,
      notificationsEnabled: allowed,
      notificationTime: time,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }}>
      <Backdrop />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.topRow}>
          <View style={styles.brand}>
            <Blob size={34} face="happy" />
            <Text style={styles.wordmark}>oopsy</Text>
          </View>
          {!last ? (
            <Text
              style={[type.label, { fontFamily: fonts.bodyBold }]}
              onPress={() => list.current?.scrollToIndex({ index: PAGES.length - 1 })}
              accessibilityRole="button"
            >
              Skip
            </Text>
          ) : null}
        </View>
        <FlatList
          ref={list}
          data={PAGES}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(p) => p.key}
          initialScrollIndex={previewStep() ?? 0}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          scrollEventThrottle={32}
          onScroll={(e) => {
            const p = Math.round(e.nativeEvent.contentOffset.x / width);
            if (p !== page) setPage(p);
          }}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            if (item.key === 'profile') {
              return (
                <View style={{ width, paddingHorizontal: 24, paddingTop: 12 }}>
                  <ProfileForm
                    name={name}
                    setName={setName}
                    role={role}
                    setRole={setRole}
                    focus={focus}
                    toggleFocus={toggleFocus}
                    remind={remind}
                    setRemind={setRemind}
                    time={time}
                    setTime={setTime}
                  />
                </View>
              );
            }
            const Art = item.art;
            return (
              <View style={{ width, paddingHorizontal: 24 }}>
                <Art />
                <Text style={[type.hero, { marginTop: 8 }]}>{item.title}</Text>
                <Text style={[type.bodySoft, { marginTop: 12, fontSize: 16, lineHeight: 24 }]}>{item.body}</Text>
              </View>
            );
          }}
        />
        <View style={styles.bottom}>
          <View style={styles.dots}>
            {PAGES.map((p, i) => (
              <View key={p.key} style={[styles.dot, i === page && styles.dotOn]} />
            ))}
          </View>
          <Button title={last ? 'Start my diary' : 'Next'} onPress={next} disabled={!canFinish} style={{ alignSelf: 'stretch' }} />
          <MadeBy style={{ marginTop: 14 }} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wash: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: colors.white,
    opacity: 0.55,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 8 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hello: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 18 },
  q: { fontFamily: fonts.display, fontSize: 17, color: colors.ink, marginTop: 18, marginBottom: 10, letterSpacing: -0.3 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  wordmark: { fontFamily: fonts.display, fontSize: 22, color: colors.ink, letterSpacing: -0.5 },
  stage: { height: 330, alignItems: 'center', justifyContent: 'center' },
  phoneGhost: {
    position: 'absolute',
    top: 10,
    width: 200,
    height: 300,
    borderRadius: 34,
    backgroundColor: colors.white,
    opacity: 0.7,
  },
  miniCard: { position: 'absolute', width: 196, borderRadius: radius.md, padding: 18 },
  cardBack: { backgroundColor: colors.butter, transform: [{ rotate: '7deg' }], top: 150, left: '42%' },
  cardFront: { backgroundColor: colors.lavenderSoft, transform: [{ rotate: '-6deg' }], top: 60, left: '10%' },
  miniBlob: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.white,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  miniTitle: { fontFamily: fonts.display, fontSize: 15, lineHeight: 20, color: colors.ink, textAlign: 'center' },
  miniMeta: { fontFamily: fonts.body, fontSize: 11, color: colors.inkSoft, textAlign: 'center', marginTop: 10 },
  bubble: { position: 'absolute', width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', borderWidth: 5, borderColor: colors.white },
  lessonCard: { width: '92%', backgroundColor: colors.white, borderRadius: radius.lg, padding: 24, transform: [{ rotate: '-2deg' }] },
  pill: { backgroundColor: colors.paper, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99 },
  pillText: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.inkSoft },
  timeline: { flexDirection: 'row', marginTop: 26, justifyContent: 'center' },
  timelineLine: { position: 'absolute', top: 10, left: 32, right: 32, height: 2, backgroundColor: colors.lavender },
  node: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.white, borderWidth: 2, borderColor: colors.lavender, alignItems: 'center', justifyContent: 'center' },
  nameInput: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingHorizontal: 18,
    paddingVertical: 15,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.ink,
    borderWidth: 2.5,
    borderColor: colors.ink,
  },
  bottom: { paddingHorizontal: 24, paddingBottom: 8 },
  dots: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 18 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.line },
  dotOn: { width: 26, backgroundColor: colors.ink },
});
