import Svg, { Path, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors } from '@/constants/theme';

type TierBadgeProps = {
  tierNumber: number;
  size?: number;
};

/**
 * Shield-shaped badge displaying the current tier number.
 *
 * Design features:
 * - Clean heraldic shield silhouette
 * - Subtle gradient for dimension
 * - Refined border for definition
 * - No container shadow (integrates cleanly with any background)
 *
 * Usage:
 *   <TierBadge tierNumber={tier.tier} />
 *   <TierBadge tierNumber={3} size={32} />
 */
export function TierBadge({ tierNumber, size = 26 }: TierBadgeProps) {
  const colors = Colors.light;

  // ViewBox for shield proportions
  const viewBoxWidth = 20;
  const viewBoxHeight = 24;

  // Clean shield path
  const shieldPath = 'M10 1 L18 4 L18 10 C18 16 14 20 10 22 C6 20 2 16 2 10 L2 4 Z';

  return (
    <Svg
      width={size}
      height={size * (viewBoxHeight / viewBoxWidth)}
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
    >
      <Defs>
        {/* Subtle vertical gradient */}
        <LinearGradient id="shieldFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#5DD4CC" stopOpacity="1" />
          <Stop offset="100%" stopColor={colors.primary} stopOpacity="1" />
        </LinearGradient>
      </Defs>

      {/* Shield fill */}
      <Path d={shieldPath} fill="url(#shieldFill)" />

      {/* Subtle border */}
      <Path
        d={shieldPath}
        fill="none"
        stroke={colors.primaryDark}
        strokeWidth="0.75"
      />

      {/* Tier number */}
      <SvgText
        x="10"
        y="14"
        textAnchor="middle"
        fontSize="10"
        fontWeight="700"
        fill={colors.textInverse}
      >
        {tierNumber}
      </SvgText>
    </Svg>
  );
}
