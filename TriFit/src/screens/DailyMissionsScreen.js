import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme';

export default function DailyMissionsScreen({
  currentUser,
  userProfile,
  onStartRun,
  onOpenCoach,
  xp,
  setXp,
}) {
  const { width } = useWindowDimensions();
  const isWide = width >= 860;

  // Format today's date (e.g., "Friday, September 11, 2026")
  const dateStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const athleteName = (currentUser?.name || userProfile?.name || 'Aarush').toUpperCase();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 1. Top Greeting & Target Race Countdown */}
      <View style={styles.topGreetingSection}>
        <View style={styles.headlineRow}>
          <Ionicons name="sunny" size={26} color="#F59E0B" />
          <Text style={styles.headlineTitle}>
            Day 14 <Text style={styles.orangeDot}>•</Text> Zone In!
          </Text>
        </View>

        {/* London Hyrox Open Countdown Pill */}
        <LinearGradient
          colors={['#e0f2fe', '#ecfeff', '#fef3c7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.targetRaceCountdownPill}
        >
          <View style={styles.raceInfoLeft}>
            <View style={styles.raceTimerIconBox}>
              <MaterialCommunityIcons name="timer" size={20} color="#0284c7" />
            </View>
            <Text style={styles.raceNameText}>London Hyrox Open</Text>
          </View>

          <View style={styles.daysLeftBadge}>
            <Text style={styles.daysLeftText}>68D LEFT</Text>
            <Ionicons name="flag" size={13} color="#ffffff" />
          </View>
        </LinearGradient>
      </View>

      {/* 2. Daily Consistency & Streak Tracker (Placed above everything, below AI Coach) */}
      <View style={styles.streakSection}>
        <View style={styles.streakHeader}>
          <View style={styles.streakTitleRow}>
            <View style={styles.fireBox}>
              <MaterialCommunityIcons name="fire" size={22} color="#ffffff" />
            </View>
            <View>
              <Text style={styles.streakTitle}>Streak</Text>
              <Text style={styles.streakSub}>Consistency over grit</Text>
            </View>
          </View>
          <View style={styles.streakNumberBadge}>
            <Text style={styles.streakNumberText}>14 Days 🔥</Text>
          </View>
        </View>

        {/* Days Row */}
        <View style={styles.daysRow}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
            const isCompleted = idx < 3;
            const isToday = idx === 3;
            return (
              <View key={idx} style={styles.dayCol}>
                <Text style={[styles.dayLetter, isToday && styles.todayLetter]}>{day}</Text>
                {isCompleted ? (
                  <LinearGradient colors={['#f97316', '#fbbf24']} style={styles.dayBubbleDone}>
                    <Ionicons name="checkmark" size={14} color="#ffffff" />
                  </LinearGradient>
                ) : isToday ? (
                  <LinearGradient colors={['#06b6d4', '#0ea5e9']} style={styles.dayBubbleToday}>
                    <Ionicons name="flash" size={16} color="#ffffff" />
                  </LinearGradient>
                ) : (
                  <View style={styles.dayBubbleEmpty}>
                    <View style={styles.emptyDot} />
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Milestone Banner */}
        <LinearGradient colors={['#fef3c7', '#fffbeb', '#fed7aa']} style={styles.milestoneCard}>
          <View style={styles.trophyIconBox}>
            <MaterialCommunityIcons name="trophy" size={22} color="#ffffff" />
          </View>
          <View style={styles.milestoneTextWrap}>
            <Text style={styles.milestoneTag}>NEXT MILESTONE</Text>
            <Text style={styles.milestoneDesc}>
              3 more days to win the <Text style={styles.boldText}>Golden Kettlebell</Text>! 🏆
            </Text>
          </View>
        </LinearGradient>
      </View>

      {/* 3. Today's Missions Section */}
      <View style={styles.missionsSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="rocket" size={22} color="#f97316" />
            <Text style={styles.sectionTitle}>Today’s Missions</Text>
          </View>
          <View style={styles.readyBadge}>
            <Text style={styles.readyBadgeText}>1 / 3 Ready</Text>
          </View>
        </View>

        {/* 1. Completed Quest */}
        <View style={styles.questCardCompleted}>
          <View style={styles.questLeft}>
            <View style={styles.checkIconBox}>
              <Ionicons name="checkmark" size={20} color="#ffffff" />
            </View>
            <View style={styles.questTextWrap}>
              <Text style={styles.doneLabel}>DONE • 15M</Text>
              <Text style={styles.questTitleDone}>Morning Mobility Quest</Text>
            </View>
          </View>
          <View style={styles.xpBadgeCompleted}>
            <Ionicons name="flash" size={12} color="#f59e0b" />
            <Text style={styles.xpTextCompleted}>+50 XP</Text>
          </View>
        </View>

        {/* 2. Active Quest Card */}
        <LinearGradient
          colors={['#ffffff', '#f0fdfa']}
          style={styles.activeQuestCard}
        >
          <View style={styles.activeTopRow}>
            <View style={styles.activeBadge}>
              <Ionicons name="star" size={12} color="#ea580c" />
              <Text style={styles.activeBadgeText}>ACTIVE QUEST</Text>
            </View>
            <View style={styles.timeBadge}>
              <Ionicons name="time" size={14} color="#0f766e" />
              <Text style={styles.timeBadgeText}>35 Mins</Text>
            </View>
          </View>

          <View style={styles.questMainRow}>
            <View style={styles.runIconBox}>
              <FontAwesome5 name="running" size={22} color="#ffffff" />
            </View>
            <View style={styles.questDetail}>
              <Text style={styles.activeQuestTitle}>Zone 2 Aero Run</Text>
              <Text style={styles.activeQuestSub}>Easy conversational pace</Text>
            </View>
          </View>

          {/* Running Trail Graphic with HR overlay */}
          <View style={styles.trailGraphicContainer}>
            <Image
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBY1wWjlUnEJjbhQpJnG1F1eoDvkRqkBV2gf_3fClppSTCxYDutB1IoWuWV458J4AC8CZjFApFQv3Jvdakn7vb0BdgOl4M6ubTOLi6ulaEyzti69wX9OP-DhOKJoyBL10ZNC6QpQqHDksQ-Xa4k46i47ozQMYRGE5TfP810V5xGNelBFn3tWDEhzEB2zR5PpZjDytstgVIiyXysKlrMHQXxk6I5GHVR6BXI0eBtgC3EbETQYTaSon-A',
              }}
              style={styles.trailImage}
            />
            <View style={styles.hrBadgeOverlay}>
              <Ionicons name="heart" size={12} color="#f43f5e" />
              <Text style={styles.hrOverlayLabel}>128–142 BPM</Text>
            </View>
          </View>

          {/* Start Button */}
          <View style={styles.questControls}>
            <TouchableOpacity
              style={styles.startBtn}
              onPress={onStartRun}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#008378', '#059669', '#10b981']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.startBtnGradient}
              >
                <Ionicons name="play" size={20} color="#ffffff" />
                <Text style={styles.startBtnText}>Start Run • +120 XP</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* 3. Locked Mission */}
        <View style={styles.lockedQuestCard}>
          <View style={styles.questLeft}>
            <View style={styles.lockBox}>
              <Ionicons name="lock-closed" size={18} color="#64748b" />
            </View>
            <View style={styles.questTextWrap}>
              <View style={styles.lockedHeaderRow}>
                <Text style={styles.lockedTag}>10M RECOVERY</Text>
                <Text style={styles.unlockSub}>Unlocks after run</Text>
              </View>
              <Text style={styles.lockedTitle}>Foam Roll & Breathe</Text>
            </View>
          </View>
          <MaterialCommunityIcons name="spa" size={22} color="#a855f7" />
        </View>
      </View>

      {/* 4. Summary & Performance Cards Grid */}
      <View style={[styles.dashboardGrid, isWide && styles.dashboardGridWide]}>
        {/* CARD 1: WEEKLY SUMMARY */}
        <View style={[styles.summaryCard, isWide && styles.cardFlex1]}>
          <Text style={styles.cardHeaderLabel}>WEEKLY SUMMARY</Text>
          <Text style={styles.planTitle} numberOfLines={1} ellipsizeMode="tail">
            Middle Distance Low Volume Base...
          </Text>

          <View style={styles.metricsColsRow}>
            {/* TOTAL */}
            <View style={styles.metricCol}>
              <View style={styles.colHeaderRow}>
                <Ionicons name="calendar-outline" size={13} color="#0284c7" />
                <Text style={styles.colHeaderLabel}>TOTAL</Text>
              </View>
              <View style={styles.metricValGroup}>
                <Text style={styles.metricValBold}>0:00 <Text style={styles.metricValSub}>/2:41h</Text></Text>
                <Text style={styles.metricValBold}>0 <Text style={styles.metricValSub}>/151 load</Text></Text>
                <Text style={styles.metricValBold}>0km <Text style={styles.metricValSub}>/5.2km</Text></Text>
              </View>
            </View>

            {/* BIKE */}
            <View style={styles.metricCol}>
              <View style={styles.colHeaderRow}>
                <MaterialCommunityIcons name="bike" size={14} color="#d97706" />
                <Text style={styles.colHeaderLabel}>BIKE</Text>
              </View>
              <View style={styles.metricValGroup}>
                <Text style={styles.metricValBold}>0:00 <Text style={styles.metricValSub}>/1:49h</Text></Text>
                <Text style={styles.metricValBold}>0 <Text style={styles.metricValSub}>/87 load</Text></Text>
              </View>
            </View>

            {/* RUN */}
            <View style={styles.metricCol}>
              <View style={styles.colHeaderRow}>
                <FontAwesome5 name="running" size={13} color="#ea580c" />
                <Text style={styles.colHeaderLabel}>RUN</Text>
              </View>
              <View style={styles.metricValGroup}>
                <Text style={styles.metricValBold}>0:00 <Text style={styles.metricValSub}>/0:52h</Text></Text>
                <Text style={styles.metricValBold}>0 <Text style={styles.metricValSub}>/63 load</Text></Text>
                <Text style={styles.metricValBold}>0km <Text style={styles.metricValSub}>/5.2km</Text></Text>
              </View>
            </View>
          </View>
        </View>

        {/* CARD 2: WEEKLY PERFORMANCE */}
        <View style={[styles.summaryCard, isWide && styles.cardFlex1]}>
          <View style={styles.cardHeaderBetween}>
            <Text style={styles.cardHeaderLabel}>WEEKLY PERFORMANCE</Text>
            <TouchableOpacity activeOpacity={0.7} style={styles.detailsBtn}>
              <Text style={styles.detailsText}>Details</Text>
              <Feather name="external-link" size={12} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* 3 Metric Figures */}
          <View style={styles.perfMetricsRow}>
            <View style={styles.perfCol}>
              <View style={styles.perfNumRow}>
                <Text style={styles.perfMinus}>— </Text>
                <Text style={styles.perfNum}>25</Text>
              </View>
              <View style={styles.perfLabelWrap}>
                <Text style={styles.perfLabel}>FITNESS</Text>
                <Ionicons name="help-circle-outline" size={12} color="#94a3b8" />
              </View>
            </View>

            <View style={styles.perfDivider} />

            <View style={styles.perfCol}>
              <View style={styles.perfNumRow}>
                <Text style={styles.perfMinus}>— </Text>
                <Text style={styles.perfNum}>22</Text>
              </View>
              <View style={styles.perfLabelWrap}>
                <Text style={styles.perfLabel}>FATIGUE</Text>
                <Ionicons name="help-circle-outline" size={12} color="#94a3b8" />
              </View>
            </View>

            <View style={styles.perfDivider} />

            <View style={styles.perfCol}>
              <View style={styles.perfNumRow}>
                <Text style={styles.perfMinus}>— </Text>
                <Text style={styles.perfNum}>0</Text>
              </View>
              <View style={styles.perfLabelWrap}>
                <Text style={styles.perfLabel}>FORM</Text>
                <Ionicons name="help-circle-outline" size={12} color="#94a3b8" />
              </View>
            </View>
          </View>

          {/* Status Box */}
          <View style={styles.readinessBox}>
            <Text style={styles.readinessStatus}>Ready to Train</Text>
            <Text style={styles.readinessDesc}>
              Fitness and fatigue are in balance. Good conditions for training.
            </Text>
          </View>
        </View>
      </View>

      {/* 5. Encouragement Banner */}
      <View style={styles.encouragementBanner}>
        <Ionicons name="heart" size={20} color="#10b981" />
        <Text style={styles.encouragementText}>
          Speed is built on easy miles. Enjoy it, {athleteName}! 🏃💨
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 18,
  },
  topGreetingSection: {
    gap: 10,
    paddingTop: 4,
  },
  headlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headlineTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#131b2e',
    letterSpacing: -0.5,
  },
  orangeDot: {
    color: '#F97316',
  },
  targetRaceCountdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(186, 230, 253, 0.6)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  raceInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  raceTimerIconBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  raceNameText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#131b2e',
    letterSpacing: -0.2,
  },
  daysLeftBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ea580c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#9a3412',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 2,
    borderBottomWidth: 2.5,
    borderBottomColor: '#9a3412',
  },
  daysLeftText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.4,
  },
  streakSection: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 16,
    gap: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fireBox: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.onSurface,
  },
  streakSub: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  streakNumberBadge: {
    backgroundColor: '#ffedd5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  streakNumberText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ea580c',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  dayCol: {
    alignItems: 'center',
    gap: 6,
  },
  dayLetter: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  todayLetter: {
    color: '#0284c7',
    fontWeight: '900',
  },
  dayBubbleDone: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBubbleToday: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBubbleEmpty: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#cbd5e1',
  },
  milestoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  trophyIconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#f59e0b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneTextWrap: {
    flex: 1,
    gap: 2,
  },
  milestoneTag: {
    fontSize: 10,
    fontWeight: '900',
    color: '#92400e',
    letterSpacing: 0.5,
  },
  milestoneDesc: {
    fontSize: 13,
    color: '#78350f',
    fontWeight: '600',
  },
  boldText: {
    fontWeight: '900',
  },
  missionsSection: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.onSurface,
  },
  readyBadge: {
    backgroundColor: '#ccfbf1',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#5eead4',
  },
  readyBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00685f',
  },
  questCardCompleted: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    opacity: 0.85,
  },
  questLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkIconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questTextWrap: {
    gap: 2,
  },
  doneLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.5,
  },
  questTitleDone: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748b',
    textDecorationLine: 'line-through',
  },
  xpBadgeCompleted: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  xpTextCompleted: {
    fontSize: 12,
    fontWeight: '800',
    color: '#b45309',
  },
  activeQuestCard: {
    borderRadius: 24,
    padding: 16,
    borderWidth: 2,
    borderColor: '#14b8a6',
    gap: 14,
    elevation: 4,
    shadowColor: '#14b8a6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  activeTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffedd5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#c2410c',
    letterSpacing: 0.5,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ccfbf1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  timeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f766e',
  },
  questMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  runIconBox: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: '#06b6d4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questDetail: {
    gap: 2,
  },
  activeQuestTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.onSurface,
  },
  activeQuestSub: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0d9488',
  },
  trailGraphicContainer: {
    position: 'relative',
    height: 120,
    borderRadius: 18,
    overflow: 'hidden',
  },
  trailImage: {
    width: '100%',
    height: '100%',
  },
  hrBadgeOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hrOverlayLabel: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  questControls: {
    gap: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#99f6e4',
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  startBtn: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  startBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    gap: 8,
  },
  startBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  lockedQuestCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    opacity: 0.8,
  },
  lockBox: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lockedTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
  },
  unlockSub: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  lockedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  dashboardGrid: {
    gap: 14,
  },
  dashboardGridWide: {
    flexDirection: 'row',
  },
  cardFlex1: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  cardHeaderLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.8,
  },
  cardHeaderBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  planTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  metricsColsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    gap: 8,
  },
  metricCol: {
    flex: 1,
    gap: 6,
  },
  colHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  colHeaderLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
  },
  metricValGroup: {
    gap: 2,
  },
  metricValBold: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
  },
  metricValSub: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748b',
  },
  perfMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 4,
  },
  perfCol: {
    alignItems: 'center',
    gap: 4,
  },
  perfNumRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  perfMinus: {
    fontSize: 18,
    fontWeight: '800',
    color: '#10b981',
  },
  perfNum: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
  },
  perfLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  perfLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  perfDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#f1f5f9',
  },
  readinessBox: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 8,
    gap: 2,
  },
  readinessStatus: {
    fontSize: 13,
    fontWeight: '800',
    color: '#10b981',
  },
  readinessDesc: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748b',
    lineHeight: 16,
  },
  encouragementBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#a7f3d0',
    gap: 10,
  },
  encouragementText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#065f46',
  },
});
