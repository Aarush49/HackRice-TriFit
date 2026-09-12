import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme';

export default function TrainingScheduleScreen({ onStartWorkout, onOpenCoach }) {
  const [viewMode, setViewMode] = useState('week'); // 'week' | 'month'
  const [selectedDay, setSelectedDay] = useState(12); // Wed 12 is today
  const [adaptedPlan, setAdaptedPlan] = useState(null);

  const days = [
    { day: 'M', date: 10, status: 'completed', icon: 'check', iconType: 'ion', bg: '#f1f5f9', iconColor: '#ffffff', iconBg: COLORS.primary },
    { day: 'T', date: 11, status: 'completed', icon: 'check', iconType: 'ion', bg: '#f1f5f9', iconColor: '#ffffff', iconBg: COLORS.primary },
    { day: 'W', date: 12, status: 'today', icon: 'run', iconType: 'mc', bg: COLORS.primary, iconColor: COLORS.primary, iconBg: '#ffffff', isToday: true },
    { day: 'T', date: 13, status: 'planned', icon: 'lightning-bolt', iconType: 'mc', bg: '#ffffff', iconColor: '#ea580c', iconBg: '#ffdbca' },
    { day: 'F', date: 14, status: 'rest', icon: 'spa', iconType: 'mc', bg: '#ffffff', iconColor: '#64748b', iconBg: '#e2e8f0' },
    { day: 'S', date: 15, status: 'long', icon: 'heart', iconType: 'mc', bg: '#ffffff', iconColor: '#00685f', iconBg: '#89f5e7' },
    { day: 'S', date: 16, status: 'rest', icon: 'bed', iconType: 'mc', bg: '#ffffff', iconColor: '#64748b', iconBg: '#e2e8f0' },
  ];

  const handleAdapt = (type, label) => {
    if (adaptedPlan === type) {
      setAdaptedPlan(null);
    } else {
      setAdaptedPlan(type);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Top Header & Week/Month Switcher */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={onOpenCoach} activeOpacity={0.85} style={styles.coachAvatarWrapper}>
            <Image
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCAEsNjseeGCE734scFcz96x_HWKdSap5jgR_AYgkz_inJm0s80m7TjPdEAvjo4YSRSXNDCaHnvRdniP6v37kUaaO7pCO-098Goo8frI962Ert8mG3L4xfu60RkRm-eItgMuAufHEAL4xqJWYCYgQKUv9PtHah6rUmXZ9SIc8aMqM09OKVwKbRVI3gGMKOt1rABwPVLAF1JK1lRWRqgF1CSSqhq-27SjIoVbVAJfr9L8bF7qcJjS8Dp',
              }}
              style={styles.coachAvatar}
            />
          </TouchableOpacity>
          <View>
            <View style={styles.monthBadgeRow}>
              <Ionicons name="calendar-outline" size={13} color={COLORS.primary} />
              <Text style={styles.monthBadgeText}>NOVEMBER 2025</Text>
            </View>
            <Text style={styles.screenTitle}>Training Schedule</Text>
          </View>
        </View>

        {/* Week / Month Toggle */}
        <View style={styles.viewToggleGroup}>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'week' && styles.toggleBtnActive]}
            onPress={() => setViewMode('week')}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleBtnText, viewMode === 'week' && styles.toggleBtnTextActive]}>
              Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'month' && styles.toggleBtnActive]}
            onPress={() => setViewMode('month')}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleBtnText, viewMode === 'month' && styles.toggleBtnTextActive]}>
              Month
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Week Horizontal Strip Calendar Card */}
      <View style={styles.calendarCard}>
        <View style={styles.calendarCardHeader}>
          <View style={styles.weekThemeRow}>
            <MaterialCommunityIcons name="dumbbell" size={18} color={COLORS.primary} />
            <Text style={styles.weekThemeText}>Week 8 of 18 • Aerobic Base</Text>
          </View>
          <Text style={styles.weekDateRange}>Nov 10 – Nov 16</Text>
        </View>

        {/* 7 Day Grid */}
        <View style={styles.daysGrid}>
          {days.map((d) => {
            const isSelected = selectedDay === d.date;
            const isToday = d.isToday;

            return (
              <TouchableOpacity
                key={d.date}
                style={[
                  styles.dayCard,
                  isToday && styles.dayCardToday,
                  isSelected && !isToday && styles.dayCardSelected,
                ]}
                onPress={() => setSelectedDay(d.date)}
                activeOpacity={0.8}
              >
                <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
                  {d.day}
                </Text>
                <Text style={[styles.dayNumber, isToday && styles.dayNumberToday]}>
                  {d.date}
                </Text>

                <View
                  style={[
                    styles.dayStatusCircle,
                    { backgroundColor: d.iconBg },
                  ]}
                >
                  {d.iconType === 'ion' ? (
                    <Ionicons name={d.icon} size={12} color={d.iconColor} />
                  ) : (
                    <MaterialCommunityIcons name={d.icon} size={12} color={d.iconColor} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 3. What To Do Today Section */}
      <View style={styles.todaySection}>
        <View style={styles.todayHeaderRow}>
          <View style={styles.todayTitleLeft}>
            <View style={styles.livePing} />
            <Text style={styles.todaySectionTitle}>What to do today</Text>
          </View>
          <View style={styles.todayPill}>
            <Text style={styles.todayPillText}>Today • Wed, Nov 12</Text>
          </View>
        </View>

        {/* Main Today Workout Card */}
        <View style={styles.workoutCardWrapper}>
          <LinearGradient
            colors={['#89f5e7', '#6bd8cb', '#46cdbe']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.workoutCard}
          >
            {/* Top Row: Icon + Title */}
            <View style={styles.workoutMainRow}>
              <View style={styles.workoutIconBox}>
                <MaterialCommunityIcons name="run" size={28} color={COLORS.primary} />
              </View>
              <View style={styles.workoutTextWrap}>
                <Text style={styles.workoutTitle}>
                  {adaptedPlan === 'walk'
                    ? 'Active Walk & Form Recovery'
                    : adaptedPlan === 'ease'
                    ? 'Zone 1-2 Easy Aerobic Recovery'
                    : adaptedPlan === 'rest'
                    ? 'Full Rest & Cellular Regeneration'
                    : 'Zone 2 Aerobic & Form Drills'}
                </Text>
                <Text style={styles.workoutSubtitle}>
                  {adaptedPlan === 'walk'
                    ? 'Gentle outdoor walk to keep tendons supple'
                    : adaptedPlan === 'ease'
                    ? 'Dialed back 30% intensity for fresh legs'
                    : adaptedPlan === 'rest'
                    ? 'Sleep, hydrate, and let mitochondria rebuild'
                    : 'Steady rhythmic breathing + cadence builds'}
                </Text>
              </View>
            </View>

            {/* Metrics Grid (3 Columns) */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricCol}>
                <Text style={styles.metricLabel}>Duration</Text>
                <Text style={styles.metricVal}>
                  {adaptedPlan === 'walk' ? '25 min' : adaptedPlan === 'rest' ? 'Rest Day' : '45 min'}
                </Text>
              </View>
              <View style={styles.metricCol}>
                <Text style={styles.metricLabel}>Target Zone</Text>
                <Text style={styles.metricVal}>
                  {adaptedPlan === 'walk' ? 'Zone 1' : adaptedPlan === 'rest' ? 'Zone 0' : 'Zone 2 (Easy)'}
                </Text>
              </View>
              <View style={styles.metricCol}>
                <Text style={styles.metricLabel}>Energy Need</Text>
                <Text style={styles.metricVal}>
                  {adaptedPlan === 'walk' ? 'Mild 2/10' : adaptedPlan === 'rest' ? 'Zero 0/10' : 'Mild 4/10'}
                </Text>
              </View>
            </View>

            {/* Equipment & Sensor Badges */}
            <View style={styles.equipmentBadgesRow}>
              <View style={styles.gearPill}>
                <MaterialCommunityIcons name="watch" size={14} color={COLORS.primary} />
                <Text style={styles.gearPillText}>GPS Watch or HR Sensor</Text>
              </View>
              <View style={styles.gearPill}>
                <MaterialCommunityIcons name="ruler" size={14} color={COLORS.primary} />
                <Text style={styles.gearPillText}>Road or Treadmill</Text>
              </View>
            </View>

            {/* Action Button inside Card */}
            <TouchableOpacity
              style={styles.startWorkoutBtn}
              onPress={onStartWorkout}
              activeOpacity={0.88}
            >
              <Ionicons name="play" size={20} color="#ffffff" />
              <Text style={styles.startWorkoutBtnText}>Start Today's Workout</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>

      {/* 4. Not Feeling 100%? / Quick Plan Adaptations Section */}
      <View style={styles.adaptSection}>
        <View style={styles.adaptCard}>
          {/* Header */}
          <View style={styles.adaptHeader}>
            <View style={styles.adaptIconBox}>
              <MaterialCommunityIcons name="tune" size={22} color="#783200" />
            </View>
            <View style={styles.adaptHeaderTextWrap}>
              <Text style={styles.adaptTitle}>Not Feeling 100%?</Text>
              <Text style={styles.adaptSubtitle}>
                Tired, sore, or short on time? Adapt in 1-tap.
              </Text>
            </View>
          </View>

          {/* 2x2 Quick Action Buttons Grid */}
          <View style={styles.adaptButtonsGrid}>
            {/* Active Walk */}
            <TouchableOpacity
              style={[
                styles.adaptOptionBtn,
                adaptedPlan === 'walk' && styles.adaptOptionBtnActive,
              ]}
              onPress={() => handleAdapt('walk', 'Active Walk')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="hiking" size={22} color="#9d4300" />
              <View>
                <Text style={styles.adaptOptionTitle}>Active Walk</Text>
                <Text style={styles.adaptOptionSub}>Gentle 25 min</Text>
              </View>
            </TouchableOpacity>

            {/* Ease Effort */}
            <TouchableOpacity
              style={[
                styles.adaptOptionBtn,
                adaptedPlan === 'ease' && styles.adaptOptionBtnActive,
              ]}
              onPress={() => handleAdapt('ease', 'Ease Effort')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="speedometer" size={22} color={COLORS.primary} />
              <View>
                <Text style={styles.adaptOptionTitle}>Ease Effort</Text>
                <Text style={styles.adaptOptionSub}>-30% intensity</Text>
              </View>
            </TouchableOpacity>

            {/* Take Rest Day */}
            <TouchableOpacity
              style={[
                styles.adaptOptionBtn,
                adaptedPlan === 'rest' && styles.adaptOptionBtnActive,
              ]}
              onPress={() => handleAdapt('rest', 'Take Rest Day')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="bed-empty" size={22} color="#64748b" />
              <View>
                <Text style={styles.adaptOptionTitle}>Take Rest Day</Text>
                <Text style={styles.adaptOptionSub}>Slide to tomorrow</Text>
              </View>
            </TouchableOpacity>

            {/* Custom Edit */}
            <TouchableOpacity
              style={[
                styles.adaptOptionBtn,
                adaptedPlan === 'custom' && styles.adaptOptionBtnActive,
              ]}
              onPress={() => handleAdapt('custom', 'Custom Edit')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="calendar-edit" size={22} color={COLORS.primary} />
              <View>
                <Text style={styles.adaptOptionTitle}>Custom Edit</Text>
                <Text style={styles.adaptOptionSub}>Rearrange week</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Adaptive Promise Footer */}
          <View style={styles.promiseFooter}>
            <MaterialCommunityIcons name="check-decagram" size={18} color={COLORS.primary} />
            <Text style={styles.promiseText}>
              Coach Maya automatically rebalances your weekly training volume.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf8ff',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  topHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  coachAvatarWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#6bd8cb',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  coachAvatar: {
    width: '100%',
    height: '100%',
  },
  monthBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  monthBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.6,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#131b2e',
    letterSpacing: -0.5,
  },
  viewToggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#e2e7ff',
    padding: 3,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  toggleBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3d4947',
  },
  toggleBtnTextActive: {
    color: COLORS.primary,
    fontWeight: '900',
  },
  calendarCard: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 14,
    borderWidth: 2,
    borderColor: '#eaedff',
    borderBottomWidth: 4,
    borderBottomColor: '#dae2fd',
    elevation: 2,
  },
  calendarCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  weekThemeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  weekThemeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#131b2e',
  },
  weekDateRange: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6d7a77',
  },
  daysGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  dayCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 2,
    borderRadius: 14,
    backgroundColor: '#f2f3ff',
    borderWidth: 1,
    borderColor: '#eaedff',
  },
  dayCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#f0fdfa',
  },
  dayCardToday: {
    backgroundColor: COLORS.primary,
    borderColor: '#89f5e7',
    borderWidth: 2,
    borderBottomWidth: 4,
    borderBottomColor: '#004c44',
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6d7a77',
  },
  dayLabelToday: {
    color: '#89f5e7',
    fontWeight: '900',
  },
  dayNumber: {
    fontSize: 15,
    fontWeight: '900',
    color: '#131b2e',
    marginTop: 2,
    marginBottom: 6,
  },
  dayNumberToday: {
    color: '#ffffff',
  },
  dayStatusCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todaySection: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  todayHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  todayTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  livePing: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  todaySectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#131b2e',
  },
  todayPill: {
    backgroundColor: 'rgba(107, 216, 203, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  todayPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
  },
  workoutCardWrapper: {
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#00685f',
    borderBottomWidth: 4,
    borderBottomColor: '#005049',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  workoutCard: {
    padding: 16,
  },
  workoutMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  workoutIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  workoutTextWrap: {
    flex: 1,
  },
  workoutTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#00201d',
    letterSpacing: -0.3,
  },
  workoutSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#003833',
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  metricCol: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 14,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6d7a77',
  },
  metricVal: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.primary,
    marginTop: 2,
  },
  equipmentBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  gearPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
  },
  gearPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#131b2e',
  },
  startWorkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 16,
    gap: 8,
    borderBottomWidth: 3,
    borderBottomColor: '#003833',
    elevation: 3,
  },
  startWorkoutBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.2,
  },
  adaptSection: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  adaptCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 16,
    borderWidth: 2,
    borderColor: '#eaedff',
    borderBottomWidth: 4,
    borderBottomColor: '#dae2fd',
    elevation: 2,
  },
  adaptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  adaptIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ffdbca',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adaptHeaderTextWrap: {
    flex: 1,
  },
  adaptTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#131b2e',
  },
  adaptSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6d7a77',
    marginTop: 1,
  },
  adaptButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  adaptOptionBtn: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f2f3ff',
    borderWidth: 1.5,
    borderColor: '#eaedff',
    borderRadius: 16,
    padding: 12,
  },
  adaptOptionBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#f0fdfa',
  },
  adaptOptionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#131b2e',
  },
  adaptOptionSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6d7a77',
    marginTop: 1,
  },
  promiseFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eaedff',
  },
  promiseText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3d4947',
    flex: 1,
    lineHeight: 16,
  },
});
