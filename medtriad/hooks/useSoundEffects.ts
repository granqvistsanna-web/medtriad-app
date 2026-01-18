import { useAudioPlayer } from 'expo-audio';
import { useCallback, useEffect, useState } from 'react';
import { loadSettings } from '@/services/settings-storage';

type SoundType = 'correct' | 'incorrect' | 'combo';

export function useSoundEffects() {
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Load settings on mount
  useEffect(() => {
    loadSettings().then((settings) => {
      setSoundEnabled(settings.soundEnabled);
    });
  }, []);

  // Preload all sounds with downloadFirst for instant playback
  const correctPlayer = useAudioPlayer(
    require('@/assets/sounds/correct.mp3')
  );
  const incorrectPlayer = useAudioPlayer(
    require('@/assets/sounds/incorrect.mp3')
  );
  const comboPlayer = useAudioPlayer(
    require('@/assets/sounds/combo.mp3')
  );

  const playSound = useCallback((type: SoundType) => {
    if (!soundEnabled) return;

    const player = {
      correct: correctPlayer,
      incorrect: incorrectPlayer,
      combo: comboPlayer,
    }[type];

    // Seek to start for replay capability, then play
    player.seekTo(0);
    player.play();
  }, [soundEnabled, correctPlayer, incorrectPlayer, comboPlayer]);

  // Allow refreshing settings if changed during quiz
  const refreshSettings = useCallback(async () => {
    const settings = await loadSettings();
    setSoundEnabled(settings.soundEnabled);
  }, []);

  return { playSound, refreshSettings };
}
