import React, { useCallback, useEffect, useState } from 'react';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Blob from '../components/Blob';
import PinPad from '../components/PinPad';
import { MadeBy } from '../components/ui';
import { useData } from '../storage/DataContext';
import { authenticateBiometric, biometricAvailable, checkPin } from '../storage/pin';
import Backdrop from '../components/Backdrop';
import { colors, type } from '../theme';

export default function LockScreen({ onUnlock }) {
  const { settings } = useData();
  const [face, setFace] = useState('sleepy');
  const [canBio, setCanBio] = useState(false);

  const tryBiometric = useCallback(async () => {
    if (await authenticateBiometric()) onUnlock();
  }, [onUnlock]);

  useEffect(() => {
    if (!settings.biometricEnabled) return;
    biometricAvailable().then((ok) => {
      setCanBio(ok);
      if (ok) tryBiometric();
    });
  }, [settings.biometricEnabled, tryBiometric]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center' }}>
      <Backdrop />
      <Blob size={120} face={face} />
      <Text style={[type.title, { marginTop: 14 }]}>Welcome back</Text>
      <Text style={[type.bodySoft, { marginTop: 4, marginBottom: 32 }]}>Enter your PIN to open your diary</Text>
      <PinPad
        onBiometric={canBio ? tryBiometric : undefined}
        onComplete={async (pin) => {
          const ok = await checkPin(pin);
          if (ok) {
            setFace('happy');
            setTimeout(onUnlock, 180);
          } else {
            setFace('oops');
          }
          return ok;
        }}
      />
      <MadeBy style={{ position: 'absolute', bottom: 24 }} />
    </SafeAreaView>
  );
}
