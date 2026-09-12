import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';

export default function BottomNav({ activeTab, setActiveTab, onOpenCoach }) {
  const tabs = [
    { id: 'today', label: 'Home', icon: 'home', iconFamily: 'Ionicons' },
    { id: 'recovery', label: 'Recovery', icon: 'heart-pulse', iconFamily: 'MaterialCommunityIcons' },
    { id: 'progress', label: 'Progress', icon: 'trophy', iconFamily: 'MaterialCommunityIcons' },
    { id: 'schedule', label: 'Schedule', icon: 'calendar-month', iconFamily: 'MaterialCommunityIcons' },
    { id: 'coach', label: 'Coach', icon: 'chatbubbles', iconFamily: 'Ionicons' },
  ];

  const activeIndex = tabs.findIndex(
    (t) => activeTab === t.id || (tabIdMatch(t.id, activeTab))
  );
  function tabIdMatch(id, current) {
    if (id === 'recovery' && current === 'longevity') return true;
    return id === current;
  }

  const resolvedIndex = activeIndex >= 0 ? activeIndex : 0;
  const useRoomyLayout = activeTab === 'recovery' || activeTab === 'longevity' || activeTab === 'progress';
  const [rowWidth, setRowWidth] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const tabScaleAnims = useRef(tabs.map(() => new Animated.Value(1))).current;

  const tabWidth = rowWidth > 16 ? (rowWidth - 16) / tabs.length : 0;

  useEffect(() => {
    if (tabWidth > 0) {
      Animated.spring(slideAnim, {
        toValue: resolvedIndex * tabWidth,
        useNativeDriver: false,
        tension: 90,
        friction: 8,
      }).start();

      // Gentle bounce on the newly active tab icon
      if (tabScaleAnims[resolvedIndex]) {
        Animated.sequence([
          Animated.timing(tabScaleAnims[resolvedIndex], { toValue: 1.16, duration: 110, useNativeDriver: false }),
          Animated.spring(tabScaleAnims[resolvedIndex], { toValue: 1, tension: 140, friction: 6, useNativeDriver: false }),
        ]).start();
      }
    }
  }, [resolvedIndex, tabWidth]);

  const handleTabPress = (tabId, idx) => {
    if (tabScaleAnims[idx]) {
      Animated.sequence([
        Animated.timing(tabScaleAnims[idx], { toValue: 0.88, duration: 70, useNativeDriver: false }),
        Animated.spring(tabScaleAnims[idx], { toValue: 1, tension: 180, friction: 6, useNativeDriver: false }),
      ]).start();
    }

    if (tabId === 'coach') {
      onOpenCoach();
    } else {
      setActiveTab(tabId);
    }
  };

  return (
    <View style={[styles.container, useRoomyLayout && styles.roomyContainer]}>
      <View
        style={[styles.tabsRow, useRoomyLayout && styles.roomyTabsRow]}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          if (w > 0) setRowWidth(w);
        }}
      >
        {/* Sliding Indicator Circle / Capsule */}
        {tabWidth > 0 && (
          <Animated.View
            style={[
              styles.slidingIndicatorWrap,
              {
                width: tabWidth,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <View style={[styles.slidingIndicatorCircle, useRoomyLayout && styles.roomyIndicatorCircle]} />
          </Animated.View>
        )}

        {tabs.map((tab, idx) => {
          const isActive =
            activeTab === tab.id || (tab.id === 'recovery' && activeTab === 'longevity');
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabItem}
              onPress={() => handleTabPress(tab.id, idx)}
              activeOpacity={0.7}
            >
              <Animated.View
                style={{
                  transform: [{ scale: tabScaleAnims[idx] }],
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {tab.iconFamily === 'Ionicons' ? (
                  <Ionicons
                    name={tab.icon}
                    size={useRoomyLayout ? 26 : 23}
                    color={isActive ? COLORS.primary : COLORS.onSurfaceVariant}
                  />
                ) : (
                  <MaterialCommunityIcons
                    name={tab.icon}
                    size={useRoomyLayout ? 26 : 23}
                    color={isActive ? COLORS.primary : COLORS.onSurfaceVariant}
                  />
                )}
              </Animated.View>
              <Text style={[styles.tabLabel, useRoomyLayout && styles.roomyTabLabel, isActive && styles.activeTabLabel]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(250, 248, 255, 0.96)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 104, 95, 0.08)',
    paddingBottom: Platform.OS === 'android' ? 14 : 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  roomyContainer: {
    paddingBottom: Platform.OS === 'android' ? 17 : 23,
  },
  tabsRow: {
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    paddingHorizontal: 8,
  },
  roomyTabsRow: {
    height: 68,
  },
  slidingIndicatorWrap: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  slidingIndicatorCircle: {
    width: '94%',
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(0, 104, 95, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(0, 104, 95, 0.20)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  roomyIndicatorCircle: {
    height: 64,
    borderRadius: 32,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 16,
    gap: 2,
    zIndex: 1,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  roomyTabLabel: {
    fontSize: 12,
  },
  activeTabLabel: {
    color: COLORS.primary,
    fontWeight: '800',
  },
});
