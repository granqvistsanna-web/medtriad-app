import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
}

/**
 * Error Boundary for catching render errors
 *
 * Wraps the app to catch JavaScript errors in child component tree.
 * Shows user-friendly fallback UI with retry option.
 *
 * Note: Does NOT catch errors in:
 * - Event handlers (use try/catch)
 * - Async code (use try/catch)
 * - Server-side rendering
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error for debugging (could send to error service in production)
    console.error('ErrorBoundary caught error:', error);
    console.error('Component stack:', errorInfo.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      const colors = Colors.light;
      return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            Something went wrong
          </Text>
          <Text style={[styles.message, { color: colors.textMuted }]}>
            We're sorry, but something unexpected happened.
          </Text>
          <Pressable
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={this.handleReset}
          >
            <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
              Try Again
            </Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  title: {
    ...Typography.heading,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  message: {
    ...Typography.body,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  button: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
  },
  buttonText: {
    ...Typography.label,
    fontWeight: '600',
  },
});
