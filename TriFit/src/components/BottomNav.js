import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';

export default function BottomNav({ activeTab, setActiveTab, onOpenCoach }) {
  const tabs = [
    { id: 'today', label: 'Today', icon: 'sparkles', iconFamily: 'Ionicons' },
    { id: 'longevity', label: 'Longevity', icon: 'heart-pulse', iconFamily: 'MaterialCommunityIcons' },
    { id: 'schedule', label: 'Schedule', icon: 'calendar-month', iconFamily: 'MaterialCommunityIcons' },
    { id: 'onboarding', label: 'Plan', icon: 'calendar-text', iconFamily: 'MaterialCommunityIcons' },
    { id: 'coach', label: 'Coach', icon: 'chatbubbles', iconFamily: 'Ionicons' },
  ];

  const handleTabPress = (tabId) => {
    if (tabId === 'coach') {
      onOpenCoach();
    } else {
      setActiveTab(tabId);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabsRow}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabItem, isActive && styles.activeTabItem]}
              onPress={() => handleTabPress(tab.id)}
              activeOpacity={0.7}
            >
              {tab.iconFamily === 'Ionicons' ? (
                <Ionicons
                  name={tab.icon}
                  size={24}
                  color={isActive ? COLORS.primary : COLORS.onSurfaceVariant}
                />
              ) : (
                <MaterialCommunityIcons
                  name={tab.icon}
                  size={24}
                  color={isActive ? COLORS.primary : COLORS.onSurfaceVariant}
                />
              )}
              <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
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
    backgroundColor: 'rgba(250, 248, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 104, 95, 0.08)',
    paddingBottom: Platform.OS === 'android' ? 14 : 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    paddingHorizontal: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 16,
    gap: 2,
  },
  activeTabItem: {
    backgroundColor: 'rgba(0, 104, 95, 0.08)',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  activeTabLabel: {
    color: COLORS.primary,
    fontWeight: '800',
  },
});
