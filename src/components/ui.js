import React, { useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Backdrop from './Backdrop';
import { BORDER, colors, fonts, radius, shadow, space, type } from '../theme';

export const tap = (style = Haptics.ImpactFeedbackStyle.Light) => {
  Haptics.impactAsync(style).catch(() => {});
};

// Styles that position the element among its siblings belong on the outer Pressable;
// everything else (background, padding, radius) goes on the animated inner view.
const OUTER_KEYS = new Set([
  'flex', 'flexGrow', 'flexShrink', 'flexBasis', 'alignSelf', 'width', 'minWidth', 'maxWidth',
  'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight', 'marginHorizontal', 'marginVertical',
  'position', 'top', 'left', 'right', 'bottom', 'zIndex',
]);

const splitStyle = (style) => {
  const flat = StyleSheet.flatten(style) || {};
  const outer = {};
  const inner = {};
  Object.entries(flat).forEach(([k, v]) => {
    (OUTER_KEYS.has(k) ? outer : inner)[k] = v;
  });
  if (outer.flex || outer.flexGrow) inner.flexGrow = 1;
  return [outer, inner];
};

/** A Pressable that squishes slightly while held. */
export function Squish({ onPress, style, children, disabled, haptic = true, scaleTo = 0.96, ...rest }) {
  const [scale] = useState(() => new Animated.Value(1));
  const to = (v) => Animated.spring(scale, { toValue: v, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  const [outer, inner] = splitStyle(style);
  return (
    <Pressable
      style={outer}
      onPress={(e) => {
        if (haptic) tap();
        onPress?.(e);
      }}
      onPressIn={() => to(scaleTo)}
      onPressOut={() => to(1)}
      disabled={disabled}
      {...rest}
    >
      <Animated.View style={[inner, { transform: [{ scale }] }, disabled && { opacity: 0.45 }]}>{children}</Animated.View>
    </Pressable>
  );
}

export function MadeBy({ style }) {
  return (
    <Text style={[styles.madeBy, style]} accessibilityLabel="Made by Bharani">
      made by Bharani
    </Text>
  );
}

export function Screen({ children, scroll = true, contentStyle, edges = ['top'], footer = true, bottomInset = 120, refreshControl }) {
  if (!scroll) {
    return (
      <SafeAreaView edges={edges} style={styles.screen}>
        <Backdrop />
        <View style={[{ flex: 1, paddingHorizontal: 20 }, contentStyle]}>{children}</View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView edges={edges} style={styles.screen}>
      <Backdrop />
      <ScrollView
        contentContainerStyle={[{ paddingHorizontal: 20, paddingBottom: bottomInset, flexGrow: 1 }, contentStyle]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={refreshControl}
      >
        {children}
        {footer && (
          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            <MadeBy />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const BUTTON_VARIANTS = {
  primary: { bg: colors.ink, fg: colors.paper },
  lavender: { bg: colors.lavender, fg: colors.ink },
  soft: { bg: colors.lavenderSoft, fg: colors.ink },
  ghost: { bg: 'transparent', fg: colors.ink },
  danger: { bg: colors.blushSoft, fg: '#A2404B' },
  mint: { bg: colors.mint, fg: colors.ink },
};

export function Button({ title, onPress, variant = 'primary', icon, disabled, style, size = 'lg' }) {
  const v = BUTTON_VARIANTS[variant];
  return (
    <Squish
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={[
        styles.button,
        size === 'sm' && styles.buttonSm,
        { backgroundColor: v.bg },
        variant !== 'primary' && variant !== 'ghost' && shadow.soft,
        variant === 'primary' && { shadowColor: colors.lavenderDeep, shadowOpacity: 1, shadowRadius: 0, shadowOffset: { width: 4, height: 4 } },
        variant === 'ghost' && { borderColor: colors.ink },
        style,
      ]}
    >
      {icon && <Ionicons name={icon} size={size === 'sm' ? 16 : 19} color={v.fg} style={{ marginRight: 8 }} />}
      <Text style={[type.button, { color: v.fg }, size === 'sm' && { fontSize: 14 }]}>{title}</Text>
    </Squish>
  );
}

export function IconButton({ icon, onPress, label, bg = colors.white, color = colors.ink, size = 46, style }) {
  return (
    <Squish
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', borderWidth: BORDER, borderColor: colors.ink }, shadow.soft, style]}
    >
      <Ionicons name={icon} size={size * 0.44} color={color} />
    </Squish>
  );
}

export function Chip({ label, selected, onPress, icon, tone = 'lavender', small }) {
  const selBg = tone === 'butter' ? colors.sun : colors.lavender;
  return (
    <Squish
      onPress={onPress}
      scaleTo={0.92}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      style={[
        styles.chip,
        small && styles.chipSmall,
        selected ? { backgroundColor: selBg, ...shadow.soft, shadowOffset: { width: 2, height: 2 } } : null,
      ]}
    >
      {icon && <Ionicons name={icon} size={small ? 13 : 15} color={colors.ink} style={{ marginRight: 6 }} />}
      <Text style={[styles.chipText, small && { fontSize: 13 }, selected && { fontFamily: fonts.bodyBold }]}>{label}</Text>
    </Squish>
  );
}

export function Tag({ label, bg = colors.butter, fg = colors.ink }) {
  return (
    <View style={[styles.tag, { backgroundColor: bg }]}>
      <Text style={[styles.tagText, { color: fg }]}>{label}</Text>
    </View>
  );
}

export function Card({ children, style, onPress, tint = colors.white }) {
  const body = <View style={[styles.card, { backgroundColor: tint }, style]}>{children}</View>;
  if (!onPress) return body;
  return (
    <Squish onPress={onPress} scaleTo={0.98} style={[styles.card, { backgroundColor: tint }, style]}>
      {children}
    </Squish>
  );
}

export function Header({ title, onBack, right, subtitle }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        {onBack ? <IconButton icon="arrow-back" onPress={onBack} label="Go back" /> : <View style={{ width: 46 }} />}
        <View style={{ flexDirection: 'row', gap: 10 }}>{right}</View>
      </View>
      {title ? <Text style={[type.title, { marginTop: space.lg }]}>{title}</Text> : null}
      {subtitle ? <Text style={[type.bodySoft, { marginTop: 4 }]}>{subtitle}</Text> : null}
    </View>
  );
}

export function SectionTitle({ title, action, onAction }) {
  return (
    <View style={styles.sectionTitle}>
      <Text style={type.heading}>{title}</Text>
      {action ? (
        <Pressable onPress={onAction} hitSlop={10} accessibilityRole="button">
          <Text style={[type.label, { color: colors.ink, fontFamily: fonts.bodyBold, textDecorationLine: 'underline' }]}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Field({ label, hint, style, inputStyle, big, ...props }) {
  return (
    <View style={[{ marginBottom: space.lg }, style]}>
      {label ? <Text style={[type.label, { marginBottom: 8, color: colors.ink }]}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.inkFaint}
        style={[styles.input, big && styles.inputBig, props.multiline && { minHeight: 110, textAlignVertical: 'top' }, inputStyle]}
        {...props}
      />
      {hint ? <Text style={[type.small, { marginTop: 6 }]}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  madeBy: {
    textAlign: 'center',
    fontFamily: fonts.displayItalic,
    fontSize: 13,
    color: colors.ink,
    opacity: 0.35,
    marginTop: 36,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  button: {
    height: 58,
    borderRadius: radius.pill,
    borderWidth: BORDER,
    borderColor: colors.ink,
    paddingHorizontal: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSm: { height: 42, paddingHorizontal: 18 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.ink,
  },
  chipSmall: { height: 34, paddingHorizontal: 12 },
  chipText: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.ink },
  tag: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.ink },
  tagText: { fontFamily: fonts.bodyMedium, fontSize: 12 },
  card: { borderRadius: radius.lg, padding: 20, borderWidth: BORDER, borderColor: colors.ink, ...shadow.soft },
  header: { paddingTop: 8, marginBottom: space.lg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: space.xxl,
    marginBottom: space.md,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingHorizontal: 18,
    paddingVertical: 15,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.ink,
    borderWidth: BORDER,
    borderColor: colors.ink,
  },
  inputBig: { fontFamily: fonts.display, fontSize: 22, lineHeight: 28, paddingVertical: 18 },
});
