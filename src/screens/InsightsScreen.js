import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BarChart } from 'react-native-gifted-charts';
import Blob from '../components/Blob';
import EmptyState from '../components/EmptyState';
import { Card, Screen, SectionTitle } from '../components/ui';
import { useData } from '../storage/DataContext';
import { computeInsights } from '../utils/insights';
import { categoryIcon } from '../utils/constants';
import { colors, fonts, radius, type } from '../theme';

function Tile({ icon, iconBg, bg, label, value, sub }) {
  return (
    <View style={[styles.tile, { backgroundColor: bg }]}>
      <View style={[styles.tileIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={16} color={colors.ink} />
      </View>
      <Text style={[type.small, { marginTop: 12, color: colors.inkSoft }]}>{label}</Text>
      <Text style={styles.tileValue} numberOfLines={2}>
        {value}
      </Text>
      {sub ? <Text style={type.small}>{sub}</Text> : null}
    </View>
  );
}

function trendCopy(s) {
  const diff = Math.abs(s.thisMonth - s.lastMonth);
  const n = (k) => `${k} ${k === 1 ? 'oops' : 'oopsies'}`;
  if (s.trend === 'down') {
    return { face: 'proud', text: `${n(s.thisMonth)} this month, ${diff} fewer than last month. It's working.` };
  }
  if (s.trend === 'up') {
    return { face: 'oops', text: `${n(s.thisMonth)} this month, ${diff} more than last month. Logging them is the first step.` };
  }
  return { face: 'calm', text: `${n(s.thisMonth)} this month, the same as last month.` };
}

export default function InsightsScreen({ navigation }) {
  const { mistakes } = useData();
  const { width } = useWindowDimensions();
  const s = useMemo(() => computeInsights(mistakes), [mistakes]);
  const [selected, setSelected] = useState(5);

  if (mistakes.length === 0) {
    return (
      <Screen>
        <Text style={[type.title, { marginTop: 16 }]}>Insights</Text>
        <EmptyState
          face="sleepy"
          title="No patterns yet"
          body="Log a few oopsies and Oopsy will show you what trips you up most, and whether it's getting better."
          action="Log an oops"
          onAction={() => navigation.navigate('NewMistake')}
        />
      </Screen>
    );
  }

  const trend = trendCopy(s);
  const chartWidth = width - 40 - 40;
  const barWidth = 24;
  const spacing = Math.max(10, (chartWidth - 6 * barWidth - 16) / 6);
  const maxMonth = Math.max(...s.months.map((m) => m.count), 1);
  const pick = s.months[selected];

  const chartData = s.months.map((m, i) => ({
    value: m.count,
    label: m.label,
    frontColor: i === selected ? colors.ink : colors.lavenderDeep,
    onPress: () => setSelected(i),
  }));

  const topCauses = s.causes.slice(0, 5);
  const maxCause = topCauses[0]?.count || 1;

  return (
    <Screen>
      <Text style={[type.title, { marginTop: 16 }]}>Insights</Text>
      <Text style={[type.bodySoft, { marginTop: 4 }]}>What your oopsies have in common.</Text>

      <View style={styles.hero}>
        <Blob size={84} face={trend.face} />
        <Text style={[type.heading, { flex: 1, fontSize: 19, lineHeight: 26 }]}>{trend.text}</Text>
      </View>

      <View style={styles.grid}>
        <Tile icon="git-branch-outline" iconBg={colors.lavender} bg={colors.lavenderSoft} label="Most common cause"
          value={s.topCause?.key ?? 'None yet'} sub={s.topCause ? `${s.topCause.count} times` : null} />
        <Tile icon={categoryIcon(s.topCategory?.key)} iconBg={colors.blush} bg={colors.blushSoft} label="Trickiest area"
          value={s.topCategory?.key ?? 'None yet'} sub={s.topCategory ? `${s.topCategory.count} oopsies` : null} />
        <Tile icon="trophy-outline" iconBg={colors.mint} bg={colors.mintSoft} label="Lessons mastered"
          value={`${s.mastered}`} sub={`of ${s.total} lessons`} />
        <Tile icon="flame-outline" iconBg={colors.sun} bg={colors.butter} label="Review streak"
          value={`${s.streak} ${s.streak === 1 ? 'day' : 'days'}`} sub={s.followRate !== null ? `${s.followRate}% of check-ins kept` : 'No check-ins yet'} />
      </View>

      <SectionTitle title="Oopsies per month" />
      <Card>
        <Text style={type.label}>
          {pick.label}: <Text style={{ fontFamily: fonts.bodyBold, color: colors.ink }}>{pick.count} {pick.count === 1 ? 'oops' : 'oopsies'}</Text>
        </Text>
        <Text style={[type.small, { marginBottom: 14 }]}>Tap a bar to see its month. Lower is better.</Text>
        <BarChart
          data={chartData}
          height={150}
          width={chartWidth}
          barWidth={barWidth}
          spacing={spacing}
          initialSpacing={8}
          endSpacing={0}
          barBorderTopLeftRadius={4}
          barBorderTopRightRadius={4}
          maxValue={Math.ceil(maxMonth * 1.15) || 1}
          noOfSections={3}
          yAxisThickness={0}
          yAxisLabelWidth={0}
          hideYAxisText
          xAxisThickness={1}
          xAxisColor={colors.line}
          rulesColor={colors.line}
          rulesType="solid"
          xAxisLabelTextStyle={{ fontFamily: fonts.body, fontSize: 11, color: colors.inkSoft }}
          disableScroll
          isAnimated
          animationDuration={500}
          onPress={(_, i) => setSelected(i)}
        />
      </Card>

      <SectionTitle title="What trips you up" />
      <Card>
        {topCauses.map((c, i) => (
          <View key={c.key} style={{ marginTop: i ? 14 : 0 }} accessible accessibilityLabel={`${c.key}, ${c.count}`}>
            <View style={styles.causeHead}>
              <Text style={type.body}>{c.key}</Text>
              <Text style={[type.body, { fontFamily: fonts.bodyBold }]}>{c.count}</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${(c.count / maxCause) * 100}%` }]} />
            </View>
          </View>
        ))}
      </Card>

      {s.totalSlips > 0 ? (
        <Text style={[type.small, { marginTop: 14, textAlign: 'center' }]}>
          {s.totalSlips} {s.totalSlips === 1 ? 'slip' : 'slips'} across {s.reviews} check-ins. Every slip is a chance to try again.
        </Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 22, backgroundColor: colors.white, borderRadius: radius.lg, padding: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 14 },
  tile: { width: '47.5%', flexGrow: 1, borderRadius: radius.lg, padding: 16 },
  tileIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  tileValue: { fontFamily: fonts.display, fontSize: 21, lineHeight: 26, color: colors.ink, marginTop: 2 },
  causeHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  track: { height: 10, borderRadius: 5, backgroundColor: colors.paper, overflow: 'hidden' },
  fill: { height: 10, borderRadius: 5, backgroundColor: colors.lavenderDeep },
});
