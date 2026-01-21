import {
  View,
  FlatList,
  useWindowDimensions,
  Pressable,
  StyleSheet,
  TextInput,
  Keyboard,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  FadeInUp,
  FadeInDown,
  FadeIn,
  FadeOut,
  runOnJS,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
  Easing,
  interpolate,
  interpolateColor,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Play, ClockCircle, AltArrowRight, AltArrowLeft } from '@solar-icons/react-native/Bold';
import * as Haptics from 'expo-haptics';

import { Text, Button } from '@/components/primitives';
import { theme, Spacing, Durations, Colors, Radius } from '@/constants/theme';
import { saveUserName, completeOnboarding } from '@/services/stats-storage';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<PageData>);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Mascot images
const triThinking = require('@/assets/images/tri-thinking.png');
const triNeutral = require('@/assets/images/tri-neutral.png');
const triLvl1 = require('@/assets/images/tri-lvl1.png');
const triSuccess = require('@/assets/images/tri-success.png');
const triChill = require('@/assets/images/tri-chill.png');
const triLvl6 = require('@/assets/images/tri-lvl6.png');

type PageData = {
  id: string;
  title: string;
  subtitle: string;
  mascotImage: number; // Expo Image source
  content?: 'triad' | 'quiz' | 'levels' | 'streak' | 'ready' | 'name';
};

const PAGES: PageData[] = [
  {
    id: '1',
    title: 'Welcome to\nMed Triads',
    subtitle: 'Master classic medical triads — three symptoms that point to one diagnosis',
    mascotImage: triThinking,
    content: 'triad',
  },
  {
    id: '2',
    title: "What's your\nname?",
    subtitle: "We'll use this to personalize your experience",
    mascotImage: triChill,
    content: 'name',
  },
  {
    id: '3',
    title: 'See It, Name It',
    subtitle: 'See three findings, tap the correct diagnosis before time runs out',
    mascotImage: triNeutral,
    content: 'quiz',
  },
  {
    id: '4',
    title: 'Rise Through\nthe Ranks',
    subtitle: 'Earn points and level up from Student to Chief',
    mascotImage: triLvl1,
    content: 'levels',
  },
  {
    id: '5',
    title: 'Build Your\nStreak',
    subtitle: 'Answer correctly in a row to multiply your points',
    mascotImage: triSuccess,
    content: 'streak',
  },
  {
    id: '6',
    title: 'Ready to\nBegin?',
    subtitle: 'Master all 45 triads and become the Chief!',
    mascotImage: triLvl6,
    content: 'ready',
  },
];

// =============================================================================
// PAGINATION DOTS - Enhanced with progress indicator
// =============================================================================

type PaginationDotsProps = {
  scrollX: SharedValue<number>;
  count: number;
  width: number;
  currentPage: number;
};

function PaginationDots({ scrollX, count, width, currentPage }: PaginationDotsProps) {
  const colors = Colors.light;

  return (
    <View
      style={styles.paginationContainer}
      accessibilityRole="adjustable"
      accessibilityLabel={`Page ${currentPage + 1} of ${count}`}
      accessibilityHint="Swipe left or right to navigate between pages"
    >
      {/* Progress text */}
      <View style={styles.progressTextContainer}>
        <Text variant="caption" color="secondary" style={styles.progressText}>
          {currentPage + 1} of {count}
        </Text>
      </View>

      {/* Dots */}
      <View style={styles.dotsRow} accessibilityElementsHidden>
        {Array.from({ length: count }).map((_, index) => (
          <PaginationDot key={index} index={index} scrollX={scrollX} width={width} />
        ))}
      </View>
    </View>
  );
}

function PaginationDot({ index, scrollX, width }: { index: number; scrollX: SharedValue<number>; width: number }) {
  const colors = Colors.light;

  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const dotWidth = interpolate(
      scrollX.value,
      inputRange,
      [8, 28, 8],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.3, 1, 0.3],
      Extrapolation.CLAMP
    );

    return {
      width: dotWidth,
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        styles.dot,
        { backgroundColor: colors.primary },
        animatedStyle,
      ]}
    />
  );
}

// =============================================================================
// SWIPE HINT - Animated hand gesture
// =============================================================================

function SwipeHint({ visible }: { visible: boolean }) {
  const colors = Colors.light;
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    if (visible) {
      opacity.value = withDelay(1500, withTiming(1, { duration: 400 }));
      translateX.value = withDelay(
        1800,
        withRepeat(
          withSequence(
            withTiming(0, { duration: 0 }),
            withTiming(20, { duration: 600, easing: Easing.inOut(Easing.ease) }),
            withTiming(0, { duration: 400, easing: Easing.out(Easing.ease) })
          ),
          3,
          false
        )
      );
    } else {
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.swipeHint, animatedStyle]}
      accessibilityLabel="Swipe to continue to the next page"
      accessibilityRole="text"
    >
      <View style={[styles.swipeHintPill, { backgroundColor: colors.primaryUltraLight }]}>
        <Text variant="caption" color={colors.primary} style={styles.swipeHintText}>
          Swipe to continue
        </Text>
        <AltArrowRight size={16} color={colors.primary} />
      </View>
    </Animated.View>
  );
}

// =============================================================================
// NAME INPUT COMPONENT
// =============================================================================

type NameInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
};

function NameInput({ value, onChangeText, onSubmit }: NameInputProps) {
  const colors = Colors.light;
  const inputRef = useRef<TextInput>(null);
  const focusScale = useSharedValue(1);
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    focusScale.value = withSpring(1.02, { damping: 15 });
    Haptics.selectionAsync();
  };

  const handleBlur = () => {
    setIsFocused(false);
    focusScale.value = withSpring(1, { damping: 15 });
  };

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: focusScale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInUp.delay(400).duration(500).springify()}
      style={[styles.nameInputContainer, containerStyle]}
    >
      <View
        style={[
          styles.nameInputWrapper,
          {
            backgroundColor: colors.background,
            borderColor: isFocused ? colors.primary : colors.border,
            borderWidth: isFocused ? 2 : 1,
          },
        ]}
      >
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={onSubmit}
          placeholder="Enter your name"
          placeholderTextColor={colors.textMuted}
          style={[styles.nameInput, { color: colors.text }]}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
          maxLength={20}
          accessibilityLabel="Your name (optional)"
          accessibilityHint="Enter your name for a personalized experience, or leave blank to skip"
        />
      </View>

      {/* Helper text */}
      <Animated.View entering={FadeIn.delay(600).duration(300)}>
        <Text variant="caption" color="secondary" style={styles.nameHelperText}>
          You can skip this if you prefer
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

// =============================================================================
// CONTENT COMPONENTS
// =============================================================================

// Triad demonstration component
function TriadDemo() {
  const colors = Colors.light;
  return (
    <Animated.View
      entering={FadeInUp.delay(400).duration(500)}
      style={styles.triadContainer}
    >
      <View style={styles.symptomsRow}>
        <Animated.View entering={FadeInUp.delay(500).duration(400)} style={[styles.symptomChip, { borderColor: colors.gold + '40', backgroundColor: colors.goldLight }]}>
          <Text style={[styles.symptomText, { color: colors.goldText }]}>Dry eyes</Text>
        </Animated.View>
        <Animated.View entering={FadeInUp.delay(600).duration(400)} style={[styles.symptomChip, { borderColor: colors.gold + '40', backgroundColor: colors.goldLight }]}>
          <Text style={[styles.symptomText, { color: colors.goldText }]}>Dry mouth</Text>
        </Animated.View>
        <Animated.View entering={FadeInUp.delay(700).duration(400)} style={[styles.symptomChip, { borderColor: colors.gold + '40', backgroundColor: colors.goldLight }]}>
          <Text style={[styles.symptomText, { color: colors.goldText }]}>Parotid swelling</Text>
        </Animated.View>
      </View>
      <Animated.View entering={FadeIn.delay(900).duration(300)} style={styles.arrowDown}>
        <View style={[styles.arrowLine, { backgroundColor: colors.border }]} />
        <View style={[styles.arrowHead, { borderTopColor: colors.border }]} />
      </Animated.View>
      <Animated.View entering={FadeInUp.delay(1000).duration(400)} style={[styles.diagnosisChip, { backgroundColor: colors.primary }]}>
        <Text style={styles.diagnosisText}>Sjögren Syndrome</Text>
      </Animated.View>
    </Animated.View>
  );
}

// Mini quiz preview component
function QuizPreview() {
  const colors = Colors.light;
  const timerWidth = useSharedValue(100);
  const [countdown, setCountdown] = useState(12);

  useEffect(() => {
    // Animate the progress bar once (100% → 0%)
    timerWidth.value = withDelay(
      500, // Small delay before starting
      withTiming(0, { duration: 3000, easing: Easing.linear })
    );

    // Animate the countdown number (12 → 0) once
    let currentCount = 12;
    const countdownInterval = setInterval(() => {
      currentCount -= 1;
      if (currentCount >= 0) {
        setCountdown(currentCount);
      } else {
        clearInterval(countdownInterval);
      }
    }, 250); // 3000ms / 12 steps = 250ms per step

    return () => clearInterval(countdownInterval);
  }, []);

  const timerStyle = useAnimatedStyle(() => ({
    width: `${timerWidth.value}%`,
  }));

  return (
    <Animated.View
      entering={FadeInUp.delay(300).duration(500)}
      style={[styles.quizPreview, { backgroundColor: colors.background }]}
    >
      <View style={styles.quizHeader}>
        <Text style={[styles.quizCounter, { color: colors.textMuted }]}>1 of 10</Text>
        <View style={styles.quizTimer}>
          <ClockCircle size={14} color={colors.primary} />
          <Text style={[styles.timerText, { color: colors.primary }]}>{countdown}s</Text>
        </View>
      </View>

      <View style={[styles.timerBar, { backgroundColor: colors.backgroundSecondary }]}>
        <Animated.View style={[styles.timerProgress, timerStyle, { backgroundColor: colors.gold }]} />
      </View>

      <Text style={[styles.quizCategory, { color: colors.primary }]}>CARDIOLOGY</Text>

      <View style={styles.quizFindings}>
        {['Hypotension', 'Muffled heart sounds', 'JVD'].map((finding, i) => (
          <View key={i} style={styles.findingRow}>
            <View style={[styles.findingNum, { backgroundColor: colors.primary }]}>
              <Text style={styles.findingNumText}>{i + 1}</Text>
            </View>
            <Text style={[styles.findingText, { color: colors.text }]}>{finding}</Text>
          </View>
        ))}
      </View>

      <View style={styles.quizOptions}>
        <View style={[styles.quizOption, { backgroundColor: colors.backgroundSecondary }]}>
          <View style={[styles.optionLetter, { backgroundColor: colors.textMuted }]}>
            <Text style={styles.optionLetterText}>A</Text>
          </View>
          <Text style={[styles.optionText, { color: colors.text }]}>Aortic Dissection</Text>
        </View>
        <View style={[styles.quizOption, styles.correctOption, { backgroundColor: colors.successBg, borderColor: colors.success }]}>
          <View style={[styles.optionLetter, { backgroundColor: colors.success }]}>
            <Text style={styles.optionLetterText}>B</Text>
          </View>
          <Text style={[styles.optionText, { color: colors.text }]}>Cardiac Tamponade ✓</Text>
        </View>
      </View>
    </Animated.View>
  );
}

// Level ladder component
function LevelLadder() {
  const colors = Colors.light;
  const levels = [
    { name: 'Student', points: '0 - 300 pts', emoji: '📚', current: true },
    { name: 'Intern', points: '300 - 1,000 pts', emoji: '🩺' },
    { name: 'Resident', points: '1,000 - 3,000 pts', emoji: '💉' },
    { name: 'Attending', points: '3,000 - 10,000 pts', emoji: '⚕️' },
    { name: 'Chief', points: '10,000+ pts', emoji: '👑' },
  ];

  return (
    <View style={styles.levelLadder}>
      {levels.map((level, i) => (
        <Animated.View
          key={level.name}
          entering={FadeInUp.delay(300 + i * 80).duration(400)}
          style={[
            styles.levelItem,
            { backgroundColor: colors.background },
            level.current && { borderColor: colors.gold, borderWidth: 2, backgroundColor: colors.goldLight }
          ]}
        >
          <View style={[styles.levelBadge, { backgroundColor: level.current ? colors.goldLight : colors.backgroundSecondary }]}>
            <Text style={{ fontSize: 18 }}>{level.emoji}</Text>
          </View>
          <View style={styles.levelInfo}>
            <Text style={[styles.levelName, { color: colors.text }]}>{level.name}</Text>
            <Text style={[styles.levelPoints, { color: colors.textMuted }]}>{level.points}</Text>
          </View>
          {level.current && (
            <View style={[styles.youBadge, { backgroundColor: colors.gold }]}>
              <Text style={styles.youBadgeText}>YOU</Text>
            </View>
          )}
        </Animated.View>
      ))}
    </View>
  );
}

// Streak demo component
function StreakDemo() {
  const colors = Colors.light;
  const checkmarks = [true, true, true, false, false];
  const multiplierScale = useSharedValue(1);

  useEffect(() => {
    multiplierScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 600, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 600, easing: Easing.in(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const multiplierStyle = useAnimatedStyle(() => ({
    transform: [{ scale: multiplierScale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInUp.delay(300).duration(500)}
      style={[styles.streakDemo, { backgroundColor: colors.background }]}
    >
      <Animated.Text style={[styles.streakMultiplier, { color: colors.primary }, multiplierStyle]}>
        3x
      </Animated.Text>
      <Text style={[styles.streakLabel, { color: colors.textMuted }]}>STREAK MULTIPLIER</Text>

      <View style={styles.streakAnswers}>
        {checkmarks.map((correct, i) => (
          <Animated.View
            key={i}
            entering={FadeInUp.delay(500 + i * 100).duration(300)}
            style={[
              styles.streakDot,
              { backgroundColor: correct ? colors.successBg : colors.backgroundSecondary }
            ]}
          >
            <Text style={{ color: correct ? colors.success : colors.textMuted, fontSize: 16, fontWeight: '600' }}>
              {correct ? '✓' : '?'}
            </Text>
          </Animated.View>
        ))}
      </View>

      <View style={[styles.quickRounds, { backgroundColor: colors.goldLight }]}>
        <ClockCircle size={16} color={colors.goldText} />
        <Text style={[styles.quickRoundsText, { color: colors.goldText }]}>Quick 10-question rounds</Text>
      </View>
    </Animated.View>
  );
}

// =============================================================================
// MAIN SCREEN
// =============================================================================

export default function OnboardingScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const colors = Colors.light;
  const flatListRef = useRef<FlatList<PageData>>(null);

  const scrollX = useSharedValue(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [userName, setUserName] = useState('');
  const [showSwipeHint, setShowSwipeHint] = useState(true);

  const updateCurrentPage = useCallback((page: number) => {
    setCurrentPage(page);
    // Hide swipe hint after first swipe
    if (page > 0 && showSwipeHint) {
      setShowSwipeHint(false);
    }
  }, [showSwipeHint]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
      const page = Math.round(event.contentOffset.x / width);
      runOnJS(updateCurrentPage)(page);
    },
  });

  const handleSkip = async () => {
    await completeOnboarding();
    router.replace('/(tabs)');
  };

  const handleGetStarted = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Save the name if provided
    if (userName.trim()) {
      await saveUserName(userName.trim());
    }
    await completeOnboarding();

    router.replace('/(tabs)');
  };

  const handleContinue = () => {
    Haptics.selectionAsync();
    Keyboard.dismiss();

    if (currentPage < PAGES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentPage + 1,
        animated: true,
      });
    }
  };

  const isLastPage = currentPage === PAGES.length - 1;
  const isNamePage = PAGES[currentPage]?.content === 'name';

  // Button animation
  const buttonScale = useSharedValue(1);
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleButtonPressIn = () => {
    buttonScale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
  };

  const handleButtonPressOut = () => {
    buttonScale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const renderPage = ({ item, index }: { item: PageData; index: number }) => (
    <View style={[styles.page, { width, paddingTop: insets.top + 48 }]}>
      {/* Mascot */}
      <Animated.View
        entering={FadeInUp.delay(index * 50).duration(Durations.normal).springify()}
        style={styles.mascotContainer}
        accessible={false}
        importantForAccessibility="no-hide-descendants"
      >
        <Image
          source={item.mascotImage}
          style={item.content === 'ready' ? styles.mascotLarge : styles.mascot}
          contentFit="contain"
          accessibilityElementsHidden
        />
      </Animated.View>

      {/* Title */}
      <Animated.View entering={FadeInUp.delay(150).duration(400)}>
        <Text variant="title" align="center" style={styles.title}>
          {item.title}
        </Text>
      </Animated.View>

      {/* Subtitle */}
      <Animated.View entering={FadeInUp.delay(250).duration(400)}>
        <Text variant="body" color="secondary" align="center" style={styles.subtitle}>
          {item.subtitle}
        </Text>
      </Animated.View>

      {/* Content based on slide type */}
      <View style={styles.contentContainer}>
        {item.content === 'triad' && <TriadDemo />}
        {item.content === 'name' && (
          <NameInput
            value={userName}
            onChangeText={setUserName}
            onSubmit={handleContinue}
          />
        )}
        {item.content === 'quiz' && <QuizPreview />}
        {item.content === 'levels' && <LevelLadder />}
        {item.content === 'streak' && <StreakDemo />}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Skip button */}
      <Pressable
        onPress={handleSkip}
        style={[
          styles.skipButton,
          { top: insets.top + Spacing.sm, right: Spacing.lg },
        ]}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Skip onboarding"
        accessibilityHint="Skip the tutorial and go directly to the app"
      >
        <Text variant="label" color="secondary">Skip</Text>
      </Pressable>

      {/* Pages */}
      <AnimatedFlatList
        ref={flatListRef}
        data={PAGES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        renderItem={renderPage}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        accessibilityRole="adjustable"
        accessibilityLabel={`Onboarding tutorial, showing page ${currentPage + 1} of ${PAGES.length}`}
      />

      {/* Swipe hint - only on first page */}
      <SwipeHint visible={showSwipeHint && currentPage === 0} />

      {/* Bottom section */}
      <Animated.View
        entering={FadeInDown.delay(500).duration(400)}
        style={[styles.bottomSection, { paddingBottom: insets.bottom + Spacing.lg }]}
      >
        <PaginationDots
          scrollX={scrollX}
          count={PAGES.length}
          width={width}
          currentPage={currentPage}
        />

        <View style={styles.buttonContainer}>
          <AnimatedPressable
            onPress={isLastPage ? handleGetStarted : handleContinue}
            onPressIn={handleButtonPressIn}
            onPressOut={handleButtonPressOut}
            style={[
              styles.primaryButton,
              { backgroundColor: colors.primary },
              buttonAnimatedStyle,
            ]}
            accessibilityRole="button"
            accessibilityLabel={
              isLastPage
                ? 'Get started with MedTriads'
                : isNamePage && !userName.trim()
                  ? 'Skip name entry and continue'
                  : `Continue to page ${currentPage + 2}`
            }
          >
            {isLastPage ? (
              <>
                <Play size={20} color="#fff" />
                <Text variant="label" weight="bold" color={colors.textInverse}>
                  GET STARTED
                </Text>
              </>
            ) : (
              <>
                <Text variant="label" weight="bold" color={colors.textInverse}>
                  {isNamePage && !userName.trim() ? 'Skip for now' : 'Continue'}
                </Text>
                <AltArrowRight size={20} color="#fff" />
              </>
            )}
          </AnimatedPressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    zIndex: 10,
    padding: Spacing.sm,
  },
  page: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  mascotContainer: {
    marginBottom: Spacing.md,
  },
  mascot: {
    width: 110,
    height: 110,
  },
  mascotLarge: {
    width: 150,
    height: 150,
  },
  title: {
    marginTop: Spacing.sm,
    fontSize: 28,
    lineHeight: 34,
  },
  subtitle: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    maxWidth: 300,
    lineHeight: 22,
  },
  contentContainer: {
    marginTop: Spacing.lg,
    width: '100%',
    alignItems: 'center',
  },
  bottomSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  buttonContainer: {
    marginTop: Spacing.lg,
  },

  // Pagination
  paginationContainer: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  progressTextContainer: {
    marginBottom: Spacing.xs,
  },
  progressText: {
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },

  // Swipe hint
  swipeHint: {
    position: 'absolute',
    bottom: 180,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  swipeHintPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
  },
  swipeHintText: {
    fontWeight: '500',
  },

  // Primary button
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.lg,
    borderBottomWidth: 4,
    borderBottomColor: theme.colors.brand.primaryDark,
  },

  // Name input
  nameInputContainer: {
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
    gap: Spacing.md,
  },
  nameInputWrapper: {
    width: '100%',
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  nameInput: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  nameHelperText: {
    textAlign: 'center',
  },

  // Triad Demo styles
  triadContainer: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  symptomsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  symptomChip: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1.5,
  },
  symptomText: {
    fontSize: 12,
    fontWeight: '600',
  },
  arrowDown: {
    marginVertical: Spacing.xs,
    alignItems: 'center',
  },
  arrowLine: {
    width: 2,
    height: 16,
  },
  arrowHead: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  diagnosisChip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
    borderBottomWidth: 3,
    borderBottomColor: 'rgba(0,0,0,0.15)',
  },
  diagnosisText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Quiz Preview styles
  quizPreview: {
    width: '100%',
    maxWidth: 320,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    ...theme.shadows.md,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  quizCounter: {
    fontSize: 13,
    fontWeight: '500',
  },
  quizTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '600',
  },
  timerBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  timerProgress: {
    height: '100%',
    borderRadius: 2,
  },
  quizCategory: {
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: Spacing.sm,
  },
  quizFindings: {
    gap: 6,
    marginBottom: Spacing.sm,
  },
  findingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  findingNum: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  findingNumText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  findingText: {
    fontSize: 13,
    fontWeight: '500',
  },
  quizOptions: {
    gap: 6,
  },
  quizOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
    borderRadius: Radius.md,
  },
  correctOption: {
    borderWidth: 1.5,
  },
  optionLetter: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLetterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  optionText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Level Ladder styles
  levelLadder: {
    width: '100%',
    maxWidth: 320,
    gap: 6,
  },
  levelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: Radius.md,
    gap: Spacing.sm,
  },
  levelBadge: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelInfo: {
    flex: 1,
  },
  levelName: {
    fontSize: 14,
    fontWeight: '600',
  },
  levelPoints: {
    fontSize: 11,
  },
  youBadge: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.xs,
    borderRadius: 4,
  },
  youBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Streak Demo styles
  streakDemo: {
    width: '100%',
    maxWidth: 280,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  streakMultiplier: {
    fontSize: 52,
    fontWeight: '800',
    lineHeight: 56,
  },
  streakLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: Spacing.md,
  },
  streakAnswers: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  streakDot: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickRounds: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
  },
  quickRoundsText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
