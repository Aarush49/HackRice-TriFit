import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  Animated,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme';
const getWorkoutTags = (workout_type) => {
  const wtype = (workout_type || '').toLowerCase();
  if (wtype.includes('rest') || wtype.includes('recovery')) {
    return [
      { text: 'Cellular Repair', bg: '#f1f5f9', color: '#475569' },
      { text: 'Hydration & Sleep', bg: '#f1f5f9', color: '#475569' }
    ];
  } else if (wtype.includes('tempo') || wtype.includes('threshold')) {
    return [
      { text: 'Lactate Threshold', bg: '#fff7ed', color: '#c2410c' },
      { text: 'Zone 3/4 Sustained', bg: '#ffedd5', color: '#ea580c' },
      { text: 'Maya Cues', bg: '#f0fdfa', color: '#0d9488' }
    ];
  } else if (wtype.includes('run') || wtype.includes('jog')) {
    return [
      { text: 'Zone 2 Aerobic Base', bg: '#f0fdfa', color: '#0f766e' },
      { text: 'Tendon Adaptations', bg: '#ccfbf1', color: '#0d9488' },
      { text: 'Maya Cues', bg: '#f0fdfa', color: '#0d9488' }
    ];
  } else if (wtype.includes('swim')) {
    return [
      { text: 'VO2 & Stroke Efficiency', bg: '#e0f2fe', color: '#0284c7' },
      { text: 'Zero Impact Cardio', bg: '#f0f9ff', color: '#0369a1' }
    ];
  } else if (wtype.includes('bike') || wtype.includes('cycle')) {
    return [
      { text: 'Power Threshold (FTP)', bg: '#fff7ed', color: '#ea580c' },
      { text: 'RPM Cadence', bg: '#ffdbca', color: '#9a3412' }
    ];
  } else if (wtype.includes('strength') || wtype.includes('gym') || wtype.includes('hyrox') || wtype.includes('sled')) {
    return [
      { text: 'Power Endurance', bg: '#f3e8ff', color: '#7e22ce' },
      { text: 'Grip & Core Strength', bg: '#ede9fe', color: '#6b21a8' },
      { text: 'Maya Cues', bg: '#f0fdfa', color: '#0d9488' }
    ];
  } else {
    return [
      { text: 'Aerobic Base', bg: '#f0fdfa', color: '#0f766e' },
      { text: 'Form & Recovery', bg: '#e0f2fe', color: '#0369a1' }
    ];
  }
};


export default function DailyMissionsScreen({
  currentUser,
  userProfile,
  onStartRun,
  onOpenCoach,
  onNavigateToSchedule,
  xp = 420,
  setXp,
  streakDays = 14,
}) {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  // Track completed side habits
  const [completedHabits, setCompletedHabits] = useState({});
  const [activeScale] = useState(new Animated.Value(1));
  const [aiPlan, setAiPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [wearableData, setWearableData] = useState({
    readiness_score: 88,
    hrv_ms: 64,
    sleep_hours: 8.2,
    steps: 6400,
    active_calories: 480,
    zone2_minutes: 45
  });
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchWearableData = async () => {
    const username = currentUser?.username || 'testuser2';
    try {
      const res = await fetch(`http://localhost:8000/api/wearables/current?username=${username}`);
      const data = await res.json();
      if (data.success && data.metrics) {
        setWearableData(data.metrics);
      }
    } catch (e) {
      console.error('Failed to fetch wearable metrics:', e);
    }
  };

  const handleSyncWearables = async () => {
    setIsSyncing(true);
    const username = currentUser?.username || 'testuser2';
    try {
      const res = await fetch(`http://localhost:8000/api/wearables/sync-simulated?username=${username}`, { method: 'POST' });
      const data = await res.json();
      if (data.success && data.wearable) {
        setWearableData(data.wearable);
      }
    } catch (e) {
      console.error('Failed to sync wearables:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  React.useEffect(() => {
    const fetchOrGeneratePlan = async () => {
      setIsLoading(true);
      const username = currentUser?.username || 'testuser2';
      try {
        let res = await fetch(`http://localhost:8000/api/plan/current?username=${username}`);
        let data = await res.json();
        if (!data.success) {
          res = await fetch(`http://localhost:8000/api/plan/generate?username=${username}`, { method: 'POST' });
          data = await res.json();
        }
        if (data.success && data.plan && data.plan.plan_data) setAiPlan(data.plan.plan_data);
      } catch (e) {
        console.error('Failed to fetch plan:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrGeneratePlan();
    fetchWearableData();
  }, [currentUser]);

  const rawTodayWorkout = aiPlan?.weeks?.[0]?.days?.[2] || {
    workout_type: 'Hyrox Sled & Grip Prep',
    description: 'Power Endurance • Low Joint Strain'
  };

  const isRest = (rawTodayWorkout.workout_type || '').toLowerCase().includes('rest') || 
                 (rawTodayWorkout.workout_type || '').toLowerCase().includes('recovery');

  const todayWorkout = {
    ...rawTodayWorkout,
    description: isRest 
      ? 'Day of light stretching and recovery for tomorrow' 
      : rawTodayWorkout.description
  };

  const rawDesc = todayWorkout?.description || '';
  const cleanDesc = (rawDesc.includes(':') ? rawDesc.split(':')[1].trim() : rawDesc) || 'Zone 2 Aerobic & Form Drills';

  const getWorkoutTheme = (workout_type) => {
    const wtype = (workout_type || '').toLowerCase();
    
    if (wtype.includes('rest') || wtype.includes('recovery')) {
      return {
        isRest: true,
        icon: 'bed',
        iconColors: ['#64748b', '#475569'],
        cardColors: ['#ffffff', '#f8fafc'],
        borderColor: '#cbd5e1',
        pillBg: '#f1f5f9',
        pillText: '#475569',
        duration: 'Rest Day',
      };
    } else if (wtype.includes('swim')) {
      return {
        isRest: false,
        icon: 'swim',
        iconColors: ['#0284c7', '#0369a1'],
        cardColors: ['#ffffff', '#f0f9ff'],
        borderColor: '#38bdf8',
        pillBg: '#e0f2fe',
        pillText: '#0369a1',
        duration: '45 min',
      };
    } else if (wtype.includes('bike') || wtype.includes('cycle')) {
      return {
        isRest: false,
        icon: 'bike',
        iconColors: ['#ea580c', '#c2410c'],
        cardColors: ['#ffffff', '#fff7ed'],
        borderColor: '#fb923c',
        pillBg: '#ffedd5',
        pillText: '#c2410c',
        duration: '45 min',
      };
    } else if (wtype.includes('strength') || wtype.includes('gym') || wtype.includes('hyrox')) {
      return {
        isRest: false,
        icon: 'dumbbell',
        iconColors: ['#7c3aed', '#6d28d9'],
        cardColors: ['#ffffff', '#faf5ff'],
        borderColor: '#a855f7',
        pillBg: '#f3e8ff',
        pillText: '#6d28d9',
        duration: '45 min',
      };
    } else if (wtype.includes('interval') || wtype.includes('tempo') || wtype.includes('speed')) {
      return {
        isRest: false,
        icon: 'lightning-bolt',
        iconColors: ['#d97706', '#b45309'],
        cardColors: ['#ffffff', '#fffbeb'],
        borderColor: '#f59e0b',
        pillBg: '#fef3c7',
        pillText: '#b45309',
        duration: '40 min',
      };
    } else {
      return {
        isRest: false,
        icon: 'run',
        iconColors: ['#008378', '#10b981'],
        cardColors: ['#ffffff', '#f0fdfa'],
        borderColor: '#14b8a6',
        pillBg: '#ccfbf1',
        pillText: '#0f766e',
        duration: '45 min',
      };
    }
  };

  const workoutTheme = getWorkoutTheme(todayWorkout.workout_type);

  const toggleHabit = (id, habitXp) => {
    setCompletedHabits((prev) => {
      const isDone = !!prev[id];
      const nextState = { ...prev, [id]: !isDone };
      if (setXp) {
        setXp((currentXp) => (isDone ? Math.max(0, currentXp - habitXp) : currentXp + habitXp));
      }
      return nextState;
    });
  };

  const handleStartWorkout = () => {
    Animated.sequence([
      Animated.timing(activeScale, { toValue: 0.96, duration: 100, useNativeDriver: true }),
      Animated.timing(activeScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    if (onStartRun) {
      onStartRun();
    }
  };

  const isStepsDone = (wearableData.steps || 0) >= 8000 || !!completedHabits['habit_2'];
  const completedCount = 1 + Object.values(completedHabits).filter(Boolean).length + (isStepsDone && !completedHabits['habit_2'] ? 1 : 0);
  const targetRace = userProfile?.race_type ? userProfile.race_type.toUpperCase() : 'HYROX BUILD';
  const planDay = streakDays > 0 ? streakDays : 14;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, isWide && styles.wideContent]}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Subheader: Category Pill + Headline */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.categoryRow}>
            <View style={styles.categoryPill}>
              <Ionicons name="flash" size={11} color="#0f766e" />
              <Text style={styles.categoryPillText}>{targetRace}</Text>
            </View>
            <Text style={styles.categorySub}>Zone 2 &amp; Power</Text>
          </View>
          <Text style={styles.headingTitle}>Today's Mission</Text>
        </View>

        <View style={styles.dayBadge}>
          <Ionicons name="calendar-outline" size={13} color={COLORS.primary} />
          <Text style={styles.dayBadgeText}>Day {planDay} of 90</Text>
        </View>
      </View>

      {/* 2. Bento 1: Daily Readiness & Progress Gauge Card */}
      <View style={styles.readinessCard}>
        <View style={styles.readinessTopRow}>
          {/* Circular Gauge */}
          <View style={styles.gaugeContainer}>
            <View style={styles.svgRingWrapper}>
              <Svg width={56} height={56} viewBox="0 0 48 48">
                <Circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="#f1f5f9"
                  strokeWidth="4.5"
                  fill="none"
                />
                <Circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="#008378"
                  strokeWidth="4.5"
                  strokeDasharray="125.66"
                  strokeDashoffset="15"
                  strokeLinecap="round"
                  fill="none"
                  transform="rotate(-90 24 24)"
                />
              </Svg>
              <View style={styles.gaugeInnerLabel}>
                <Text style={styles.gaugePercent}>{wearableData.readiness_score}%</Text>
                <Text style={styles.gaugeStatus}>{wearableData.readiness_score >= 80 ? 'READY' : 'RECOVER'}</Text>
              </View>
            </View>

            <View style={styles.readinessInfo}>
              <View style={styles.stateTitleRow}>
                <Text style={styles.stateTitle}>{wearableData.readiness_score >= 80 ? 'Optimum State' : 'Recovery Focus'}</Text>
              </View>
              <View style={styles.metricPillsRow}>
                <View style={styles.metricPillGreen}>
                  <Ionicons name="heart" size={11} color="#15803d" />
                  <Text style={styles.metricPillGreenText}>HRV {wearableData.hrv_ms}ms</Text>
                </View>
                <View style={styles.metricPillTeal}>
                  <Ionicons name="moon" size={11} color="#0f766e" />
                  <Text style={styles.metricPillTealText}>{wearableData.sleep_hours}h Sleep</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Right Quests Progress Indicator & Sync Button */}
          <View style={styles.questsSummary}>
            <TouchableOpacity 
              style={styles.syncBtnPill} 
              onPress={handleSyncWearables} 
              activeOpacity={0.8}
              disabled={isSyncing}
            >
              <MaterialCommunityIcons name="sync" size={13} color="#0f766e" />
              <Text style={styles.syncBtnText}>{isSyncing ? 'Syncing...' : 'Sync Wearables'}</Text>
            </TouchableOpacity>
            <Text style={styles.xpGainedSub}>Open Wearables API</Text>
          </View>
        </View>

        {/* 3-Column Micro-Gauge Strip */}
        <View style={styles.microGaugeStrip}>
          <View style={styles.microGaugeCol}>
            <View style={styles.microGaugeHeader}>
              <Text style={styles.microGaugeTitle}>CARDIO</Text>
              <MaterialCommunityIcons name="check-circle" size={13} color="#10b981" />
            </View>
            <Text style={styles.microGaugeVal}>45 / 45m</Text>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: '100%', backgroundColor: '#10b981' }]} />
            </View>
          </View>

          <View style={styles.microGaugeCol}>
            <View style={styles.microGaugeHeader}>
              <Text style={styles.microGaugeTitle}>STRENGTH</Text>
              <Text style={[styles.microGaugeHeaderRight, { color: '#f97316' }]}>35m</Text>
            </View>
            <Text style={styles.microGaugeVal}>0 / 35m</Text>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: '20%', backgroundColor: '#f97316' }]} />
            </View>
          </View>

          <View style={styles.microGaugeCol}>
            <View style={styles.microGaugeHeader}>
              <Text style={styles.microGaugeTitle}>MOBILITY</Text>
              <Text style={styles.microGaugeHeaderRight}>15m</Text>
            </View>
            <Text style={styles.microGaugeVal}>
              {completedHabits['habit_1'] ? 'Done' : 'Pending'}
            </Text>
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: completedHabits['habit_1'] ? '100%' : '0%',
                    backgroundColor: '#06b6d4',
                  },
                ]}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Main Active Mission Card (Priority Workout) */}
      <LinearGradient
        colors={workoutTheme.cardColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.workoutCard, { borderColor: workoutTheme.borderColor }]}
      >
        <View style={styles.workoutCardHeader}>
          <View style={styles.workoutInfoLeft}>
            <LinearGradient
              colors={workoutTheme.iconColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.workoutIconBox}
            >
              <MaterialCommunityIcons name={workoutTheme.icon} size={20} color="#ffffff" />
            </LinearGradient>
            <View style={styles.workoutTitles}>
              <View style={styles.workoutBadgeRow}>
                <View style={[styles.priorityPill, { backgroundColor: workoutTheme.pillBg }]}>
                  <Text style={[styles.priorityPillText, { color: workoutTheme.pillText }]}>
                    {workoutTheme.isRest ? 'REST DAY' : 'PRIORITY WORKOUT'}
                  </Text>
                </View>
                <Text style={styles.durationBullet}>• {workoutTheme.duration}</Text>
              </View>
              <Text style={styles.workoutName} numberOfLines={1}>
                {todayWorkout.workout_type}
              </Text>
            </View>
          </View>

          <View style={styles.xpRewardBadge}>
            <Ionicons name="flash" size={12} color="#0f766e" />
            <Text style={styles.xpRewardText}>+85 XP</Text>
          </View>
        </View>

        {/* Workout Highlights Strip (Clickable Button -> Schedule) */}
        <TouchableOpacity
          style={styles.clickableDescriptionBox}
          onPress={onNavigateToSchedule}
          activeOpacity={0.85}
        >
          <View style={styles.descTextRow}>
            <Text style={styles.highlightText} numberOfLines={2} ellipsizeMode="tail">
              {cleanDesc}
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#0f766e" style={{ marginLeft: 4 }} />
          </View>
        </TouchableOpacity>

        {/* Chunky Vibrant CTA (Hidden on Rest Days) */}
        {!workoutTheme.isRest && (
          <Animated.View style={{ transform: [{ scale: activeScale }] }}>
            <TouchableOpacity
              onPress={handleStartWorkout}
              activeOpacity={0.9}
              style={styles.startWorkoutTouch}
            >
              <LinearGradient
                colors={workoutTheme.iconColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.startWorkoutGradient}
              >
                <Ionicons name="play" size={18} color="#ffffff" style={{ marginRight: 4 }} />
                <Text style={styles.startWorkoutText}>Start Workout</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}
      </LinearGradient>

      {/* 5. Compact 2-Column Daily Habits / Recovery Quests Grid */}
      <View style={styles.habitsSection}>
        <View style={styles.habitsHeader}>
          <Text style={styles.habitsTitle}>DAILY HABITS &amp; SIDE QUESTS</Text>
          <Text style={styles.habitsSub}>+50 XP remaining</Text>
        </View>

        <View style={styles.habitsGrid}>
          {/* Habit Card 1 */}
          <View style={styles.habitCard}>
            <View style={styles.habitContent}>
              <View style={styles.habitTopRow}>
                <View style={[styles.habitIconBox, { backgroundColor: '#e0f2fe' }]}>
                  <MaterialCommunityIcons name="shower-head" size={16} color="#0284c7" />
                </View>
                <View style={styles.habitXpBadge}>
                  <Text style={styles.habitXpText}>+20 XP</Text>
                </View>
              </View>

              <Text style={styles.habitCardTitle}>Cold Shower &amp; Breath</Text>
              <Text style={styles.habitCardSub}>3m Reset Protocol</Text>
            </View>

            <TouchableOpacity
              onPress={() => toggleHabit('habit_1', 20)}
              activeOpacity={0.8}
              style={[
                styles.habitActionBtn,
                completedHabits['habit_1'] && styles.habitActionBtnActive,
              ]}
            >
              <Ionicons
                name={completedHabits['habit_1'] ? 'checkmark-circle' : 'add'}
                size={13}
                color={completedHabits['habit_1'] ? '#15803d' : '#0f766e'}
              />
              <Text
                style={[
                  styles.habitActionText,
                  completedHabits['habit_1'] && { color: '#15803d' },
                ]}
              >
                {completedHabits['habit_1'] ? 'Completed' : 'Done'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Habit Card 2 */}
          <View style={[styles.habitCard, isStepsDone && { borderColor: '#bbf7d0', backgroundColor: '#f0fdf4' }]}>
            <View style={styles.habitContent}>
              <View style={styles.habitTopRow}>
                <View style={[styles.habitIconBox, { backgroundColor: isStepsDone ? '#dcfce7' : '#ffedd5' }]}>
                  <Ionicons name="footsteps" size={15} color={isStepsDone ? '#15803d' : '#ea580c'} />
                </View>
                <View style={[styles.habitXpBadge, isStepsDone && { backgroundColor: '#bbf7d0' }]}>
                  <Text style={[styles.habitXpText, isStepsDone && { color: '#15803d' }]}>
                    {isStepsDone ? '✓ +30 XP' : '+30 XP'}
                  </Text>
                </View>
              </View>

              <Text style={styles.habitCardTitle}>Target 8k Steps</Text>
              <View style={styles.stepsStatsRow}>
                <Text style={[styles.stepsCount, isStepsDone && { color: '#15803d', fontWeight: '700' }]}>
                  {`${((wearableData.steps || 0) / 1000).toFixed(1)}k / 8.0k`}
                </Text>
                <Text style={[styles.stepsPercent, isStepsDone && { color: '#15803d', fontWeight: '800' }]}>
                  {`${Math.min(100, Math.round(((wearableData.steps || 0) / 8000) * 100))}%`}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSyncWearables}
              activeOpacity={0.8}
              disabled={isSyncing}
              style={[
                styles.habitActionBtn,
                isStepsDone && styles.habitActionBtnActive,
              ]}
            >
              <MaterialCommunityIcons
                name={isSyncing ? 'sync' : (isStepsDone ? 'check-circle' : 'sync')}
                size={13}
                color={isSyncing ? '#ea580c' : (isStepsDone ? '#15803d' : '#c2410c')}
              />
              <Text style={[styles.habitActionText, { color: isSyncing ? '#ea580c' : (isStepsDone ? '#15803d' : '#c2410c') }]}>
                {isSyncing ? 'Syncing...' : (isStepsDone ? 'Completed' : 'Sync')}
              </Text>
            </TouchableOpacity>
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
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 12,
  },
  wideContent: {
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },

  /* 1. Subheader */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  headerLeft: {
    flexDirection: 'column',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ccfbf1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#99f6e4',
  },
  categoryPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0f766e',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categorySub: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
  },
  headingTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#131b2e',
    letterSpacing: -0.3,
  },
  dayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eaedff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  dayBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3d4947',
  },

  /* 2. Bento 1: Daily Readiness & Progress Gauge */
  readinessCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#eaedff',
    shadowColor: '#00685f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    gap: 12,
  },
  readinessTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gaugeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  svgRingWrapper: {
    width: 56,
    height: 56,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeInnerLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugePercent: {
    fontSize: 14,
    fontWeight: '800',
    color: '#131b2e',
    lineHeight: 16,
  },
  gaugeStatus: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#008378',
    letterSpacing: 0.2,
  },
  readinessInfo: {
    flexDirection: 'column',
    gap: 4,
  },
  stateTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  stateTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#131b2e',
  },
  metricPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricPillGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  metricPillGreenText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#15803d',
  },
  metricPillTeal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#f0fdfa',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#99f6e4',
  },
  metricPillTealText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0f766e',
  },
  questsSummary: {
    alignItems: 'flex-end',
  },
  questsBadge: {
    backgroundColor: '#ffedd5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  questsBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ea580c',
  },
  syncBtnPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ccfbf1',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#99f6e4',
  },
  syncBtnText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0f766e',
  },
  xpGainedSub: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 3,
  },

  /* Micro-Gauge Strip */
  microGaugeStrip: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(234, 237, 255, 0.8)',
  },
  microGaugeCol: {
    flex: 1,
    backgroundColor: 'rgba(242, 243, 255, 0.7)',
    borderRadius: 10,
    padding: 8,
  },
  microGaugeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  microGaugeTitle: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.3,
  },
  microGaugeHeaderRight: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748b',
  },
  microGaugeVal: {
    fontSize: 12,
    fontWeight: '900',
    color: '#131b2e',
    marginVertical: 1,
  },
  progressBarTrack: {
    width: '100%',
    height: 5,
    backgroundColor: '#e2e8f0',
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 999,
  },

  /* 3. Coach Maya Banner */
  coachBanner: {
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(110, 231, 183, 0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },
  coachBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  coachAvatarWrapper: {
    position: 'relative',
  },
  coachAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#10b981',
  },
  coachVerifiedDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  coachTextGroup: {
    flex: 1,
  },
  coachHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  coachName: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065f46',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  coachFocusBadge: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  coachFocusText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#0f766e',
  },
  coachMessage: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#131b2e',
    lineHeight: 15,
  },
  coachAskBtn: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#a7f3d0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  coachAskText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00685f',
  },

  /* 4. Priority Workout Card */
  workoutCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 2,
    borderColor: '#14b8a6',
    shadowColor: '#14b8a6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 3,
    gap: 12,
  },
  workoutCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  workoutInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  workoutIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#065f46',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
  },
  workoutTitles: {
    flex: 1,
  },
  workoutBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  priorityPill: {
    backgroundColor: '#ffedd5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#ea580c',
    letterSpacing: 0.4,
  },
  durationBullet: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#131b2e',
    lineHeight: 20,
  },
  xpRewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ccfbf1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#99f6e4',
  },
  xpRewardText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0f766e',
  },
  highlightsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    width: '100%',
  },
  highlightPill: {
    flex: 1,
    flexShrink: 1,
    overflow: 'hidden',
    backgroundColor: '#f2f3ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eaedff',
  },
  highlightPillTeal: {
    borderColor: '#ccfbf1',
    backgroundColor: '#f0fdfa',
  },
  highlightText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#3d4947',
    lineHeight: 16,
  },
  clickableDescriptionBox: {
    backgroundColor: '#f2f3ff',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#eaedff',
    gap: 8,
  },
  descTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  startWorkoutTouch: {
    width: '100%',
    borderRadius: 12,
    borderBottomWidth: 3,
    borderBottomColor: '#065f46',
    overflow: 'hidden',
  },
  startWorkoutGradient: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startWorkoutText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },

  /* 5. Daily Habits / Quests Grid */
  habitsSection: {
    gap: 8,
    marginTop: 2,
  },
  habitsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  habitsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#131b2e',
    letterSpacing: 0.4,
  },
  habitsSub: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00685f',
  },
  habitsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  habitCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eaedff',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  habitContent: {
    flex: 1,
  },
  habitTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  habitIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitXpBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  habitXpText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#b45309',
  },
  habitCardTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#131b2e',
    lineHeight: 16,
  },
  habitCardSub: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 2,
  },
  stepsStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  stepsCount: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748b',
  },
  stepsPercent: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#059669',
  },
  habitActionBtn: {
    marginTop: 10,
    width: '100%',
    paddingVertical: 5,
    backgroundColor: '#f2f3ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eaedff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  habitActionBtnActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#bbf7d0',
  },
  habitActionBtnActiveOrange: {
    backgroundColor: '#ffedd5',
    borderColor: '#fed7aa',
  },
  habitActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f766e',
  },
});

