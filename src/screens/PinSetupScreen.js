import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Blob from '../components/Blob';
import PinPad from '../components/PinPad';
import { IconButton } from '../components/ui';
import { useData } from '../storage/DataContext';
import { checkPin, clearPin, setPin } from '../storage/pin';
import Backdrop from '../components/Backdrop';
import { colors, type } from '../theme';

/**
 * mode 'set'     -> new PIN, confirm, enable lock
 * mode 'change'  -> current PIN, new PIN, confirm
 * mode 'disable' -> current PIN, then turn lock off
 */
export default function PinSetupScreen({ navigation, route }) {
  const mode = route.params?.mode ?? 'set';
  const { updateSettings } = useData();
  const [phase, setPhase] = useState(mode === 'set' ? 'new' : 'current');
  const [first, setFirst] = useState('');
  const [error, setError] = useState(null);

  const copy = {
    current: { title: 'Enter your current PIN', face: 'calm' },
    new: { title: 'Choose a 4-digit PIN', face: 'happy' },
    confirm: { title: 'Type it once more', face: 'oops' },
  }[phase];

  const onComplete = async (pin) => {
    setError(null);
    if (phase === 'current') {
      if (!(await checkPin(pin))) {
        setError("That PIN doesn't match. Try again.");
        return false;
      }
      if (mode === 'disable') {
        await clearPin();
        await updateSettings({ pinEnabled: false, biometricEnabled: false });
        navigation.goBack();
        return true;
      }
      setPhase('new');
      return true;
    }
    if (phase === 'new') {
      setFirst(pin);
      setPhase('confirm');
      return true;
    }
    if (pin !== first) {
      setError("Those PINs don't match. Choose a new one.");
      setPhase('new');
      setFirst('');
      return false;
    }
    await setPin(pin);
    await updateSettings({ pinEnabled: true });
    navigation.goBack();
    return true;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }}>
      <Backdrop />
      <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
        <IconButton icon="close" label="Cancel" onPress={() => navigation.goBack()} size={42} />
      </View>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 40 }}>
        <Blob size={110} face={error ? 'sad' : copy.face} />
        <Text style={[type.title, { marginTop: 14, textAlign: 'center' }]}>{copy.title}</Text>
        <Text style={[type.bodySoft, { marginTop: 6, marginBottom: 30, color: error ? '#A2404B' : colors.inkSoft, textAlign: 'center', paddingHorizontal: 24 }]}>
          {error ?? (phase === 'current' ? 'Just checking it’s you.' : 'You’ll enter it each time Oopsy opens.')}
        </Text>
        <PinPad key={phase} onComplete={onComplete} />
      </View>
    </SafeAreaView>
  );
}
