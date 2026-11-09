import React, { useMemo, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Blob from '../components/Blob';
import MoodPicker from '../components/MoodPicker';
import { Button, Chip, Field, IconButton, Squish } from '../components/ui';
import { useData } from '../storage/DataContext';
import { detectRepeat } from '../utils/repeatDetector';
import { categoryIcon, SEVERITIES } from '../utils/constants';
import { addDays, daysBetween, formatDate, formatDateInline } from '../utils/dates';
import Backdrop from '../components/Backdrop';
import { colors, fonts, radius, severityColors, type } from '../theme';

const STEPS = [
  { title: 'What happened?', hint: 'Just the facts. Future you will thank you.' },
  { title: 'Why did it happen?', hint: 'Pick everything that played a part.' },
  { title: "What's the lesson?", hint: 'One clear line you can actually follow next time.' },
  { title: 'Sort it out', hint: 'Where it happened and how much it stung.' },
  { title: null, hint: null },
];

const STARTERS = ['Next time, I will ', 'Before I ', 'Always ', 'Never again '];

const SEVERITY_FACES = { small: 'calm', medium: 'oops', big: 'wow' };
const SEVERITY_TINTS = { small: 'mint', medium: 'butter', big: 'blush' };

function AddCustom({ placeholder, onAdd }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  if (!open) {
    return <Chip label="Other" icon="add" onPress={() => setOpen(true)} />;
  }
  const submit = () => {
    const v = text.trim();
    if (v) onAdd(v);
    setText('');
    setOpen(false);
  };
  return (
    <View style={styles.customRow}>
      <TextInput
        autoFocus
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        placeholderTextColor={colors.inkFaint}
        style={styles.customInput}
        onSubmitEditing={submit}
        returnKeyType="done"
        maxLength={28}
      />
      <Pressable onPress={submit} hitSlop={8} accessibilityRole="button" accessibilityLabel="Add">
        <Ionicons name="checkmark-circle" size={30} color={colors.lavenderDeep} />
      </Pressable>
    </View>
  );
}

function Result({ result, onClose, onOpen }) {
  const { repeat } = result;
  return (
    <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 40, alignItems: 'center' }}>
      <Blob size={170} face={repeat ? 'wow' : 'happy'} tint={repeat ? 'blush' : 'lavender'} breathe />
      <Text style={[type.title, { textAlign: 'center', marginTop: 18 }]}>
        {repeat ? 'Hmm, sounds familiar' : 'Saved. Lesson locked in.'}
      </Text>
      <Text style={[type.bodySoft, { textAlign: 'center', marginTop: 8, maxWidth: 320 }]}>
        {repeat
          ? `${repeat.message} No stress. Here's what you told yourself before:`
          : 'Oopsy will bring this lesson back tomorrow for a quick check-in.'}
      </Text>
      {repeat ? (
        <View style={{ alignSelf: 'stretch', marginTop: 20, gap: 10 }}>
          {repeat.related.slice(0, 4).map((m) => (
            <Squish key={m.id} onPress={() => onOpen(m.id)} style={styles.relatedCard} accessibilityRole="button">
              <Text style={[type.quote, { fontSize: 18, lineHeight: 24 }]}>“{m.lesson}”</Text>
              <Text style={[type.small, { marginTop: 6 }]}>
                {m.title}, {formatDateInline(m.createdAt)}
              </Text>
            </Squish>
          ))}
        </View>
      ) : null}
      <Button title={repeat ? 'Got it' : 'Done'} onPress={onClose} style={{ alignSelf: 'stretch', marginTop: 28 }} />
    </ScrollView>
  );
}

export default function NewMistakeScreen({ navigation, route }) {
  const { mistakes, causes, categories, settings, addMistake, updateMistake, updateSettings } = useData();
  const editing = useMemo(() => mistakes.find((m) => m.id === route.params?.id), [mistakes, route.params?.id]);

  const [step, setStep] = useState(route.params?.step ?? 0);
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const lessonRef = useRef(null);
  const [form, setForm] = useState(() =>
    editing
      ? { ...editing, date: new Date(editing.createdAt) }
      : { title: '', description: '', causes: [], lesson: '', category: null, severity: null, mood: undefined, date: new Date() },
  );
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const valid = [
    form.title.trim().length > 0,
    form.causes.length > 0,
    form.lesson.trim().length > 0,
    !!form.category && !!form.severity,
    true,
  ];

  const toggleCause = (c) =>
    set({ causes: form.causes.includes(c) ? form.causes.filter((x) => x !== c) : [...form.causes, c] });

  const save = async () => {
    if (saving) return;
    setSaving(true);
    const createdAt = (() => {
      if (editing && daysBetween(editing.createdAt, form.date) === 0) return editing.createdAt;
      const d = new Date(form.date);
      const now = new Date();
      d.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
      return d.toISOString();
    })();
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      causes: form.causes,
      lesson: form.lesson.trim(),
      category: form.category,
      severity: form.severity,
      mood: form.mood,
      createdAt,
    };
    try {
      if (editing) {
        await updateMistake(editing.id, payload);
        navigation.goBack();
        return;
      }
      const saved = await addMistake(payload);
      const repeat = detectRepeat(saved, [saved, ...mistakes]);
      Haptics.notificationAsync(
        repeat ? Haptics.NotificationFeedbackType.Warning : Haptics.NotificationFeedbackType.Success,
      ).catch(() => {});
      setResult({ repeat });
    } catch {
      Alert.alert("Couldn't save", 'Something went wrong writing to your device storage. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const next = () => (step === STEPS.length - 1 ? save() : setStep(step + 1));
  const back = () => (step === 0 ? navigation.goBack() : setStep(step - 1));

  if (result) {
    return (
      <SafeAreaView style={styles.safe}>
      <Backdrop />
        <Result
          result={result}
          onClose={() => navigation.goBack()}
          onOpen={(id) => navigation.dispatch(StackActions.replace('MistakeDetail', { id }))}
        />
      </SafeAreaView>
    );
  }

  const daysAgo = daysBetween(form.date, new Date());

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <IconButton icon="close" label="Close" onPress={() => navigation.goBack()} size={42} />
          <Text style={type.label}>
            {editing ? 'Editing' : 'New oops'}, step {step + 1} of {STEPS.length}
          </Text>
          <View style={{ width: 42 }} />
        </View>
        <View style={styles.progress}>
          {STEPS.map((_, i) => (
            <View key={i} style={[styles.progSeg, i <= step && styles.progOn]} />
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {STEPS[step].title ? (
            <>
              <Text style={type.hero}>{STEPS[step].title}</Text>
              <Text style={[type.bodySoft, { marginTop: 6, marginBottom: 24 }]}>{STEPS[step].hint}</Text>
            </>
          ) : null}

          {step === 0 && (
            <>
              <Field
                big
                autoFocus={!editing}
                value={form.title}
                onChangeText={(title) => set({ title })}
                placeholder="Missed the bus to my exam"
                maxLength={90}
              />
              <Field
                label="Tell the story (optional)"
                value={form.description}
                onChangeText={(description) => set({ description })}
                placeholder="What led up to it? What happened after?"
                multiline
              />
            </>
          )}

          {step === 1 && (
            <View style={styles.wrap}>
              {causes.map((c) => (
                <Chip key={c} label={c} selected={form.causes.includes(c)} onPress={() => toggleCause(c)} />
              ))}
              {form.causes
                .filter((c) => !causes.includes(c))
                .map((c) => (
                  <Chip key={c} label={c} selected onPress={() => toggleCause(c)} />
                ))}
              <AddCustom
                placeholder="Name the cause"
                onAdd={(c) => {
                  if (!causes.includes(c)) updateSettings({ customCauses: [...settings.customCauses, c] });
                  if (!form.causes.includes(c)) set({ causes: [...form.causes, c] });
                }}
              />
            </View>
          )}

          {step === 2 && (
            <>
              <View style={styles.lessonBox}>
                <Text style={styles.quoteMark}>“</Text>
                <TextInput
                  ref={lessonRef}
                  autoFocus={!editing}
                  value={form.lesson}
                  onChangeText={(lesson) => set({ lesson })}
                  placeholder="Next time, I'll leave 20 minutes early."
                  placeholderTextColor={colors.inkFaint}
                  style={styles.lessonInput}
                  multiline
                  maxLength={140}
                />
              </View>
              <Text style={[type.small, { textAlign: 'right', marginTop: 6 }]}>{form.lesson.length}/140</Text>
              <Text style={[type.label, { marginTop: 18, marginBottom: 10 }]}>Need a start?</Text>
              <View style={styles.wrap}>
                {STARTERS.map((s) => (
                  <Chip
                    key={s}
                    small
                    label={`${s.trim()}…`}
                    tone="butter"
                    onPress={() => {
                      set({ lesson: s });
                      lessonRef.current?.focus();
                    }}
                  />
                ))}
              </View>
            </>
          )}

          {step === 3 && (
            <>
              <Text style={[type.label, styles.groupLabel]}>Category</Text>
              <View style={styles.wrap}>
                {categories.map((c) => (
                  <Chip key={c} label={c} icon={categoryIcon(c)} selected={form.category === c} onPress={() => set({ category: c })} />
                ))}
                <AddCustom
                  placeholder="New category"
                  onAdd={(c) => {
                    if (!categories.includes(c)) updateSettings({ customCategories: [...settings.customCategories, c] });
                    set({ category: c });
                  }}
                />
              </View>

              <Text style={[type.label, styles.groupLabel]}>How big was it?</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {SEVERITIES.map((s) => {
                  const on = form.severity === s.key;
                  const sc = severityColors[s.key];
                  return (
                    <Squish
                      key={s.key}
                      onPress={() => set({ severity: s.key })}
                      accessibilityRole="button"
                      accessibilityState={{ selected: on }}
                      accessibilityLabel={`${s.label}, ${s.hint}`}
                      style={[styles.sevTile, on && { backgroundColor: sc.bg, borderColor: sc.dot }]}
                    >
                      <Blob
                        size={52}
                        face={SEVERITY_FACES[s.key]}
                        tint={on ? SEVERITY_TINTS[s.key] : 'lavender'}
                        style={!on && form.severity ? { opacity: 0.5 } : null}
                      />
                      <Text style={[type.body, { fontFamily: fonts.bodyBold, marginTop: 6 }]}>{s.label}</Text>
                      <Text style={type.small}>{s.hint}</Text>
                    </Squish>
                  );
                })}
              </View>

              <Text style={[type.label, styles.groupLabel]}>When?</Text>
              <View style={styles.dateRow}>
                <IconButton icon="chevron-back" label="Earlier day" size={40} onPress={() => set({ date: addDays(form.date, -1) })} />
                <Text style={[type.heading, { fontSize: 19 }]}>{formatDate(form.date.toISOString())}</Text>
                <IconButton
                  icon="chevron-forward"
                  label="Later day"
                  size={40}
                  onPress={() => daysAgo > 0 && set({ date: addDays(form.date, 1) })}
                  color={daysAgo > 0 ? colors.ink : colors.line}
                />
              </View>
            </>
          )}

          {step === 4 && <MoodPicker value={form.mood} onChange={(mood) => set({ mood })} />}
        </ScrollView>

        <View style={styles.footer}>
          <Button title="Back" variant="ghost" onPress={back} style={{ flex: 1 }} />
          <Button
            title={step === STEPS.length - 1 ? (editing ? 'Save changes' : 'Save oops') : 'Next'}
            onPress={next}
            disabled={!valid[step] || saving}
            style={{ flex: 2 }}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8 },
  progress: { flexDirection: 'row', gap: 6, paddingHorizontal: 20, marginTop: 14 },
  progSeg: { flex: 1, height: 5, borderRadius: 3, backgroundColor: colors.line },
  progOn: { backgroundColor: colors.lavenderDeep },
  body: { padding: 20, paddingTop: 26, paddingBottom: 40 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  customRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  customInput: {
    minWidth: 160,
    height: 42,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.lavender,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
  },
  lessonBox: { backgroundColor: colors.lavenderSoft, borderRadius: radius.lg, padding: 20, paddingTop: 8 },
  quoteMark: { fontFamily: fonts.display, fontSize: 56, lineHeight: 56, color: colors.lavenderDeep, height: 40 },
  lessonInput: { fontFamily: fonts.display, fontSize: 23, lineHeight: 31, color: colors.ink, minHeight: 100, textAlignVertical: 'top' },
  groupLabel: { marginTop: 22, marginBottom: 10, color: colors.ink },
  sevTile: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.ink,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    padding: 6,
    borderWidth: 1.5,
    borderColor: colors.ink,
  },
  relatedCard: { backgroundColor: colors.white, borderRadius: radius.md, padding: 16 },
  footer: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 12 },
});
