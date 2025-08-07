import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';

interface LoadingScreenProps {
  message?: string;
  submessage?: string;
  progress?: number;
  icon?: keyof typeof MaterialIcons.glyphMap;
  showProgress?: boolean;
}

export function LoadingScreen({
  message = 'Loading...',
  submessage,
  progress,
  icon,
  showProgress = false,
}: LoadingScreenProps) {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [rotateAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Fade in and scale animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous rotation for icons
    if (icon) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.linear,
        })
      ).start();
    }
  }, [fadeAnim, scaleAnim, rotateAnim, icon]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {icon ? (
          <Animated.View
            style={[
              styles.iconContainer,
              { transform: [{ rotate: rotateInterpolate }] },
            ]}
          >
            <MaterialIcons 
              name={icon} 
              size={60} 
              color={Colors.primary} 
            />
          </Animated.View>
        ) : (
          <View style={styles.spinnerContainer}>
            <ActivityIndicator 
              size="large" 
              color={Colors.primary} 
            />
          </View>
        )}

        <Text style={styles.message}>{message}</Text>

        {submessage && (
          <Text style={styles.submessage}>{submessage}</Text>
        )}

        {showProgress && typeof progress === 'number' && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill,
                  { width: `${Math.max(0, Math.min(100, progress))}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(progress)}%
            </Text>
          </View>
        )}

        <View style={styles.dots}>
          {[0, 1, 2].map((index) => (
            <LoadingDot key={index} delay={index * 200} />
          ))}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

function LoadingDot({ delay }: { delay: number }) {
  const [opacity] = useState(new Animated.Value(0.3));

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };

    const timer = setTimeout(animate, delay);
    return () => clearTimeout(timer);
  }, [opacity, delay]);

  return (
    <Animated.View
      style={[
        styles.dot,
        { opacity },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 30,
    padding: 20,
    borderRadius: 50,
    backgroundColor: Colors.primary + '20',
  },
  spinnerContainer: {
    marginBottom: 30,
    padding: 20,
  },
  message: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  submessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  progressBarBackground: {
    width: '100%',
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginHorizontal: 4,
  },
});

export default LoadingScreen;