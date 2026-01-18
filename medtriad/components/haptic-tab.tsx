import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { useState, useEffect } from 'react';
import { loadSettings } from '@/services/settings-storage';

export function HapticTab(props: BottomTabBarButtonProps) {
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  useEffect(() => {
    loadSettings().then((settings) => {
      setHapticsEnabled(settings.hapticsEnabled);
    });
  }, []);

  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios' && hapticsEnabled) {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}
