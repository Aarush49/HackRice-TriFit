import React, { useState } from 'react';
import {
  ScrollView,
  useWindowDimensions,
  Animated,
  View,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getSportTrainingPlan } from './TrainingScheduleScreen';
import API_BASE_URL from '../config';
import styles from './styles/DailyMissionsScreen.styles';
import { getWorkoutTags } from '../utils/workoutTagUtils';
import ViewingDayBanner from '../components/missions/ViewingDayBanner';
import ReadinessCard from '../components/missions/ReadinessCard';
import MainMissionCard from '../components/missions/MainMissionCard';
import HabitsGrid from '../components/missions/HabitsGrid';

export { getWorkoutTags };

export default function DailyMissionsScreen({
  currentUser,
  userProfile,
  trainingPlan,
  adaptedPlan,
  selectedDay = 12,
  onSelectDay,
  onUpdatePlan,
  onUpdateAdaptedPlan,
  onStartRun,
  onOpenCoach,
  onNavigateToSchedule,
  xp = 420,
  setXp,
  streakDays = 14,
  dbEvents = [],
  onRefreshEvents,
  onUpdateProfile,
}) {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  // Track completed side habits
  const [completedHabits, setCompletedHabits] = useState({});
  const [activeScale] = useState(new Animated.Value(1));
  const [aiPlan, setAiPlan] = useState(trainingPlan || null);
  const [isLoading, setIsLoading] = useState(!trainingPlan);
  const [wearableData, setWearableData] = useState({
    readiness_score: 88,
    hrv_ms: 64,
    sleep_hours: 8.2,
    steps: 0,
    active_calories: 480,
    zone2_minutes: 45,
  });
  const [isSyncing, setIsSyncing] = useState(false);

  React.useEffect(() => {
    if (trainingPlan) {
      setAiPlan(trainingPlan);
      setIsLoading(false);
    }
  }, [trainingPlan]);

  const fetchWearableData = async () => {
    const username = currentUser?.username || 'DemoAccount';
    try {
      const res = await fetch(`${API_BASE_URL}/api/wearables/current?username=${username}`);
      const data = await res.json();
      if (data.success && data.metrics) {
        setWearableData(data.metrics);
      }
    } catch (e) {
      console.log('Wearable metrics fallback used:', e?.message || e);
    }
  };

  const handleSyncWearables = async () => {
    setIsSyncing(true);
    const username = currentUser?.username || 'DemoAccount';
    try {
      const res = await fetch(`${API_BASE_URL}/api/wearables/sync-simulated?username=${username}`, { method: 'POST' });
      const data = await res.json();
      if (data.success && data.wearable) {
        setWearableData(data.wearable);
      }
    } catch (e) {
      console.log('Wearable sync fallback:', e?.message || e);
    } finally {
      setIsSyncing(false);
    }
  };

  React.useEffect(() => {
    const fetchOrGeneratePlan = async () => {
      const username = currentUser?.username || 'DemoAccount';
      try {
        let res = await fetch(`${API_BASE_URL}/api/plan/current?username=${username}`);
        let data = await res.json();
        if (!data.success || !data.plan || !data.plan.plan_data) {
          const race = userProfile?.race_type || 'Hyrox Open / Pro';
          const date = userProfile?.race_date || 'November 15, 2026';
          res = await fetch(`${API_BASE_URL}/api/plan/generate?username=${username}&race_type=${encodeURIComponent(race)}&race_date=${encodeURIComponent(date)}`, { method: 'POST' });
          data = await res.json();
        }
        if (data.success && data.plan && data.plan.plan_data) {
          setAiPlan(data.plan.plan_data);
          if (onUpdatePlan) onUpdatePlan(data.plan.plan_data);
        } else {
          const race = userProfile?.race_type || 'Hyrox Open / Pro';
          const date = userProfile?.race_date || 'November 15, 2026';
          const fallbackPlan = getSportTrainingPlan(race, date);
          setAiPlan(fallbackPlan);
          if (onUpdatePlan) onUpdatePlan(fallbackPlan);
        }
      } catch (e) {
        console.log('Plan fetch fallback:', e?.message || e);
        const race = userProfile?.race_type || 'Hyrox Open / Pro';
        const date = userProfile?.race_date || 'November 15, 2026';
        setAiPlan(getSportTrainingPlan(race, date));
      } finally {
        setIsLoading(false);
      }
    };
    if (!trainingPlan) {
      fetchOrGeneratePlan();
    }
    fetchWearableData();
  }, [currentUser, trainingPlan, userProfile?.race_type]);

  const effectivePlan = trainingPlan || aiPlan;
  const isTodaySelected = selectedDay === 12;

  const currentEvent = dbEvents.find(e => e.day_number === selectedDay);
  const isEventCompleted = currentEvent ? (currentEvent.status === 'completed' || currentEvent.is_completed) : false;

  // Day 7 = Mon (0), Day 8 = Tue (1), Day 9 = Wed (2), Day 10 = Thu (3), Day 11 = Fri (4), Day 12 = Sat (5 - Today), Day 13 = Sun (6)
  let dayIndex = 5;
  if (selectedDay >= 7 && selectedDay <= 13) {
    dayIndex = selectedDay - 7;
  } else if (selectedDay >= 1 && selectedDay <= 31) {
    dayIndex = (selectedDay - 1) % 7;
  }

  const rawDayWorkout = {
    workout_type: currentEvent?.workout_type || effectivePlan?.weeks?.[0]?.days?.[dayIndex]?.workout_type || 'Compromised Run',
    description: currentEvent?.description || effectivePlan?.weeks?.[0]?.days?.[dayIndex]?.description || '4 x 800m run with 100 Wall Balls (6kg) buy-in',
  };

  let activeWorkoutType = rawDayWorkout.workout_type;
  let activeDescription = rawDayWorkout.description;

  if (isTodaySelected && adaptedPlan) {
    if (adaptedPlan === 'walk') {
      activeWorkoutType = 'Active Walk & Form Recovery';
      activeDescription = 'Gentle outdoor walk to keep tendons supple';
    } else if (adaptedPlan === 'ease') {
      activeWorkoutType = 'Zone 1-2 Easy Aerobic Recovery';
      activeDescription = 'Dialed back 30% intensity for fresh legs';
    } else if (adaptedPlan === 'rest') {
      activeWorkoutType = 'Full Rest & Cellular Regeneration';
      activeDescription = 'Sleep, hydrate, and let mitochondria rebuild';
    }
  }

  const isRest = (activeWorkoutType || '').toLowerCase().includes('rest') ||
                 (activeWorkoutType || '').toLowerCase().includes('recovery') ||
                 (isTodaySelected && adaptedPlan === 'rest');

  const todayWorkout = {
    ...rawDayWorkout,
    workout_type: activeWorkoutType,
    description: activeDescription,
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
    } else if (wtype.includes('walk')) {
      return {
        isRest: false,
        icon: 'walk',
        iconColors: ['#0d9488', '#0f766e'],
        cardColors: ['#ffffff', '#f0fdfa'],
        borderColor: '#14b8a6',
        pillBg: '#ccfbf1',
        pillText: '#0f766e',
        duration: '25 min',
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
  const targetRace = (
    userProfile?.race_type ||
    (effectivePlan?.goal ? effectivePlan.goal.replace('Prepare for ', '').split(' by ')[0] : 'HYROX OPEN / PRO')
  ).toUpperCase();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, isWide && styles.wideContent]}
      showsVerticalScrollIndicator={false}
    >
      <ViewingDayBanner
        targetRace={targetRace}
        isTodaySelected={isTodaySelected}
        selectedDay={selectedDay}
        onSelectDay={onSelectDay}
      />

      <ReadinessCard
        wearableData={wearableData}
        isSyncing={isSyncing}
        handleSyncWearables={handleSyncWearables}
        completedHabits={completedHabits}
      />

      {/* Coach Maya Live Audio Check-in Banner */}
      <LinearGradient
        colors={['#ecfdf5', '#f0fdfa', '#fefce8']}
        style={styles.coachBanner}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.coachBannerLeft}>
          <View style={styles.coachAvatarWrapper}>
            <Image
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkV_Kd98o6DF09QGU3Gv4u4RHrWKdogf2D9arDcGv7Q2Vk-EFcwI-DUvPk06TqN1p7jMDTnyDAtO9Eut9Gg0SuOHxBLr6fjQZf-jVpL8FXVtywrDY7hIXe-MtvSbm4lJxvH33wjLyLAYHWJF0xAcl7H5IDxuWt2gTWNvt4MrnZiPmCs41s4CuDkgUULkPUD6Kba0pSdzqTetGtAlJdKyark3WqzqdqaCxkkRcLLGwn6YCYWjgbgx1-',
              }}
              style={styles.coachAvatar}
            />
            <View style={styles.coachVerifiedDot}>
              <Ionicons name="flash" size={8} color="#ffffff" />
            </View>
          </View>
          <View style={styles.coachTextGroup}>
            <View style={styles.coachHeaderRow}>
              <Text style={styles.coachName}>Coach Maya</Text>
              <View style={styles.coachFocusBadge}>
                <Text style={styles.coachFocusText}>AI VOICE COACH</Text>
              </View>
            </View>
            <Text style={styles.coachMessage} numberOfLines={1}>
              {wearableData.readiness_score >= 80
                ? "Readiness is optimal. Tap Speak to talk pacing & strategy!"
                : "Dial into steady Zone 2 effort today. Tap Speak to check in!"}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.coachAskBtn}
          onPress={onOpenCoach}
          activeOpacity={0.8}
        >
          <Ionicons name="mic" size={14} color="#00685f" />
          <Text style={styles.coachAskText}>Speak</Text>
        </TouchableOpacity>
      </LinearGradient>

      <MainMissionCard
        workoutTheme={workoutTheme}
        todayWorkout={todayWorkout}
        cleanDesc={cleanDesc}
        onNavigateToSchedule={onNavigateToSchedule}
        isEventCompleted={isEventCompleted}
        isTodaySelected={isTodaySelected}
        selectedDay={selectedDay}
        handleStartWorkout={handleStartWorkout}
        onSelectDay={onSelectDay}
      />

      <HabitsGrid
        completedHabits={completedHabits}
        toggleHabit={toggleHabit}
        wearableData={wearableData}
        isStepsDone={isStepsDone}
        isSyncing={isSyncing}
        handleSyncWearables={handleSyncWearables}
      />
    </ScrollView>
  );
}
