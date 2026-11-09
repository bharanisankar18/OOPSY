import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, SectionList, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MistakeCard from '../components/MistakeCard';
import EmptyState from '../components/EmptyState';
import { Button, Chip, MadeBy, Squish } from '../components/ui';
import { useData } from '../storage/DataContext';
import { categoryIcon, SEVERITIES } from '../utils/constants';
import { monthShort } from '../utils/dates';
import Backdrop from '../components/Backdrop';
import { colors, fonts, radius, shadow, type } from '../theme';

const EMPTY_FILTERS = { categories: [], causes: [], severities: [] };

const toggle = (list, v) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

function FilterSheet({ visible, onClose, filters, setFilters, causes, categories }) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.scrim} onPress={onClose} accessibilityLabel="Close filters" />
      <SafeAreaView edges={['bottom']} style={styles.sheet}>
        <View style={styles.grabber} />
        <View style={styles.sheetHead}>
          <Text style={type.title}>Filter</Text>
          <Pressable onPress={() => setFilters(EMPTY_FILTERS)} hitSlop={10}>
            <Text style={[type.label, { fontFamily: fonts.bodyBold }]}>Clear all</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
          <Text style={styles.group}>Category</Text>
          <View style={styles.wrap}>
            {categories.map((c) => (
              <Chip key={c} small icon={categoryIcon(c)} label={c} selected={filters.categories.includes(c)}
                onPress={() => setFilters({ ...filters, categories: toggle(filters.categories, c) })} />
            ))}
          </View>
          <Text style={styles.group}>Cause</Text>
          <View style={styles.wrap}>
            {causes.map((c) => (
              <Chip key={c} small label={c} selected={filters.causes.includes(c)}
                onPress={() => setFilters({ ...filters, causes: toggle(filters.causes, c) })} />
            ))}
          </View>
          <Text style={styles.group}>Severity</Text>
          <View style={styles.wrap}>
            {SEVERITIES.map((s) => (
              <Chip key={s.key} small label={s.label} selected={filters.severities.includes(s.key)}
                onPress={() => setFilters({ ...filters, severities: toggle(filters.severities, s.key) })} />
            ))}
          </View>
        </ScrollView>
        <Button title="Show results" onPress={onClose} />
      </SafeAreaView>
    </Modal>
  );
}

export default function LogScreen({ navigation }) {
  const { mistakes, causes, categories } = useData();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sheet, setSheet] = useState(false);

  const activeCount = filters.categories.length + filters.causes.length + filters.severities.length;

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = mistakes
      .filter((m) => {
        if (filters.categories.length && !filters.categories.includes(m.category)) return false;
        if (filters.severities.length && !filters.severities.includes(m.severity)) return false;
        if (filters.causes.length && !m.causes.some((c) => filters.causes.includes(c))) return false;
        if (!q) return true;
        return [m.title, m.description, m.lesson, m.category, ...m.causes].join(' ').toLowerCase().includes(q);
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const groups = [];
    list.forEach((m) => {
      const d = new Date(m.createdAt);
      const title = `${monthShort(d.getMonth())} ${d.getFullYear()}`;
      const last = groups[groups.length - 1];
      if (last && last.title === title) last.data.push(m);
      else groups.push({ title, data: [m] });
    });
    return groups;
  }, [mistakes, query, filters]);

  const resultCount = sections.reduce((s, g) => s + g.data.length, 0);
  const activeChips = [
    ...filters.categories.map((v) => ({ v, k: 'categories' })),
    ...filters.causes.map((v) => ({ v, k: 'causes' })),
    ...filters.severities.map((v) => ({ v, k: 'severities', label: SEVERITIES.find((s) => s.key === v)?.label })),
  ];

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.paper }}>
      <Backdrop />
      <SectionList
        sections={sections}
        keyExtractor={(m) => m.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <Text style={[type.title, { marginTop: 16 }]}>Your oopsies</Text>
            <Text style={[type.bodySoft, { marginTop: 4 }]}>
              {mistakes.length === 0
                ? 'Every lesson starts here.'
                : `${mistakes.length} logged, ${mistakes.length === 1 ? 'one lesson' : `${mistakes.length} lessons`} learned.`}
            </Text>
            {mistakes.length > 0 && (
              <View style={styles.searchRow}>
                <View style={[styles.search, shadow.soft]}>
                  <Ionicons name="search" size={18} color={colors.inkFaint} />
                  <TextInput
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Search titles, lessons, causes"
                    placeholderTextColor={colors.inkFaint}
                    style={styles.searchInput}
                    returnKeyType="search"
                  />
                  {query ? (
                    <Pressable onPress={() => setQuery('')} hitSlop={8} accessibilityLabel="Clear search">
                      <Ionicons name="close-circle" size={18} color={colors.inkFaint} />
                    </Pressable>
                  ) : null}
                </View>
                <Squish onPress={() => setSheet(true)} style={[styles.filterBtn, activeCount > 0 && { backgroundColor: colors.ink }]}
                  accessibilityRole="button" accessibilityLabel={`Filters${activeCount ? `, ${activeCount} active` : ''}`}>
                  <Ionicons name="options-outline" size={20} color={activeCount ? colors.white : colors.ink} />
                  {activeCount ? <Text style={styles.filterCount}>{activeCount}</Text> : null}
                </Squish>
              </View>
            )}
            {activeChips.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingVertical: 4 }} style={{ marginTop: 12 }}>
                {activeChips.map(({ v, k, label }) => (
                  <Chip key={`${k}-${v}`} small selected icon="close" label={label || v}
                    onPress={() => setFilters({ ...filters, [k]: filters[k].filter((x) => x !== v) })} />
                ))}
              </ScrollView>
            )}
            {(query || activeCount > 0) && mistakes.length > 0 ? (
              <Text style={[type.small, { marginTop: 10 }]}>{resultCount} {resultCount === 1 ? 'match' : 'matches'}</Text>
            ) : null}
          </View>
        }
        renderSectionHeader={({ section }) => <Text style={styles.month}>{section.title}</Text>}
        renderItem={({ item }) => (
          <MistakeCard mistake={item} onPress={() => navigation.navigate('MistakeDetail', { id: item.id })} />
        )}
        ListEmptyComponent={
          mistakes.length === 0 ? (
            <EmptyState
              face="calm"
              title="No oopsies yet"
              body="That's either very good news, or you haven't logged one yet."
              action="Log an oops"
              onAction={() => navigation.navigate('NewMistake')}
            />
          ) : (
            <EmptyState face="meh" title="Nothing matches" body="Try a different word or clear some filters." action="Clear filters"
              onAction={() => { setQuery(''); setFilters(EMPTY_FILTERS); }} />
          )
        }
        ListFooterComponent={<MadeBy />}
        ListFooterComponentStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
      />
      <FilterSheet visible={sheet} onClose={() => setSheet(false)} filters={filters} setFilters={setFilters} causes={causes} categories={categories} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  search: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    height: 50,
  },
  searchInput: { flex: 1, fontFamily: fonts.body, fontSize: 15, color: colors.ink },
  filterBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', ...shadow.soft },
  filterCount: { position: 'absolute', top: 6, right: 6, fontFamily: fonts.bodyBold, fontSize: 10, color: colors.sun },
  month: { fontFamily: fonts.display, fontSize: 17, color: colors.inkSoft, marginTop: 22, marginBottom: 10 },
  scrim: { flex: 1, backgroundColor: 'rgba(43,39,65,0.35)' },
  sheet: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: 20,
    paddingBottom: 16,
    maxHeight: '80%',
  },
  grabber: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: colors.line, marginTop: 10 },
  sheetHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 14, marginBottom: 6 },
  group: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.ink, marginTop: 18, marginBottom: 10 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
