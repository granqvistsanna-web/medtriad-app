import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { theme } from '@/constants/theme';

// Solar Icons - Bold for focused, Linear for unfocused
import {
  HomeBold,
  HomeLinear,
  BookBold,
  BookMinimalisticLinear,
  ChartSquareBold,
  ChartSquareLinear,
  SettingsBold,
  SettingsLinear,
} from '@solar-icons/react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.brand.primary,
        tabBarInactiveTintColor: theme.colors.icon.muted,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface.primary,
          borderTopColor: theme.colors.border.default,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <HomeBold size={28} color={color} />
            ) : (
              <HomeLinear size={28} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <BookBold size={28} color={color} />
            ) : (
              <BookMinimalisticLinear size={28} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <ChartSquareBold size={28} color={color} />
            ) : (
              <ChartSquareLinear size={28} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <SettingsBold size={28} color={color} />
            ) : (
              <SettingsLinear size={28} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}
