import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import Blob from '../components/Blob';
import { Header, IconButton, Screen, Squish } from '../components/ui';
import { useData } from '../storage/DataContext';
import { biometricAvailable } from '../storage/pin';
import { exportBackup, pickBackup } from '../storage/backup';
import { ensurePermission } from '../utils/notifications';
import { colors, fonts, radius, shadow, type } from '../theme';

const formatTime = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${`${m}`.padStart(2, '0')} ${suffix}`;
};

const shiftTime = (hhmm, minutes) => {
  const [h, m] = hhmm.split(':').map(Number);
  const total = (((h * 60 + m + minutes) % 1440) + 1440) % 1440;
  return `${`${Math.floor(total / 60)}`.padStart(2, '0')}:${`${total % 60}`.padStart(2, '0')}`;
};

function Group({ title, children }) {
  return (
    <View style={{ marginTop: 26 }}>
      <Text style={[type.heading, { fontSize: 18, marginBottom: 10 }]}>{title}</Text>
      <View style={[styles.group, shadow.soft]}>
        {React.Children.toArray(children)
          .filter(Boolean)
          .map((child, i) => (
            <View key={i}>
              {i > 0 && <View style={styles.divider} />}
              {child}
            </View>
          ))}
      </View>
    </View>
  );
}

function Row({ icon, iconBg = colors.lavenderSoft, title, subtitle, right, onPress, danger }) {
  const content = (
    <View style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={danger ? '#A2404B' : colors.ink} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[type.body, { fontFamily: fonts.bodyMedium }, danger && { color: '#A2404B' }]}>{title}</Text>
        {subtitle ? <Text style={type.small}>{subtitle}</Text> : null}
      </View>
      {right ?? (onPress ? <Ionicons name="chevron-forward" size={18} color={colors.inkFaint} /> : null)}
    </View>
  );
  return onPress ? (
    <Squish onPress={onPress} scaleTo={0.98} accessibilityRole="button" accessibilityLabel={title}>
      {content}
    </Squish>
  ) : (
    content
  );
}

const Toggle = ({ value, onValueChange, label }) => (
  <Switch
    value={value}
    onValueChange={onValueChange}
    trackColor={{ false: colors.line, true: colors.lavenderDeep }}
    thumbColor={colors.white}
    ios_backgroundColor={colors.line}
    accessibilityLabel={label}
  />
);

export default function SettingsScreen({ navigation }) {
  const { mistakes, settings, updateSettings, importData, resetAll } = useData();
  const [bioOk, setBioOk] = useState(false);
  const [name, setName] = useState(settings.name || '');

  useEffect(() => {
    biometricAvailable().then(setBioOk);
  }, []);

  const doExport = async () => {
    if (mistakes.length === 0) {
      Alert.alert('Nothing to back up yet', 'Log an oops first, then export your diary.');
      return;
    }
    try {
      await exportBackup(mistakes, settings);
    } catch (e) {
      Alert.alert('Export failed', e.message);
    }
  };

  const doImport = async () => {
    try {
      const backup = await pickBackup();
      if (!backup) return;
      const run = async (mode) => {
        const total = await importData(backup, mode);
        Alert.alert('Backup imported', `Your diary now has ${total} ${total === 1 ? 'entry' : 'entries'}.${backup.skipped ? ` ${backup.skipped} broken entries were skipped.` : ''}`);
      };
      Alert.alert(
        `Import ${backup.mistakes.length} ${backup.mistakes.length === 1 ? 'entry' : 'entries'}?`,
        'Merge keeps everything you have now and adds the backup. Replace swaps your diary for the backup.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Replace', style: 'destructive', onPress: () => run('replace') },
          { text: 'Merge', onPress: () => run('merge') },
        ],
      );
    } catch (e) {
      Alert.alert('Import failed', e.message);
    }
  };

  const doErase = () =>
    Alert.alert('Erase every oops?', 'This deletes all entries, lessons and review history on this device. Export a backup first if you might want them back.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Erase all', style: 'destructive', onPress: resetAll },
    ]);

  const toggleReminders = async (on) => {
    if (on && !(await ensurePermission())) {
      Alert.alert('Notifications are off', 'Allow notifications for Oopsy in your phone settings to get review reminders.');
      return;
    }
    updateSettings({ notificationsEnabled: on });
  };

  return (
    <Screen bottomInset={40} edges={['top', 'bottom']}>
      <Header title="Settings" onBack={() => navigation.goBack()} />

      <Group title="You">
        <View style={styles.row}>
          <View style={[styles.rowIcon, { backgroundColor: colors.butter }]}>
            <Ionicons name="happy-outline" size={18} color={colors.ink} />
          </View>
          <TextInput
            value={name}
            onChangeText={setName}
            onEndEditing={() => updateSettings({ name: name.trim() })}
            placeholder="Your name"
            placeholderTextColor={colors.inkFaint}
            style={styles.nameInput}
            maxLength={24}
            returnKeyType="done"
            accessibilityLabel="Your name"
          />
        </View>
      </Group>

      <Group title="Privacy">
        <Row
          icon="lock-closed-outline"
          title="PIN lock"
          subtitle={settings.pinEnabled ? 'Asks for your PIN when Oopsy opens' : 'Off'}
          right={
            <Toggle
              label="PIN lock"
              value={settings.pinEnabled}
              onValueChange={(on) => navigation.navigate('PinSetup', { mode: on ? 'set' : 'disable' })}
            />
          }
        />
        {settings.pinEnabled && bioOk ? (
          <Row
            icon="finger-print"
            title="Unlock with biometrics"
            subtitle="Face or fingerprint, with PIN as backup"
            right={<Toggle label="Biometric unlock" value={settings.biometricEnabled} onValueChange={(v) => updateSettings({ biometricEnabled: v })} />}
          />
        ) : null}
        {settings.pinEnabled ? (
          <Row icon="keypad-outline" title="Change PIN" onPress={() => navigation.navigate('PinSetup', { mode: 'change' })} />
        ) : null}
        <Row icon="phone-portrait-outline" iconBg={colors.mintSoft} title="Everything stays on this phone" subtitle="No account, no cloud, no tracking." />
      </Group>

      <Group title="Review reminders">
        <Row
          icon="notifications-outline"
          iconBg={colors.butter}
          title="Daily reminder"
          subtitle="Only on days when lessons are due"
          right={<Toggle label="Daily reminder" value={settings.notificationsEnabled} onValueChange={toggleReminders} />}
        />
        {settings.notificationsEnabled ? (
          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: colors.butter }]}>
              <Ionicons name="time-outline" size={18} color={colors.ink} />
            </View>
            <Text style={[type.body, { flex: 1, fontFamily: fonts.bodyMedium }]}>{formatTime(settings.notificationTime)}</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <IconButton icon="remove" size={36} label="Thirty minutes earlier" onPress={() => updateSettings({ notificationTime: shiftTime(settings.notificationTime, -30) })} />
              <IconButton icon="add" size={36} label="Thirty minutes later" onPress={() => updateSettings({ notificationTime: shiftTime(settings.notificationTime, 30) })} />
            </View>
          </View>
        ) : null}
      </Group>

      <Group title="Make it yours">
        <Row icon="git-branch-outline" title="Causes" subtitle={`${settings.customCauses.length} custom`} onPress={() => navigation.navigate('ManageList', { kind: 'causes' })} />
        <Row icon="pricetags-outline" title="Categories" subtitle={`${settings.customCategories.length} custom`} onPress={() => navigation.navigate('ManageList', { kind: 'categories' })} />
      </Group>

      <Group title="Your data">
        <Row icon="share-outline" iconBg={colors.mintSoft} title="Export backup" subtitle="Save a JSON file anywhere you like" onPress={doExport} />
        <Row icon="download-outline" iconBg={colors.mintSoft} title="Import backup" subtitle="Restore from an Oopsy JSON file" onPress={doImport} />
        <Row icon="trash-outline" iconBg={colors.blushSoft} title="Erase all oopsies" danger onPress={doErase} />
      </Group>

      <Group title="About">
        <Row icon="book-outline" title="Replay the intro" onPress={() => updateSettings({ onboardingDone: false })} />
        <Row icon="information-circle-outline" title="Version" right={<Text style={type.label}>{Constants.expoConfig?.version ?? '1.0.0'}</Text>} />
      </Group>

      <View style={{ alignItems: 'center', marginTop: 34 }}>
        <Blob size={72} face="happy" />
        <Text style={[type.heading, { marginTop: 10 }]}>Oops today, wiser tomorrow.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { backgroundColor: colors.white, borderRadius: radius.lg, paddingHorizontal: 16 },
  divider: { height: 1, backgroundColor: colors.line, marginLeft: 50 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  rowIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  nameInput: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.ink, paddingVertical: 4 },
});
