import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header, Screen } from '../components/ui';
import { useData } from '../storage/DataContext';
import { DEFAULT_CATEGORIES, DEFAULT_CAUSES, categoryIcon } from '../utils/constants';
import { colors, fonts, radius, shadow, type } from '../theme';

export default function ManageListScreen({ navigation, route }) {
  const kind = route.params?.kind === 'categories' ? 'categories' : 'causes';
  const { settings, updateSettings } = useData();
  const [text, setText] = useState('');
  const key = kind === 'causes' ? 'customCauses' : 'customCategories';
  const defaults = kind === 'causes' ? DEFAULT_CAUSES : DEFAULT_CATEGORIES;
  const custom = settings[key];

  const add = () => {
    const v = text.trim();
    if (!v) return;
    const exists = [...defaults, ...custom].some((x) => x.toLowerCase() === v.toLowerCase());
    if (!exists) updateSettings({ [key]: [...custom, v] });
    setText('');
  };

  return (
    <Screen bottomInset={40} edges={['top', 'bottom']}>
      <Header
        title={kind === 'causes' ? 'Causes' : 'Categories'}
        subtitle={
          kind === 'causes'
            ? 'Add the reasons that show up for you. Removing one keeps it on past entries.'
            : 'Add areas of your life to sort oopsies into. Removing one keeps it on past entries.'
        }
        onBack={() => navigation.goBack()}
      />

      <View style={[styles.addRow, shadow.soft]}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={kind === 'causes' ? 'e.g. Skipped sleep' : 'e.g. Side project'}
          placeholderTextColor={colors.inkFaint}
          style={styles.input}
          onSubmitEditing={add}
          returnKeyType="done"
          maxLength={28}
        />
        <Pressable onPress={add} style={styles.addBtn} accessibilityRole="button" accessibilityLabel="Add">
          <Ionicons name="add" size={22} color={colors.ink} />
        </Pressable>
      </View>

      {custom.length > 0 && (
        <>
          <Text style={styles.group}>Yours</Text>
          <View style={[styles.list, shadow.soft]}>
            {custom.map((c, i) => (
              <View key={c} style={[styles.item, i > 0 && styles.border]}>
                {kind === 'categories' && <Ionicons name={categoryIcon(c)} size={17} color={colors.inkSoft} />}
                <Text style={[type.body, { flex: 1 }]}>{c}</Text>
                <Pressable
                  onPress={() => updateSettings({ [key]: custom.filter((x) => x !== c) })}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${c}`}
                >
                  <Ionicons name="close-circle" size={22} color={colors.blush} />
                </Pressable>
              </View>
            ))}
          </View>
        </>
      )}

      <Text style={styles.group}>Built in</Text>
      <View style={[styles.list, shadow.soft]}>
        {defaults.map((c, i) => (
          <View key={c} style={[styles.item, i > 0 && styles.border]}>
            {kind === 'categories' && <Ionicons name={categoryIcon(c)} size={17} color={colors.inkSoft} />}
            <Text style={[type.body, { flex: 1, color: colors.inkSoft }]}>{c}</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  addRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.pill, paddingLeft: 18, padding: 6 },
  input: { flex: 1, fontFamily: fonts.body, fontSize: 15, color: colors.ink },
  addBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.lavender, alignItems: 'center', justifyContent: 'center' },
  group: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.ink, marginTop: 24, marginBottom: 10 },
  list: { backgroundColor: colors.white, borderRadius: radius.lg, paddingHorizontal: 16 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  border: { borderTopWidth: 1, borderTopColor: colors.line },
});
