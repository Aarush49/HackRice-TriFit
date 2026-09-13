import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../theme';
import { PopInView } from '../AnimatedComponents';
import styles from '../../screens/styles/DailyMissionsScreen.styles';

export default function ViewingDayBanner({
  targetRace,
  isTodaySelected,
  selectedDay,
  todayDay,
  onSelectDay,
}) {
  return (
    <>
      {/* 1. Subheader: Category Pill + Headline */}
      <PopInView delay={0}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.categoryRow}>
              <View style={styles.categoryPill}>
                <Ionicons name="flash" size={11} color="#0f766e" />
                <Text style={styles.categoryPillText}>{targetRace}</Text>
              </View>
            </View>
            <Text style={styles.headingTitle}>
              {isTodaySelected ? "Today's Mission" : `Day ${selectedDay} Mission`}
            </Text>
          </View>

          <View style={styles.dayBadge}>
            <Ionicons name="calendar-outline" size={13} color={COLORS.primary} />
            <Text style={styles.dayBadgeText}>
              {isTodaySelected ? `Day ${todayDay} • Today` : `Day ${selectedDay} • Scheduled`}
            </Text>
          </View>
        </View>
      </PopInView>

      {/* If viewing a different day, show a banner to easily switch back to today */}
      {!isTodaySelected && (
        <View style={styles.notTodayBanner}>
          <View style={styles.notTodayBannerLeft}>
            <Ionicons name="calendar" size={16} color="#00685f" />
            <Text style={styles.notTodayBannerText}>
              Viewing Day {selectedDay} • {selectedDay < todayDay ? 'Past Day (Completed)' : 'Future Day (Locked)'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.switchTodayBtn}
            onPress={() => onSelectDay && onSelectDay(todayDay)}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-undo" size={13} color="#ffffff" style={{ marginRight: 4 }} />
            <Text style={styles.switchTodayBtnText}>Switch to Today</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}
