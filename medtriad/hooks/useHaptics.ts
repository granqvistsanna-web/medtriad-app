import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useState } from 'react';
import { loadSettings } from '@/services/settings-storage';

export function useHaptics() {
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  useEffect(() => {
    loadSettings().then((settings) => {
      setHapticsEnabled(settings.hapticsEnabled);
    });
  }, []);

  const triggerHaptic = useCallback(
    (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
      if (!hapticsEnabled) return;
      Haptics.impactAsync(style);
    },
    [hapticsEnabled]
  );

  const refreshSettings = useCallback(async () => {
    const settings = await loadSettings();
    setHapticsEnabled(settings.hapticsEnabled);
  }, []);

  return { triggerHaptic, hapticsEnabled, refreshSettings };
}
