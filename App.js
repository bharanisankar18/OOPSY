import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Platform, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { BricolageGrotesque_500Medium, BricolageGrotesque_800ExtraBold } from '@expo-google-fonts/bricolage-grotesque';
import { Figtree_400Regular, Figtree_400Regular_Italic, Figtree_500Medium, Figtree_700Bold } from '@expo-google-fonts/figtree';
import { SpaceMono_700Bold } from '@expo-google-fonts/space-mono';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DataProvider, useData } from './src/storage/DataContext';
import RootNavigator from './src/navigation/RootNavigator';
import LockScreen from './src/screens/LockScreen';
import { colors } from './src/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

// Share sheets and the file picker briefly background the app; don't re-lock for those.
const RELOCK_AFTER_MS = 60 * 1000;

function Shell() {
  const { ready, settings } = useData();
  const [locked, setLocked] = useState(null);
  const backgroundedAt = useRef(null);

  const isLocked = locked !== null ? locked : settings.pinEnabled;

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background') backgroundedAt.current = Date.now();
      if (state === 'active' && backgroundedAt.current) {
        const away = Date.now() - backgroundedAt.current;
        backgroundedAt.current = null;
        if (settings.pinEnabled && away > RELOCK_AFTER_MS) setLocked(true);
      }
    });
    return () => sub.remove();
  }, [settings.pinEnabled]);

  const onLayout = useCallback(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  const content = (
    <View style={{ flex: 1, backgroundColor: colors.paper }} onLayout={onLayout}>
      <RootNavigator />
      {isLocked && settings.pinEnabled ? (
        <View style={StyleSheet.absoluteFill}>
          <LockScreen onUnlock={() => setLocked(false)} />
        </View>
      ) : null}
    </View>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <View style={styles.webFrame}>{content}</View>
      </View>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    backgroundColor: '#0f1115',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  },
  webFrame: {
    width: '100%',
    maxWidth: 440,
    height: '100%',
    maxHeight: 932,
    backgroundColor: colors.paper,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#22252d',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 32,
    elevation: 10,
  },
});

export default function App() {
  const [fontsLoaded] = useFonts({
    BricolageGrotesque_500Medium,
    BricolageGrotesque_800ExtraBold,
    Figtree_400Regular,
    Figtree_400Regular_Italic,
    Figtree_500Medium,
    Figtree_700Bold,
    SpaceMono_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <DataProvider>
        <StatusBar style="dark" />
        <Shell />
      </DataProvider>
    </SafeAreaProvider>
  );
}
