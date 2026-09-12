import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function SplashScreen({ onFinish }) {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Smooth entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-transition to login screen after 2.5 seconds
    const timer = setTimeout(() => {
      onFinish();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <TouchableOpacity
      style={styles.touchContainer}
      activeOpacity={1}
      onPress={onFinish}
    >
      <StatusBar barStyle="light-content" backgroundColor="#004d46" />
      <LinearGradient
        colors={['#00685f', '#004d46', '#00201d']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Logo Badge */}
          <View style={styles.logoCircleOuter}>
            <View style={styles.logoCircleInner}>
              <MaterialCommunityIcons name="lightning-bolt" size={44} color="#ffffff" />
            </View>
          </View>

          {/* App Title */}
          <Text style={styles.brandTitle}>
            Tri<Text style={styles.brandTitleAccent}>Fit</Text>
          </Text>

          {/* Subtitle */}
          <Text style={styles.brandSubtitle}>ENDURANCE & LONGEVITY</Text>

          {/* Tagline */}
          <Text style={styles.tagline}>Train Fast. Live Longer.</Text>
        </Animated.View>

        {/* Loading Spinner at Bottom */}
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color="#89f5e7" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchContainer: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircleOuter: {
    width: 104,
    height: 104,
    borderRadius: 36,
    backgroundColor: 'rgba(137, 245, 231, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(137, 245, 231, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#89f5e7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  logoCircleInner: {
    width: 76,
    height: 76,
    borderRadius: 26,
    backgroundColor: '#0d9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 44,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -1,
  },
  brandTitleAccent: {
    color: '#89f5e7',
  },
  brandSubtitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#89f5e7',
    letterSpacing: 2,
    marginTop: 6,
    textTransform: 'uppercase',
  },
  tagline: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 12,
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
});
