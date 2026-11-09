import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BORDER, colors, fonts, shadow } from '../theme';
import { Squish } from './ui';

const ICONS = {
  Home: ['home', 'home-outline'],
  Log: ['reader', 'reader-outline'],
  Review: ['albums', 'albums-outline'],
  Lessons: ['bulb', 'bulb-outline'],
  Insights: ['stats-chart', 'stats-chart-outline'],
};

export default function TabBar({ state, navigation, badges = {} }) {
  const insets = useSafeAreaInsets();
  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: Math.max(insets.bottom, 12) }]}>
      <View style={[styles.pill, shadow.lifted]}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const [on, off] = ICONS[route.name];
          const badge = badges[route.name];
          return (
            <Squish
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={badge ? `${route.name}, ${badge} due` : route.name}
              scaleTo={0.88}
              onPress={() => {
                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
              }}
              style={[styles.tab, focused && styles.tabActive]}
            >
              <Ionicons name={focused ? on : off} size={21} color={colors.ink} />
              {badge ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
                </View>
              ) : null}
            </Squish>
          );
        })}
      </View>
      <Squish
        accessibilityRole="button"
        accessibilityLabel="Log an oops"
        onPress={() => navigation.navigate('NewMistake')}
        scaleTo={0.88}
        style={[styles.fab, shadow.lifted]}
      >
        <Ionicons name="add" size={30} color={colors.ink} />
      </Squish>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  pill: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 999,
    borderWidth: BORDER,
    borderColor: colors.ink,
    padding: 6,
    gap: 3,
  },
  tab: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: colors.lavender, borderWidth: 2, borderColor: colors.ink },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.blush,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: BORDER,
    borderColor: colors.ink,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 3,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: colors.sun,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.ink,
  },
  badgeText: { fontFamily: fonts.bodyBold, fontSize: 9, color: colors.ink },
});
