import Svg, { Path, Text as SvgText } from 'react-native-svg';
import { Colors } from '@/constants/theme';

type TierBadgeProps = {
  tierNumber: number;
  size?: number;
};

/**
 * Shield-shaped badge displaying the current tier number.
 *
 * Features:
 * - Shield SVG shape with pointed bottom
 * - Tier number (1-6) centered inside
 * - Uses colors.primary for shield fill
 * - Uses colors.textInverse for number text
 *
 * Usage:
 *   <TierBadge tierNumber={tier.tier} />
 *   <TierBadge tierNumber={3} size={40} />
 */
export function TierBadge({ tierNumber, size = 32 }: TierBadgeProps) {
  const colors = Colors.light;

  // Scale factor for viewBox to size conversion
  const viewBoxWidth = 24;
  const viewBoxHeight = 26;

  return (
    <Svg width={size} height={size * (viewBoxHeight / viewBoxWidth)} viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}>
      {/* Shield shape */}
      <Path
        d="M12 1 L22 5 L22 12 C22 18 17 22 12 24 C7 22 2 18 2 12 L2 5 Z"
        fill={colors.primary}
      />
      {/* Tier number centered in shield */}
      <SvgText
        x="12"
        y="14"
        textAnchor="middle"
        fontSize="12"
        fontWeight="700"
        fill={colors.textInverse}
      >
        {tierNumber}
      </SvgText>
    </Svg>
  );
}
