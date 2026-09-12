import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { COLORS } from '../theme';
import API_BASE_URL from '../config';
import styles from './styles/TrainingScheduleScreen.styles';
import {
  toISODate,
  calculateWeeksAway,
  getEventIcon,
  getSportTrainingPlan,
} from '../utils/trainingPlanGenerator';

import RaceCountdownBanner from '../components/schedule/RaceCountdownBanner';
import ScheduleCalendar from '../components/schedule/ScheduleCalendar';
import TodayWorkoutCard from '../components/schedule/TodayWorkoutCard';
import PlanAdaptationsSection from '../components/schedule/PlanAdaptationsSection';
import EventConfigModal from '../components/schedule/EventConfigModal';

// Re-export for backwards compatibility
export { toISODate, calculateWeeksAway, getEventIcon, getSportTrainingPlan };

export default function TrainingScheduleScreen({
  currentUser,
  userProfile,
  trainingPlan,
  adaptedPlan: parentAdaptedPlan,
  selectedDay: parentSelectedDay = 12,
  onSelectDay,
  onUpdatePlan,
  onUpdateAdaptedPlan,
  onUpdateProfile,
  onStartWorkout,
  onOpenCoach,
  dbEvents: propDbEvents,
  onRefreshEvents,
}) {
  const [viewMode, setViewMode] = useState('week'); // 'week' | 'month'
  const [selectedDay, setSelectedDayState] = useState(parentSelectedDay || 12);
  const [adaptedPlan, setAdaptedPlan] = useState(parentAdaptedPlan || null);

  React.useEffect(() => {
    if (parentSelectedDay !== undefined) {
      setSelectedDayState(parentSelectedDay);
    }
  }, [parentSelectedDay]);

  const setSelectedDay = (day) => {
    setSelectedDayState(day);
    if (onSelectDay) {
      onSelectDay(day);
    }
  };

  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [editEventText, setEditEventText] = useState('');
  const [editDateText, setEditDateText] = useState('');

  React.useEffect(() => {
    if (parentAdaptedPlan !== undefined) {
      setAdaptedPlan(parentAdaptedPlan);
    }
  }, [parentAdaptedPlan]);

  React.useEffect(() => {
    if (trainingPlan) {
      setAiPlan(trainingPlan);
    }
  }, [trainingPlan]);

  const EVENT_OPTIONS = [
    { title: 'Hyrox Open / Pro', date: 'November 15, 2026', weeks: '18 Weeks Away', icon: 'dumbbell' },
    { title: 'Marathon Prep', date: 'December 10, 2026', weeks: '22 Weeks Away', icon: 'running' },
    { title: 'Triathlon 70.3', date: 'October 20, 2026', weeks: '14 Weeks Away', icon: 'swimmer' },
    { title: '5K / 10K Speed Base', date: 'January 18, 2027', weeks: '27 Weeks Away', icon: 'stopwatch' },
    { title: 'Hyrox Pro', date: 'February 22, 2027', weeks: '32 Weeks Away', icon: 'trophy' },
  ];

  const formatDateString = (dateStr) => {
    if (!dateStr) return 'November 15, 2026';
    if (dateStr.includes(',')) return dateStr;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
      ];
      if (monthNames[monthIdx]) {
        return `${monthNames[monthIdx]} ${day}, ${year}`;
      }
    }
    return dateStr;
  };

  const [targetRace, setTargetRace] = useState(userProfile?.race_type || userProfile?.target_event || 'Hyrox Open / Pro');
  const [targetDate, setTargetDate] = useState(formatDateString(userProfile?.race_date || userProfile?.target_date));

  const handleOpenAdjustModal = () => {
    setEditEventText(targetRace);
    setEditDateText(targetDate);
    setIsAdjustModalOpen(true);
  };

  const handleSaveAdjust = () => {
    const newRace = editEventText.trim() || targetRace;
    const newDate = editDateText.trim() ? formatDateString(editDateText.trim()) : targetDate;
    setTargetRace(newRace);
    setTargetDate(newDate);
    setIsAdjustModalOpen(false);

    // Immediately update plan locally so all workouts, calendar, and card reflect the new event
    const newPlan = getSportTrainingPlan(newRace, newDate);
    setAiPlan(newPlan);

    // Inform parent component to synchronize across the whole app (Home screen, profile, etc.)
    if (onUpdatePlan) {
      onUpdatePlan(newPlan);
    }
    if (onUpdateAdaptedPlan) {
      onUpdateAdaptedPlan(null);
    }
    if (onUpdateProfile) {
      onUpdateProfile({ race_type: newRace, race_date: newDate });
    }

    // Persist to backend database for permanent sync
    const username = currentUser?.username || 'DemoAccount';
    fetch(`${API_BASE_URL}/api/plan/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        race_type: newRace,
        race_date: newDate,
        plan_data: newPlan,
      }),
    })
      .then(() => {
        fetchDbEvents();
        if (onRefreshEvents) onRefreshEvents();
      })
      .catch((err) => {
        console.log('Plan save offline fallback:', err?.message || err);
      });
  };

  React.useEffect(() => {
    if (userProfile?.race_type || userProfile?.target_event) {
      setTargetRace(userProfile.race_type || userProfile.target_event);
    }
    if (userProfile?.race_date || userProfile?.target_date) {
      setTargetDate(formatDateString(userProfile.race_date || userProfile.target_date));
    }
  }, [userProfile]);

  const [aiPlan, setAiPlan] = useState(trainingPlan || null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdapting, setIsAdapting] = useState(false);

  React.useEffect(() => {
    const fetchOrGeneratePlan = async () => {
      setIsLoading(true);
      const username = currentUser?.username || 'DemoAccount';
      try {
        let res = await fetch(`${API_BASE_URL}/api/plan/current?username=${username}`);
        let data = await res.json();

        if (!data.success || !data.plan || !data.plan.plan_data) {
          res = await fetch(`${API_BASE_URL}/api/plan/generate?username=${username}&race_type=${encodeURIComponent(targetRace)}&race_date=${encodeURIComponent(targetDate)}`, {
            method: 'POST',
          });
          data = await res.json();
        }

        if (data.success && data.plan && data.plan.plan_data) {
          setAiPlan(data.plan.plan_data);
        } else {
          setAiPlan(getSportTrainingPlan(targetRace, targetDate));
        }
      } catch (e) {
        console.log('Plan fetch fallback:', e?.message || e);
        setAiPlan(getSportTrainingPlan(targetRace, targetDate));
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrGeneratePlan();
  }, [currentUser]);

  const [localDbEvents, setLocalDbEvents] = useState([]);
  const dbEvents = (propDbEvents && propDbEvents.length > 0) ? propDbEvents : localDbEvents;

  const fetchDbEvents = async () => {
    if (onRefreshEvents) {
      onRefreshEvents();
    }
    const username = currentUser?.username || 'DemoAccount';
    try {
      const res = await fetch(`${API_BASE_URL}/api/events?username=${username}&month=9`);
      const data = await res.json();
      if (data.success && data.events) {
        setLocalDbEvents(data.events);
      }
    } catch (e) {
      console.log('Fetch events fallback:', e?.message || e);
    }
  };

  React.useEffect(() => {
    fetchDbEvents();
  }, [currentUser]);

  const handleToggleComplete = async (complete = true, dayToMark = selectedDay) => {
    const username = currentUser?.username || 'DemoAccount';
    const endpoint = complete ? '/api/events/complete' : '/api/events/uncomplete';
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          day_number: dayToMark,
          event_date: `2026-09-${String(dayToMark).padStart(2, '0')}`,
          xp_awarded: 120,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setLocalDbEvents(prev => prev.map(e => {
          if (e.day_number === dayToMark) {
            return {
              ...e,
              status: complete ? 'completed' : 'planned',
              is_completed: complete,
              completed_at: complete ? new Date().toISOString() : null,
            };
          }
          return e;
        }));
        if (onRefreshEvents) {
          onRefreshEvents();
        }
        if (data.user && onUpdateProfile) {
          onUpdateProfile({ xp: data.user.xp, streak_days: data.user.streak_days });
        }
      }
    } catch (err) {
      console.log('Toggle event completion offline fallback:', err?.message || err);
      // Still update UI locally so user gets immediate visual gratification!
      setLocalDbEvents(prev => prev.map(e => {
        if (e.day_number === dayToMark) {
          return {
            ...e,
            status: complete ? 'completed' : 'planned',
            is_completed: complete,
            completed_at: complete ? new Date().toISOString() : null,
          };
        }
        return e;
      }));
    }
  };

  const days = [
    { day: 'M', date: 7, isToday: false },
    { day: 'T', date: 8, isToday: false },
    { day: 'W', date: 9, isToday: false },
    { day: 'T', date: 10, isToday: false },
    { day: 'F', date: 11, isToday: false },
    { day: 'S', date: 12, isToday: true },
    { day: 'S', date: 13, isToday: false },
  ];

  const monthDays = [
    // Week 1 (Aug 31 - Sep 6)
    { date: 31, isOtherMonth: true },
    { date: 1 }, { date: 2 }, { date: 3 }, { date: 4 }, { date: 5 }, { date: 6 },
    // Week 2 (Sep 7 - Sep 13)
    { date: 7 }, { date: 8 }, { date: 9 }, { date: 10 }, { date: 11 }, { date: 12, isToday: true }, { date: 13 },
    // Week 3 (Sep 14 - Sep 20)
    { date: 14 }, { date: 15 }, { date: 16 }, { date: 17 }, { date: 18 }, { date: 19 }, { date: 20 },
    // Week 4 (Sep 21 - Sep 27)
    { date: 21 }, { date: 22 }, { date: 23 }, { date: 24 }, { date: 25 }, { date: 26 }, { date: 27 },
    // Week 5 (Sep 28 - Oct 4)
    { date: 28 }, { date: 29 }, { date: 30 },
    { date: 1, isOtherMonth: true }, { date: 2, isOtherMonth: true }, { date: 3, isOtherMonth: true }, { date: 4, isOtherMonth: true },
  ];

  const getIconData = (workout_type) => {
    let icon = 'run';
    let iconColor = COLORS.primary;
    let iconBg = '#ffffff';
    const wtype = (workout_type || '').toLowerCase();

    if (wtype.includes('rest') || wtype.includes('recovery')) {
      icon = 'bed'; iconColor = '#64748b'; iconBg = '#e2e8f0';
    } else if (wtype.includes('walk')) {
      icon = 'walk'; iconColor = '#0d9488'; iconBg = '#ccfbf1';
    } else if (wtype.includes('swim')) {
      icon = 'swim'; iconColor = '#0284c7'; iconBg = '#bae6fd';
    } else if (wtype.includes('bike') || wtype.includes('cycle')) {
      icon = 'bike'; iconColor = '#ea580c'; iconBg = '#ffdbca';
    } else if (wtype.includes('strength') || wtype.includes('gym') || wtype.includes('hyrox')) {
      icon = 'dumbbell'; iconColor = '#7c3aed'; iconBg = '#ede9fe';
    } else if (wtype.includes('interval') || wtype.includes('speed') || wtype.includes('tempo')) {
      icon = 'lightning-bolt'; iconColor = '#d97706'; iconBg = '#fef3c7';
    } else if (wtype.includes('long') || wtype.includes('heart')) {
      icon = 'heart'; iconColor = '#e11d48'; iconBg = '#fce7f3';
    } else {
      icon = 'run'; iconColor = '#00685f'; iconBg = '#89f5e7';
    }

    return { icon, iconColor, iconBg, iconType: 'mc' };
  };

  const dynamicDays = days.map((d, idx) => {
    const ev = dbEvents.find(e => e.day_number === d.date);
    const isCompleted = ev ? (ev.status === 'completed' || ev.is_completed) : false;

    const aiDay = aiPlan?.weeks?.[0]?.days?.[idx];
    const workoutType = ev?.workout_type || aiDay?.workout_type || 'Zone 2 Base';
    const workoutDesc = ev?.description || aiDay?.description || 'Aerobic conditioning';
    const iconData = getIconData(workoutType);

    if (isCompleted) {
      return {
        ...d,
        status: 'completed',
        isCompleted: true,
        aiWorkoutType: workoutType,
        aiDescription: workoutDesc,
        icon: 'checkmark',
        iconType: 'ion',
        iconColor: '#ffffff',
        iconBg: COLORS.primary,
        bg: '#ffffff',
      };
    }

    if (d.isToday) {
      return {
        ...d,
        status: 'today',
        isCompleted: false,
        aiWorkoutType: workoutType,
        aiDescription: workoutDesc,
        icon: iconData.icon,
        iconType: iconData.iconType,
        iconColor: COLORS.primary,
        iconBg: '#ffffff',
        bg: COLORS.primary,
      };
    }

    return {
      ...d,
      status: 'planned',
      isCompleted: false,
      aiWorkoutType: workoutType,
      aiDescription: workoutDesc,
      icon: iconData.icon,
      iconType: iconData.iconType,
      iconColor: iconData.iconColor,
      iconBg: iconData.iconBg,
      bg: '#ffffff',
    };
  });

  const dynamicMonthDays = monthDays.map((d, idx) => {
    if (d.isOtherMonth) return d;

    const ev = dbEvents.find(e => e.day_number === d.date);
    const isCompleted = ev ? (ev.status === 'completed' || ev.is_completed) : false;
    const isToday = d.date === 12;

    let workoutType = ev?.workout_type;
    let workoutDesc = ev?.description;
    if (!workoutType && aiPlan && aiPlan.weeks) {
      const activeIndex = monthDays.slice(0, idx).filter(x => !x.isOtherMonth).length;
      if (activeIndex < 28) {
        const weekIdx = Math.floor(activeIndex / 7);
        const dayIdx = activeIndex % 7;
        const aiDay = aiPlan.weeks[weekIdx]?.days?.[dayIdx];
        workoutType = aiDay?.workout_type;
        workoutDesc = aiDay?.description;
      }
    }
    const iconData = getIconData(workoutType || 'run');

    if (isCompleted) {
      return {
        ...d,
        type: 'completed',
        isCompleted: true,
        aiWorkoutType: workoutType,
        aiDescription: workoutDesc,
        icon: 'checkmark',
        iconType: 'ion',
        iconColor: '#ffffff',
        iconBg: COLORS.primary,
      };
    }

    if (isToday) {
      return {
        ...d,
        type: 'today',
        isCompleted: false,
        aiWorkoutType: workoutType,
        aiDescription: workoutDesc,
        icon: iconData.icon,
        iconType: iconData.iconType,
        iconColor: COLORS.primary,
        iconBg: '#ffffff',
        isToday: true,
      };
    }

    return {
      ...d,
      type: 'planned',
      isCompleted: false,
      aiWorkoutType: workoutType,
      aiDescription: workoutDesc,
      icon: iconData.icon,
      iconType: iconData.iconType,
      iconColor: iconData.iconColor,
      iconBg: iconData.iconBg,
    };
  });

  const monthWeeks = [];
  for (let i = 0; i < dynamicMonthDays.length; i += 7) {
    monthWeeks.push(dynamicMonthDays.slice(i, i + 7));
  }

  let selectedDayData = null;
  if (viewMode === 'week') {
    selectedDayData = dynamicDays.find(d => d.date === selectedDay) || dynamicDays[5];
  } else {
    selectedDayData = dynamicMonthDays.find(d => !d.isOtherMonth && d.date === selectedDay) || dynamicMonthDays.find(d => !d.isOtherMonth && d.date === 12);
  }
  const isTodaySelected = selectedDay === 12 || Boolean(selectedDayData?.isToday);

  const getScheduleTags = (workout_type) => {
    const wtype = (workout_type || '').toLowerCase();
    if (wtype.includes('rest') || wtype.includes('recovery')) {
      return [
        { icon: 'bed', text: 'Hydration & Sleep Focus' },
        { icon: 'spa', text: 'Light Mobility & Stretch' },
      ];
    } else if (wtype.includes('swim')) {
      return [
        { icon: 'swim', text: 'Goggles & Lap Pool' },
        { icon: 'heart-pulse', text: 'Stroke Rate Sensor' },
      ];
    } else if (wtype.includes('bike') || wtype.includes('cycle')) {
      return [
        { icon: 'bike', text: 'Road Bike or Trainer' },
        { icon: 'lightning-bolt', text: 'FTP Cadence Meter' },
      ];
    } else if (wtype.includes('strength') || wtype.includes('gym') || wtype.includes('hyrox') || wtype.includes('sled')) {
      return [
        { icon: 'dumbbell', text: 'Kettlebells & Sled' },
        { icon: 'arm-flex', text: 'Grip & Core Straps' },
      ];
    } else if (wtype.includes('tempo') || wtype.includes('interval') || wtype.includes('speed')) {
      return [
        { icon: 'watch', text: 'GPS Pacing Watch' },
        { icon: 'fire', text: 'Lactate Threshold Focus' },
      ];
    } else {
      return [
        { icon: 'watch', text: 'GPS Watch or HR Sensor' },
        { icon: 'run', text: 'Road or Trail Running' },
      ];
    }
  };

  const getScheduleCardTheme = (workout_type, icon) => {
    const wtype = (workout_type || '').toLowerCase();
    const ic = (icon || '').toLowerCase();

    if (wtype.includes('rest') || wtype.includes('recovery') || ic === 'bed' || ic === 'spa') {
      return {
        colors: ['#f1f5f9', '#e2e8f0', '#cbd5e1'],
        iconColor: '#475569',
        btnBg: '#475569',
        btnBorder: '#334155',
      };
    } else if (wtype.includes('swim') || ic === 'swim') {
      return {
        colors: ['#e0f2fe', '#bae6fd', '#7dd3fc'],
        iconColor: '#0284c7',
        btnBg: '#0284c7',
        btnBorder: '#0369a1',
      };
    } else if (wtype.includes('bike') || wtype.includes('cycle') || ic === 'bike') {
      return {
        colors: ['#fff7ed', '#ffedd5', '#fed7aa'],
        iconColor: '#ea580c',
        btnBg: '#ea580c',
        btnBorder: '#c2410c',
      };
    } else if (wtype.includes('strength') || wtype.includes('gym') || wtype.includes('hyrox') || wtype.includes('sled') || ic === 'dumbbell') {
      return {
        colors: ['#faf5ff', '#f3e8ff', '#e9d5ff'],
        iconColor: '#7c3aed',
        btnBg: '#7c3aed',
        btnBorder: '#6d28d9',
      };
    } else if (wtype.includes('tempo') || wtype.includes('interval') || wtype.includes('speed') || ic === 'lightning-bolt') {
      return {
        colors: ['#fffbeb', '#fef3c7', '#fde68a'],
        iconColor: '#d97706',
        btnBg: '#d97706',
        btnBorder: '#b45309',
      };
    } else {
      return {
        colors: ['#89f5e7', '#6bd8cb', '#46cdbe'],
        iconColor: COLORS.primary,
        btnBg: '#00685f',
        btnBorder: '#004c44',
      };
    }
  };

  const activeWorkoutType = (adaptedPlan && isTodaySelected)
    ? (adaptedPlan === 'walk' ? 'Active Walk & Form Recovery' : adaptedPlan === 'ease' ? 'Zone 1-2 Easy Aerobic Recovery' : 'Full Rest & Cellular Regeneration')
    : (selectedDayData?.aiWorkoutType || selectedDayData?.status || '');
  const activeIcon = (adaptedPlan && isTodaySelected)
    ? (adaptedPlan === 'walk' ? 'walk' : adaptedPlan === 'ease' ? 'run' : 'bed')
    : (selectedDayData?.icon);
  const cardTheme = getScheduleCardTheme(activeWorkoutType, activeIcon);

  const isRestDay = (activeWorkoutType || '').toLowerCase().includes('rest') ||
                    activeIcon === 'bed' ||
                    activeIcon === 'spa' ||
                    (adaptedPlan === 'rest' && isTodaySelected);

  const handleAdapt = async (type, label) => {
    const nextType = adaptedPlan === type ? null : type;
    setAdaptedPlan(nextType);
    if (onUpdateAdaptedPlan) {
      onUpdateAdaptedPlan(nextType);
    }
    if (!nextType) return;
    setIsAdapting(true);
    const username = currentUser?.username || 'DemoAccount';
    try {
      const res = await fetch(`${API_BASE_URL}/api/plan/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          feedback: `I selected the adaptation: ${label}. Please adjust my plan accordingly.`,
        }),
      });
      const data = await res.json();
      if (data.success && data.plan && data.plan.plan_data) {
        setAiPlan(data.plan.plan_data);
        if (onUpdatePlan) {
          onUpdatePlan(data.plan.plan_data);
        }
        fetchDbEvents();
      }
    } catch (e) {
      console.log('Adapt plan fallback:', e?.message || e);
    } finally {
      setIsAdapting(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Target Race & Timeline Countdown Banner */}
      <RaceCountdownBanner
        targetRace={targetRace}
        targetDate={targetDate}
        handleOpenAdjustModal={handleOpenAdjustModal}
      />

      {/* 2. Calendar Card: Week View vs Month View */}
      <ScheduleCalendar
        viewMode={viewMode}
        setViewMode={setViewMode}
        targetRace={targetRace}
        aiPlan={aiPlan}
        dynamicDays={dynamicDays}
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
        monthWeeks={monthWeeks}
      />

      {/* 3. What To Do Today Section */}
      <TodayWorkoutCard
        isLoading={isLoading}
        isTodaySelected={isTodaySelected}
        selectedDay={selectedDay}
        cardTheme={cardTheme}
        activeIcon={activeIcon}
        selectedDayData={selectedDayData}
        activeWorkoutType={activeWorkoutType}
        adaptedPlan={adaptedPlan}
        getScheduleTags={getScheduleTags}
        handleToggleComplete={handleToggleComplete}
        isRestDay={isRestDay}
        onStartWorkout={onStartWorkout}
        setSelectedDay={setSelectedDay}
      />

      {/* 4. Not Feeling 100%? / Quick Plan Adaptations Section */}
      <PlanAdaptationsSection
        isTodaySelected={isTodaySelected}
        isRestDay={isRestDay}
        adaptedPlan={adaptedPlan}
        handleAdapt={handleAdapt}
      />

      {/* Adjust Target Event & Date Modal */}
      <EventConfigModal
        isAdjustModalOpen={isAdjustModalOpen}
        setIsAdjustModalOpen={setIsAdjustModalOpen}
        eventOptions={EVENT_OPTIONS}
        editEventText={editEventText}
        setEditEventText={setEditEventText}
        editDateText={editDateText}
        setEditDateText={setEditDateText}
        handleSaveAdjust={handleSaveAdjust}
      />
    </ScrollView>
  );
}
