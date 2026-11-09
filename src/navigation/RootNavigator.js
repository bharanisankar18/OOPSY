import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useData } from '../storage/DataContext';
import { dueLessons } from '../utils/scheduler';
import { colors } from '../theme';
import TabBar from '../components/TabBar';
import { previewStack, previewStep, previewTab } from '../utils/devPreview';

import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import LogScreen from '../screens/LogScreen';
import ReviewScreen from '../screens/ReviewScreen';
import LessonsScreen from '../screens/LessonsScreen';
import InsightsScreen from '../screens/InsightsScreen';
import NewMistakeScreen from '../screens/NewMistakeScreen';
import MistakeDetailScreen from '../screens/MistakeDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PinSetupScreen from '../screens/PinSetupScreen';
import ManageListScreen from '../screens/ManageListScreen';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

const theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.paper, card: colors.paper, text: colors.ink, primary: colors.lavenderDeep },
};

function MainTabs() {
  const { mistakes } = useData();
  const due = dueLessons(mistakes).length;
  return (
    <Tabs.Navigator
      initialRouteName={previewTab()}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.paper } }}
      tabBar={(props) => <TabBar {...props} badges={{ Review: due }} />}
    >
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Log" component={LogScreen} />
      <Tabs.Screen name="Review" component={ReviewScreen} />
      <Tabs.Screen name="Lessons" component={LessonsScreen} />
      <Tabs.Screen name="Insights" component={InsightsScreen} />
    </Tabs.Navigator>
  );
}

export default function RootNavigator() {
  const { settings } = useData();
  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator initialRouteName={settings.onboardingDone ? previewStack() : undefined} screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper } }}>
        {!settings.onboardingDone ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="NewMistake" component={NewMistakeScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} initialParams={{ step: previewStep() }} />
            <Stack.Screen name="MistakeDetail" component={MistakeDetailScreen} options={{ animation: 'slide_from_right' }} initialParams={{ id: 'demo-0' }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="PinSetup" component={PinSetupScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="ManageList" component={ManageListScreen} options={{ animation: 'slide_from_right' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
