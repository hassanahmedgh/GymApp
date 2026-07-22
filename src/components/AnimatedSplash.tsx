import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, font, tint } from '../theme';

// A branded animated loading screen: a spinning accent ring around a
// pulsing, glowing flame, with the wordmark fading up.
export function AnimatedSplash() {
  const spin = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spinLoop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1100,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 750,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 750,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    spinLoop.start();
    pulseLoop.start();
    Animated.timing(enter, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    return () => {
      spinLoop.stop();
      pulseLoop.stop();
    };
  }, []);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.09] });
  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.5] });
  const enterY = enter.interpolate({ inputRange: [0, 1], outputRange: [10, 0] });

  return (
    <View style={styles.root}>
      <View style={styles.center}>
        <Animated.View
          style={[styles.glow, { opacity: glowOpacity, transform: [{ scale }] }]}
        />
        <Animated.View style={[styles.ring, { transform: [{ rotate }] }]} />
        <Animated.View style={[styles.badge, { transform: [{ scale }] }]}>
          <Ionicons name="flame" size={34} color={colors.primary} />
        </Animated.View>
      </View>
      <Animated.View style={{ opacity: enter, transform: [{ translateY: enterY }] }}>
        <Text style={styles.name}>FastFit</Text>
        <Text style={styles.sub}>Loading your plan…</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  center: {
    width: 112,
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  glow: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
  },
  ring: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.border,
    borderTopColor: colors.primary,
  },
  badge: {
    width: 66,
    height: 66,
    borderRadius: radius.xl,
    backgroundColor: tint(colors.primary, 0.16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { color: colors.text, fontSize: 28, fontWeight: '900', textAlign: 'center', letterSpacing: 0.5 },
  sub: { color: colors.textMuted, fontSize: font.small, textAlign: 'center', marginTop: 5 },
});
