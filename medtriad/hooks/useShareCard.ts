import { useRef, useState, useCallback } from 'react';
import { View } from 'react-native';
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
    // Guard: no ref or already sharing
    if (!cardRef.current || isSharing) {
      return;
    }

    setIsSharing(true);

    try {
      // Capture the view as a PNG image
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
        dialogTitle, // Android only - shows in share dialog header
      });
    } catch (error) {
      console.error('Share failed:', error);
    } finally {
      setIsSharing(false);
    }
  }, [isSharing]);

  return { cardRef, share, isSharing };
}
