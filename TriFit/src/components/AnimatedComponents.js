import React, { useRef, useEffect, useState } from 'react';
import { Animated, TouchableOpacity, StyleSheet, Platform } from 'react-native';

/**
 * BouncyButton:
 * Tactile button wrapper that springs down on touch (scale 0.94),
 * bounces back on release, and performs a micro-shake / jitter when pressed.
 */
export function BouncyButton({
  children,
  onPress,
  onPressIn,
  onPressOut,
  style,
  containerStyle,
  shakeOnPress = true,
  scaleDown = 0.94,
  activeOpacity = 0.88,
  disabled = false,
  ...restProps
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Preserve layout styles (like flex, width, margin) on outer Animated wrapper
  const flatStyle = StyleSheet.flatten(style) || {};
  const wrapperLayoutStyle = {};
  if (flatStyle.flex !== undefined) wrapperLayoutStyle.flex = flatStyle.flex;
  if (flatStyle.width !== undefined) wrapperLayoutStyle.width = flatStyle.width;
  if (flatStyle.alignSelf !== undefined) wrapperLayoutStyle.alignSelf = flatStyle.alignSelf;
  if (flatStyle.margin !== undefined) wrapperLayoutStyle.margin = flatStyle.margin;
  if (flatStyle.marginTop !== undefined) wrapperLayoutStyle.marginTop = flatStyle.marginTop;
  if (flatStyle.marginBottom !== undefined) wrapperLayoutStyle.marginBottom = flatStyle.marginBottom;
  if (flatStyle.marginLeft !== undefined) wrapperLayoutStyle.marginLeft = flatStyle.marginLeft;
  if (flatStyle.marginRight !== undefined) wrapperLayoutStyle.marginRight = flatStyle.marginRight;
  if (flatStyle.marginHorizontal !== undefined) wrapperLayoutStyle.marginHorizontal = flatStyle.marginHorizontal;
  if (flatStyle.marginVertical !== undefined) wrapperLayoutStyle.marginVertical = flatStyle.marginVertical;

  const handlePressIn = (e) => {
    Animated.spring(scaleAnim, {
      toValue: scaleDown,
      useNativeDriver: false,
      speed: 28,
      bounciness: 3,
    }).start();
    if (onPressIn) onPressIn(e);
  };

  const handlePressOut = (e) => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: false,
      friction: 4,
      tension: 200,
    }).start();
    if (onPressOut) onPressOut(e);
  };

  const handlePress = (e) => {
    if (disabled) return;
    if (shakeOnPress) {
      shakeAnim.setValue(0);
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: -3, duration: 40, useNativeDriver: false }),
        Animated.timing(shakeAnim, { toValue: 3, duration: 40, useNativeDriver: false }),
        Animated.timing(shakeAnim, { toValue: -2, duration: 35, useNativeDriver: false }),
        Animated.timing(shakeAnim, { toValue: 2, duration: 35, useNativeDriver: false }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 35, useNativeDriver: false }),
      ]).start();
    }
    if (onPress) onPress(e);
  };

  return (
    <Animated.View
      style={[
        wrapperLayoutStyle,
        containerStyle,
        {
          transform: [
            { scale: scaleAnim },
            { translateX: shakeAnim },
          ],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={activeOpacity}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={style}
        {...restProps}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

/**
 * PopInView:
 * Mount entrance animation that animates opacity (0 -> 1), scale (0.93 -> 1),
 * and upward translation (16 -> 0px) with configurable staggered delay.
 */
export function PopInView({
  children,
  delay = 0,
  duration = 380,
  style,
  translateDistance = 16,
  scaleStart = 0.93,
  ...restProps
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(translateDistance)).current;
  const scale = useRef(new Animated.Value(scaleStart)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          useNativeDriver: false,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          tension: 80,
          friction: 8,
          useNativeDriver: false,
        }),
        Animated.spring(scale, {
          toValue: 1,
          tension: 90,
          friction: 8,
          useNativeDriver: false,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
      {...restProps}
    >
      {children}
    </Animated.View>
  );
}

/**
 * ScrollPopView:
 * View that pops into view when scrolled into the browser viewport using
 * IntersectionObserver (falling back gracefully to immediate entrance).
 */
export function ScrollPopView({
  children,
  delay = 0,
  duration = 400,
  style,
  translateDistance = 18,
  scaleStart = 0.93,
  threshold = 0.1,
  ...restProps
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(translateDistance)).current;
  const scale = useRef(new Animated.Value(scaleStart)).current;
  const viewRef = useRef(null);

  const triggerAnimation = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        useNativeDriver: false,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        tension: 75,
        friction: 8,
        useNativeDriver: false,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 85,
        friction: 8,
        useNativeDriver: false,
      }),
    ]).start();
  };

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      let observer;
      try {
        const rawEl = viewRef.current;
        const el = rawEl instanceof Element ? rawEl : (rawEl?.node || (typeof rawEl?.getDOMNode === 'function' ? rawEl.getDOMNode() : null));
        if (el && el instanceof Element) {
          observer = new IntersectionObserver(
            ([entry]) => {
              if (entry?.isIntersecting) {
                if (delay > 0) {
                  setTimeout(triggerAnimation, delay);
                } else {
                  triggerAnimation();
                }
                observer?.disconnect();
              }
            },
            { threshold, rootMargin: '0px 0px -30px 0px' }
          );
          observer.observe(el);
        } else {
          triggerAnimation();
        }
      } catch (err) {
        triggerAnimation();
      }
      return () => {
        if (observer) observer.disconnect();
      };
    } else {
      if (delay > 0) {
        const timer = setTimeout(triggerAnimation, delay);
        return () => clearTimeout(timer);
      } else {
        triggerAnimation();
      }
    }
  }, [delay]);

  return (
    <Animated.View
      ref={viewRef}
      style={[
        style,
        {
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
      {...restProps}
    >
      {children}
    </Animated.View>
  );
}

/**
 * PulseBadge:
 * Gentle breathing pulse for active status, streak badges, or priority workout badges.
 */
export function PulseBadge({ children, style, minScale = 0.97, maxScale = 1.03, duration = 1400 }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: maxScale,
          duration: duration / 2,
          useNativeDriver: false,
        }),
        Animated.timing(scaleAnim, {
          toValue: minScale,
          duration: duration / 2,
          useNativeDriver: false,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
      {children}
    </Animated.View>
  );
}
