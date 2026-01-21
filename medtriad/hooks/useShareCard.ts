import { useRef, useState, useCallback } from 'react';
import { Platform, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

/**
 * Hook for capturing and sharing a view as an image
 *
 * Usage:
 * ```tsx
 * const { cardRef, share, isSharing } = useShareCard();
 *
 * return (
 *   <View ref={cardRef}>
 *     <ShareCard ... />
 *   </View>
 *   <Button onPress={share} disabled={isSharing}>Share</Button>
 * );
 * ```
 */
export function useShareCard(): {
  cardRef: React.RefObject<View | null>;
  share: (dialogTitle?: string) => Promise<void>;
  isSharing: boolean;
} {
  const cardRef = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);

  const share = useCallback(async (dialogTitle?: string) => {
    // Guard: already sharing
    if (isSharing) {
      return;
    }

    setIsSharing(true);

    try {
      // Web: use Web Share API with text (react-native-view-shot doesn't work on web)
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({
            title: dialogTitle || 'MedTriads',
            text: 'Challenge me on MedTriads! Can you beat my score?',
            url: 'https://medtriads.app',
          });
        } else {
          // Fallback: copy to clipboard
          await navigator.clipboard.writeText(
            'Challenge me on MedTriads! Can you beat my score? https://medtriads.app'
          );
          alert('Link copied to clipboard!');
        }
        return;
      }

      // Native: capture view as image and share
      if (!cardRef.current) {
        return;
      }

      const uri = await captureRef(cardRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      // Check if sharing is available on this device
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        console.error('Share failed: Sharing not available on this device');
        return;
      }

      // Open native share sheet
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle,
      });
    } catch (error) {
      // User cancelled share - not an error
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      console.error('Share failed:', error);
    } finally {
      setIsSharing(false);
    }
  }, [isSharing]);

  return { cardRef, share, isSharing };
}
