import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  ActivityIndicator,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons, Feather, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme';

export default function TrainingScheduleScreen({ currentUser, userProfile, onStartWorkout, onOpenCoach }) {
  const [viewMode, setViewMode] = useState('week'); // 'week' | 'month'
  const [selectedDay, setSelectedDay] = useState(12); // Wed 12 is today
  const [adaptedPlan, setAdaptedPlan] = useState(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [editEventText, setEditEventText] = useState('');
  const [editDateText, setEditDateText] = useState('');

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
        'July', 'August', 'September', 'October', 'November', 'December'
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
    handleAdapt('event_change', `Changed target event to ${newRace}`);
  };

  React.useEffect(() => {
    if (userProfile?.race_type || userProfile?.target_event) {
      setTargetRace(userProfile.race_type || userProfile.target_event);
    }
    if (userProfile?.race_date || userProfile?.target_date) {
      setTargetDate(formatDateString(userProfile.race_date || userProfile.target_date));
    }
  }, [userProfile]);

  const [aiPlan, setAiPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdapting, setIsAdapting] = useState(false);

  React.useEffect(() => {
    const fetchOrGeneratePlan = async () => {
      setIsLoading(true);
      const username = currentUser?.username || 'testuser2';
      try {
        let res = await fetch(`http://localhost:8000/api/plan/current?username=${username}`);
        let data = await res.json();
        
        if (!data.success) {
          res = await fetch(`http://localhost:8000/api/plan/generate?username=${username}`, {
            method: 'POST'
          });
          data = await res.json();
        }
        
        if (data.success && data.plan && data.plan.plan_data) {
          setAiPlan(data.plan.plan_data);
        }
      } catch (e) {
        console.error("Failed to fetch plan:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrGeneratePlan();
  }, [currentUser]);

  const days = [
    { day: 'W', date: 12, status: 'today', icon: 'run', iconType: 'mc', bg: COLORS.primary, iconColor: COLORS.primary, iconBg: '#ffffff', isToday: true },
    { day: 'T', date: 13, status: 'planned', icon: 'lightning-bolt', iconType: 'mc', bg: '#ffffff', iconColor: '#ea580c', iconBg: '#ffdbca' },
    { day: 'F', date: 14, status: 'rest', icon: 'spa', iconType: 'mc', bg: '#ffffff', iconColor: '#64748b', iconBg: '#e2e8f0' },
    { day: 'S', date: 15, status: 'long', icon: 'heart', iconType: 'mc', bg: '#ffffff', iconColor: '#00685f', iconBg: '#89f5e7' },
    { day: 'S', date: 16, status: 'rest', icon: 'bed', iconType: 'mc', bg: '#ffffff', iconColor: '#64748b', iconBg: '#e2e8f0' },
  ];

  const monthDays = [
    // Week 1 (Oct 26 - Nov 1)
    { date: 26, isOtherMonth: true },
    { date: 27, isOtherMonth: true },
    { date: 28, isOtherMonth: true },
    { date: 29, isOtherMonth: true },
    { date: 30, isOtherMonth: true },
    { date: 31, isOtherMonth: true },
    { date: 1, type: 'long', icon: 'heart', iconColor: '#00685f', iconBg: '#89f5e7' },

    // Week 2 (Nov 2 - Nov 8)
    { date: 2, type: 'rest', icon: 'bed', iconColor: '#64748b', iconBg: '#e2e8f0' },
    { date: 3, type: 'easy', icon: 'run', iconColor: '#00685f', iconBg: '#89f5e7' },
    { date: 4, type: 'intervals', icon: 'lightning-bolt', iconColor: '#ea580c', iconBg: '#ffdbca' },
    { date: 5, type: 'easy', icon: 'run', iconColor: '#00685f', iconBg: '#89f5e7' },
    { date: 6, type: 'strength', icon: 'dumbbell', iconColor: '#7c3aed', iconBg: '#ede9fe' },
    { date: 7, type: 'rest', icon: 'spa', iconColor: '#64748b', iconBg: '#e2e8f0' },
    { date: 8, type: 'long', icon: 'heart', iconColor: '#00685f', iconBg: '#89f5e7' },

    // Week 3 (Nov 9 - Nov 15)
    { date: 9, type: 'rest', icon: 'bed', iconColor: '#64748b', iconBg: '#e2e8f0' },
    { date: 10, type: 'completed', icon: 'check', iconType: 'ion', iconColor: '#ffffff', iconBg: COLORS.primary },
    { date: 11, type: 'completed', icon: 'check', iconType: 'ion', iconColor: '#ffffff', iconBg: COLORS.primary },
    { date: 12, type: 'today', icon: 'run', iconColor: COLORS.primary, iconBg: '#ffffff', isToday: true },
    { date: 13, type: 'intervals', icon: 'lightning-bolt', iconColor: '#ea580c', iconBg: '#ffdbca' },
    { date: 14, type: 'rest', icon: 'spa', iconColor: '#64748b', iconBg: '#e2e8f0' },
    { date: 15, type: 'long', icon: 'heart', iconColor: '#00685f', iconBg: '#89f5e7' },

    // Week 4 (Nov 16 - Nov 22)
    { date: 16, type: 'rest', icon: 'bed', iconColor: '#64748b', iconBg: '#e2e8f0' },
    { date: 17, type: 'easy', icon: 'run', iconColor: '#00685f', iconBg: '#89f5e7' },
    { date: 18, type: 'intervals', icon: 'lightning-bolt', iconColor: '#ea580c', iconBg: '#ffdbca' },
    { date: 19, type: 'easy', icon: 'run', iconColor: '#00685f', iconBg: '#89f5e7' },
    { date: 20, type: 'strength', icon: 'dumbbell', iconColor: '#7c3aed', iconBg: '#ede9fe' },
    { date: 21, type: 'rest', icon: 'spa', iconColor: '#64748b', iconBg: '#e2e8f0' },
    { date: 22, type: 'long', icon: 'heart', iconColor: '#00685f', iconBg: '#89f5e7' },

    // Week 5 (Nov 23 - Nov 29)
    { date: 23, type: 'rest', icon: 'bed', iconColor: '#64748b', iconBg: '#e2e8f0' },
    { date: 24, type: 'easy', icon: 'run', iconColor: '#00685f', iconBg: '#89f5e7' },
    { date: 25, type: 'intervals', icon: 'lightning-bolt', iconColor: '#ea580c', iconBg: '#ffdbca' },
    { date: 26, type: 'easy', icon: 'run', iconColor: '#00685f', iconBg: '#89f5e7' },
    { date: 27, type: 'strength', icon: 'dumbbell', iconColor: '#7c3aed', iconBg: '#ede9fe' },
    { date: 28, type: 'rest', icon: 'spa', iconColor: '#64748b', iconBg: '#e2e8f0' },
    { date: 29, type: 'long', icon: 'heart', iconColor: '#00685f', iconBg: '#89f5e7' },

    // Week 6 (Nov 30 - Dec 6)
    { date: 30, type: 'rest', icon: 'bed', iconColor: '#64748b', iconBg: '#e2e8f0' },
    { date: 1, isOtherMonth: true },
    { date: 2, isOtherMonth: true },
    { date: 3, isOtherMonth: true },
    { date: 4, isOtherMonth: true },
    { date: 5, isOtherMonth: true },
    { date: 6, isOtherMonth: true },
  ];

  const getIconData = (workout_type) => {
    let icon = 'run';
    let iconColor = COLORS.primary;
    let iconBg = '#ffffff';
    const wtype = (workout_type || '').toLowerCase();
    
    if (wtype.includes('rest') || wtype.includes('recovery')) {
      icon = 'bed'; iconColor = '#64748b'; iconBg = '#e2e8f0';
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
    if (aiPlan && aiPlan.weeks && aiPlan.weeks.length > 0) {
      const aiDay = aiPlan.weeks[0].days[idx];
      if (aiDay) {
        const { icon, iconColor, iconBg, iconType } = getIconData(aiDay.workout_type);
        return {
          ...d,
          aiWorkoutType: aiDay.workout_type,
          aiDescription: aiDay.description,
          icon, iconColor, iconBg, iconType
        };
      }
    }
    return d;
  });

  const dynamicMonthDays = monthDays.map((d, idx) => {
    if (d.isOtherMonth) return d;
    
    const activeIndex = monthDays.slice(0, idx).filter(x => !x.isOtherMonth).length;
    if (aiPlan && aiPlan.weeks && activeIndex < 28) {
      const weekIdx = Math.floor(activeIndex / 7);
      const dayIdx = activeIndex % 7;
      if (aiPlan.weeks[weekIdx] && aiPlan.weeks[weekIdx].days[dayIdx]) {
        const aiDay = aiPlan.weeks[weekIdx].days[dayIdx];
        const { icon, iconColor, iconBg, iconType } = getIconData(aiDay.workout_type);
        return {
          ...d,
          aiWorkoutType: aiDay.workout_type,
          aiDescription: aiDay.description,
          icon, iconColor, iconBg, iconType
        };
      }
    }
    return d;
  });

  const monthWeeks = [];
  for (let i = 0; i < dynamicMonthDays.length; i += 7) {
    monthWeeks.push(dynamicMonthDays.slice(i, i + 7));
  }

  let selectedDayData = null;
  if (viewMode === 'week') {
    selectedDayData = dynamicDays.find(d => d.date === selectedDay) || dynamicDays[2];
  } else {
    selectedDayData = dynamicMonthDays.find(d => !d.isOtherMonth && d.date === selectedDay) || dynamicMonthDays.find(d => !d.isOtherMonth && d.date === 12);
  }

  const getScheduleTags = (workout_type) => {
    const wtype = (workout_type || '').toLowerCase();
    if (wtype.includes('rest') || wtype.includes('recovery')) {
      return [
        { icon: 'bed', text: 'Hydration & Sleep Focus' },
        { icon: 'spa', text: 'Light Mobility & Stretch' }
      ];
    } else if (wtype.includes('swim')) {
      return [
        { icon: 'swim', text: 'Goggles & Lap Pool' },
        { icon: 'heart-pulse', text: 'Stroke Rate Sensor' }
      ];
    } else if (wtype.includes('bike') || wtype.includes('cycle')) {
      return [
        { icon: 'bike', text: 'Road Bike or Trainer' },
        { icon: 'lightning-bolt', text: 'FTP Cadence Meter' }
      ];
    } else if (wtype.includes('strength') || wtype.includes('gym') || wtype.includes('hyrox') || wtype.includes('sled')) {
      return [
        { icon: 'dumbbell', text: 'Kettlebells & Sled' },
        { icon: 'arm-flex', text: 'Grip & Core Straps' }
      ];
    } else if (wtype.includes('tempo') || wtype.includes('interval') || wtype.includes('speed')) {
      return [
        { icon: 'watch', text: 'GPS Pacing Watch' },
        { icon: 'fire', text: 'Lactate Threshold Focus' }
      ];
    } else {
      return [
        { icon: 'watch', text: 'GPS Watch or HR Sensor' },
        { icon: 'run', text: 'Road or Trail Running' }
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
        btnBorder: '#334155'
      };
    } else if (wtype.includes('swim') || ic === 'swim') {
      return {
        colors: ['#e0f2fe', '#bae6fd', '#7dd3fc'],
        iconColor: '#0284c7',
        btnBg: '#0284c7',
        btnBorder: '#0369a1'
      };
    } else if (wtype.includes('bike') || wtype.includes('cycle') || ic === 'bike') {
      return {
        colors: ['#fff7ed', '#ffedd5', '#fed7aa'],
        iconColor: '#ea580c',
        btnBg: '#ea580c',
        btnBorder: '#c2410c'
      };
    } else if (wtype.includes('strength') || wtype.includes('gym') || wtype.includes('hyrox') || wtype.includes('sled') || ic === 'dumbbell') {
      return {
        colors: ['#faf5ff', '#f3e8ff', '#e9d5ff'],
        iconColor: '#7c3aed',
        btnBg: '#7c3aed',
        btnBorder: '#6d28d9'
      };
    } else if (wtype.includes('tempo') || wtype.includes('interval') || wtype.includes('speed') || ic === 'lightning-bolt') {
      return {
        colors: ['#fffbeb', '#fef3c7', '#fde68a'],
        iconColor: '#d97706',
        btnBg: '#d97706',
        btnBorder: '#b45309'
      };
    } else {
      return {
        colors: ['#89f5e7', '#6bd8cb', '#46cdbe'],
        iconColor: COLORS.primary,
        btnBg: '#00685f',
        btnBorder: '#004c44'
      };
    }
  };
  const cardTheme = getScheduleCardTheme(selectedDayData?.aiWorkoutType || selectedDayData?.status || '', selectedDayData?.icon);

  const isRestDay = (selectedDayData?.aiWorkoutType || '').toLowerCase().includes('rest') || 
                    selectedDayData?.icon === 'bed' || 
                    selectedDayData?.icon === 'spa' || 
                    adaptedPlan === 'rest';

  const handleAdapt = async (type, label) => {
    if (adaptedPlan === type) {
      setAdaptedPlan(null);
      return;
    } 
    setAdaptedPlan(type);
    setIsAdapting(true);
    const username = currentUser?.username || 'testuser2';
    try {
      const res = await fetch(`http://localhost:8000/api/plan/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          feedback: `I selected the adaptation: ${label}. Please adjust my plan accordingly.`
        })
      });
      const data = await res.json();
      if (data.success && data.plan && data.plan.plan_data) {
        setAiPlan(data.plan.plan_data);
      }
    } catch (e) {
      console.error("Failed to adapt plan:", e);
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
      <View style={styles.targetEventCard}>
        <View style={styles.targetEventTopRow}>
          <View style={styles.targetEventLeft}>
            <View style={styles.targetEventIconBox}>
              <FontAwesome5 name="dumbbell" size={16} color={COLORS.primary} />
            </View>
            <View style={styles.targetEventTextWrap}>
              <Text style={styles.targetEventLabel}>TARGET EVENT</Text>
              <Text style={styles.targetEventTitle}>{targetRace}</Text>
              <Text style={styles.targetEventDate}>{targetDate}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.adjustBtn}
            onPress={handleOpenAdjustModal}
            activeOpacity={0.8}
          >
            <Text style={styles.adjustBtnText}>Adjust</Text>
          </TouchableOpacity>
        </View>

        {/* Timeline Ramp Pill */}
        <View style={styles.targetRampPill}>
          <View style={styles.trendingBox}>
            <Ionicons name="trending-up" size={16} color="#783200" />
          </View>
          <View style={styles.rampTextWrap}>
            <View style={styles.rampHeaderRow}>
              <Text style={styles.rampWeeks}>{targetDate}</Text>
              <View style={styles.dotSeparator} />
              <Text style={styles.rampLabel}>Optimal Ramp</Text>
            </View>
            <Text style={styles.rampSub}>
              Ample buffer to adapt tendons and elevate VO2 max gradually!
            </Text>
          </View>
        </View>
      </View>

      {/* Title & Week/Month Switcher */}
      <View style={styles.topHeader}>
        <View>
          <View style={styles.monthBadgeRow}>
            <Ionicons name="calendar-outline" size={13} color={COLORS.primary} />
            <Text style={styles.monthBadgeText}>NOVEMBER 2026</Text>
          </View>
          <Text style={styles.screenTitle}>Training Schedule</Text>
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

      {/* 2. Calendar Card: Week View vs Month View */}
      {viewMode === 'week' ? (
        /* Week Horizontal Strip Calendar Card */
        <View style={styles.calendarCard}>
          <View style={styles.calendarCardHeader}>
            <View style={styles.weekThemeRow}>
              <MaterialCommunityIcons name="dumbbell" size={18} color={COLORS.primary} />
              <Text style={styles.weekThemeText}>Week 1 • Aerobic Base</Text>
            </View>
            <Text style={styles.weekDateRange}>Nov 10 – Nov 16</Text>
          </View>

          {/* 7 Day Grid */}
          <View style={styles.daysGrid}>
            {dynamicDays.map((d) => {
              const isSelected = selectedDay === d.date;
              const isToday = d.isToday;

              return (
                <TouchableOpacity
                  key={d.date}
                  style={[
                    styles.dayCard,
                    isSelected && styles.dayCardToday,
                    isToday && !isSelected && styles.dayCardSelected,
                  ]}
                  onPress={() => setSelectedDay(d.date)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dayLabel, isSelected && styles.dayLabelToday]}>
                    {d.day}
                  </Text>
                  <Text style={[styles.dayNumber, isSelected && styles.dayNumberToday]}>
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
      ) : (
        /* Expanded Big Month Calendar View */
        <View style={styles.monthCalendarCard}>
          <View style={styles.monthCalendarHeader}>
            <View style={styles.monthHeaderTitleWrap}>
              <Text style={styles.monthNameTitle}>November 2026</Text>
              <Text style={styles.monthSubTitle}>18-Week Periodized Plan</Text>
            </View>
            <View style={styles.monthStatBadge}>
              <Ionicons name="flame" size={14} color="#ea580c" />
              <Text style={styles.monthStatText}>24 Sessions</Text>
            </View>
          </View>

          {/* Day of Week Headers */}
          <View style={styles.monthDOWRow}>
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((dow, idx) => (
              <Text key={idx} style={styles.monthDOWText}>
                {dow}
              </Text>
            ))}
          </View>

          {/* Week-by-Week Rows */}
          <View style={styles.monthWeeksContainer}>
            {monthWeeks.map((week, wIdx) => (
              <View key={wIdx} style={styles.monthWeekRow}>
                {week.map((item, dIdx) => {
                  if (item.isOtherMonth) {
                    return (
                      <View key={dIdx} style={styles.monthOtherMonthCell}>
                        <Text style={styles.monthOtherMonthNum}>{item.date}</Text>
                      </View>
                    );
                  }

                  const isSelected = selectedDay === item.date;
                  const isToday = item.isToday;

                  return (
                    <TouchableOpacity
                      key={dIdx}
                      style={[
                        styles.monthDayCell,
                        isSelected && styles.monthDayCellToday,
                        isToday && !isSelected && styles.monthDayCellSelected,
                      ]}
                      onPress={() => setSelectedDay(item.date)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.monthDayNum,
                          isSelected && styles.monthDayNumToday,
                          isToday && !isSelected && styles.monthDayNumSelected,
                        ]}
                      >
                        {item.date}
                      </Text>

                      {item.icon ? (
                        <View
                          style={[
                            styles.monthDayDot,
                            { backgroundColor: item.iconBg || '#e2e8f0' },
                          ]}
                        >
                          {item.iconType === 'ion' ? (
                            <Ionicons name={item.icon} size={10} color={item.iconColor} />
                          ) : (
                            <MaterialCommunityIcons name={item.icon} size={10} color={item.iconColor} />
                          )}
                        </View>
                      ) : (
                        <View style={styles.monthDayEmptyDot} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      )}

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
        {isLoading ? (
          <View style={[styles.workoutCardWrapper, { alignItems: 'center', justifyContent: 'center', height: 200 }]}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={{ marginTop: 10, color: '#6d7a77' }}>Generating AI Training Plan...</Text>
          </View>
        ) : (
          <View style={styles.workoutCardWrapper}>
          <LinearGradient
            colors={cardTheme.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.workoutCard}
          >
            {/* Top Row: Icon + Title */}
            <View style={styles.workoutMainRow}>
              <View style={styles.workoutIconBox}>
                {selectedDayData.iconType === 'ion' ? (
                  <Ionicons name={selectedDayData.icon} size={28} color={cardTheme.iconColor} />
                ) : (
                  <MaterialCommunityIcons name={selectedDayData.icon} size={28} color={cardTheme.iconColor} />
                )}
              </View>
              <View style={styles.workoutTextWrap}>
                <Text style={styles.workoutTitle}>
                  {selectedDayData.aiWorkoutType || (adaptedPlan === 'walk'
                    ? 'Active Walk & Form Recovery'
                    : adaptedPlan === 'ease'
                    ? 'Zone 1-2 Easy Aerobic Recovery'
                    : adaptedPlan === 'rest'
                    ? 'Full Rest & Cellular Regeneration'
                    : 'Zone 2 Aerobic & Form Drills')}
                </Text>
                <Text style={styles.workoutSubtitle}>
                  {selectedDayData.aiDescription || (adaptedPlan === 'walk'
                    ? 'Gentle outdoor walk to keep tendons supple'
                    : adaptedPlan === 'ease'
                    ? 'Dialed back 30% intensity for fresh legs'
                    : adaptedPlan === 'rest'
                    ? 'Sleep, hydrate, and let mitochondria rebuild'
                    : 'Steady rhythmic breathing + cadence builds')}
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

            {/* Dynamic Equipment & Sensor Badges */}
            <View style={styles.equipmentBadgesRow}>
              {getScheduleTags(selectedDayData?.aiWorkoutType || selectedDayData?.status || '').map((tag, tIdx) => (
                <View key={tIdx} style={styles.gearPill}>
                  <MaterialCommunityIcons name={tag.icon} size={14} color={cardTheme.iconColor} />
                  <Text style={styles.gearPillText}>{tag.text}</Text>
                </View>
              ))}
            </View>

            {/* Action Button inside Card */}
            {!isRestDay ? (
              <TouchableOpacity
                style={[styles.startWorkoutBtn, { backgroundColor: cardTheme.btnBg, borderBottomColor: cardTheme.btnBorder }]}
                onPress={onStartWorkout}
                activeOpacity={0.88}
              >
                <Ionicons name="play" size={20} color="#ffffff" />
                <Text style={styles.startWorkoutBtnText}>Start Today's Workout</Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.startWorkoutBtn, { backgroundColor: 'rgba(255, 255, 255, 0.4)', borderWidth: 1, borderColor: '#99f6e4' }]}>
                <Ionicons name="bed" size={20} color="#0f766e" />
                <Text style={[styles.startWorkoutBtnText, { color: '#0f766e' }]}>Rest & Recovery Day</Text>
              </View>
            )}
          </LinearGradient>
        </View>
        )}
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
                {isRestDay ? 'Plan adaptations disabled on rest days' : 'Tired, sore, or short on time? Adapt in 1-tap.'}
              </Text>
            </View>
          </View>

          {/* 2x2 Quick Action Buttons Grid */}
          <View style={styles.adaptButtonsGrid}>
            {/* Active Walk */}
            <TouchableOpacity
              disabled={isRestDay}
              style={[
                styles.adaptOptionBtn,
                adaptedPlan === 'walk' && styles.adaptOptionBtnActive,
                isRestDay && { opacity: 0.5 },
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
              disabled={isRestDay}
              style={[
                styles.adaptOptionBtn,
                adaptedPlan === 'ease' && styles.adaptOptionBtnActive,
                isRestDay && { opacity: 0.5 },
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
              disabled={isRestDay}
              style={[
                styles.adaptOptionBtn,
                adaptedPlan === 'rest' && styles.adaptOptionBtnActive,
                isRestDay && { opacity: 0.5 },
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
              disabled={isRestDay}
              style={[
                styles.adaptOptionBtn,
                adaptedPlan === 'custom' && styles.adaptOptionBtnActive,
                isRestDay && { opacity: 0.5 },
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

      {/* Adjust Target Event & Date Modal */}
      <Modal visible={isAdjustModalOpen} transparent animationType="fade" onRequestClose={() => setIsAdjustModalOpen(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsAdjustModalOpen(false)}
        >
          <View style={styles.adjustModalCard} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adjust Target Event & Date</Text>
              <TouchableOpacity onPress={() => setIsAdjustModalOpen(false)}>
                <Ionicons name="close-circle" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Select a preset event or enter custom details to recalculate periodization.
            </Text>

            {/* Quick Presets */}
            <Text style={styles.modalInputLabel}>Quick Event Presets</Text>
            <View style={styles.eventOptionsList}>
              {EVENT_OPTIONS.map((opt, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.eventOptionCard,
                    editEventText === opt.title && styles.eventOptionCardSelected,
                  ]}
                  onPress={() => {
                    setEditEventText(opt.title);
                    setEditDateText(opt.date);
                  }}
                >
                  <View style={styles.eventOptionLeft}>
                    <View style={styles.eventOptionIconBox}>
                      <FontAwesome5 name={opt.icon} size={14} color={COLORS.primary} />
                    </View>
                    <View>
                      <Text style={styles.eventOptionTitle}>{opt.title}</Text>
                      <Text style={styles.eventOptionDate}>{opt.date} • {opt.weeks}</Text>
                    </View>
                  </View>
                  {editEventText === opt.title && (
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom Inputs */}
            <Text style={[styles.modalInputLabel, { marginTop: 8 }]}>Or Custom Event Name</Text>
            <TextInput
              style={styles.modalInput}
              value={editEventText}
              onChangeText={setEditEventText}
              placeholder="e.g. Hyrox Open, Sprint Triathlon"
              placeholderTextColor="#94a3b8"
            />

            <Text style={styles.modalInputLabel}>Target Race Date</Text>
            {Platform.OS === 'web' ? (
              <input
                type="date"
                style={{
                  width: '100%',
                  height: 44,
                  padding: '0 12px',
                  borderRadius: 12,
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  fontSize: 15,
                  color: '#0f172a',
                  marginBottom: 16,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                value={editDateText.includes('-') ? editDateText : ''}
                onChange={(e) => setEditDateText(e.target.value)}
              />
            ) : (
              <TextInput
                style={styles.modalInput}
                value={editDateText}
                onChangeText={setEditDateText}
                placeholder="e.g. 2026-11-15 or Nov 15, 2026"
                placeholderTextColor="#94a3b8"
              />
            )}

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsAdjustModalOpen(false)}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveAdjust}
              >
                <Text style={styles.modalSaveBtnText}>Save & Adapt Plan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  adjustModalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalSub: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 12,
    lineHeight: 18,
  },
  eventOptionsList: {
    gap: 8,
    marginBottom: 12,
  },
  eventOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  eventOptionCardSelected: {
    backgroundColor: '#f0fdfa',
    borderColor: COLORS.primary,
  },
  eventOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  eventOptionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#ccfbf1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventOptionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  eventOptionDate: {
    fontSize: 11,
    color: '#64748b',
  },
  modalInputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
    marginTop: 10,
  },
  modalInput: {
    height: 44,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#0f172a',
    marginBottom: 16,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  modalCancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  modalSaveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  modalSaveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#faf8ff',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  progressHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
    gap: 8,
  },
  progressTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  readyPct: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6d7a77',
  },
  progressBarRow: {
    flexDirection: 'row',
    gap: 6,
  },
  progressSegment: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#dae2fd',
  },
  segmentFilled: {
    backgroundColor: COLORS.primary,
  },
  segmentFilledActive: {
    backgroundColor: COLORS.primary,
    opacity: 0.8,
  },
  targetEventCard: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 14,
    borderWidth: 2,
    borderColor: '#eaedff',
    borderBottomWidth: 4,
    borderBottomColor: '#dae2fd',
    elevation: 2,
    gap: 10,
  },
  targetEventTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  targetEventLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  targetEventIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#89f5e7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetEventTextWrap: {
    gap: 1,
  },
  targetEventLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#6d7a77',
    letterSpacing: 0.5,
  },
  targetEventTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#131b2e',
    letterSpacing: -0.2,
  },
  targetEventDate: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6d7a77',
  },
  adjustBtn: {
    backgroundColor: '#eaedff',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  adjustBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
  },
  targetRampPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6f7ff',
    padding: 10,
    borderRadius: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#eaedff',
  },
  trendingBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#ffdbca',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rampTextWrap: {
    flex: 1,
    gap: 1,
  },
  rampHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rampWeeks: {
    fontSize: 12,
    fontWeight: '850',
    color: '#783200',
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#783200',
    opacity: 0.5,
  },
  rampLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ea580c',
  },
  rampSub: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#6d7a77',
    lineHeight: 14,
  },
  topHeader: {
    paddingHorizontal: 16,
    paddingTop: 10,
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
  monthCalendarCard: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 16,
    borderWidth: 2,
    borderColor: '#eaedff',
    borderBottomWidth: 4,
    borderBottomColor: '#dae2fd',
    elevation: 2,
  },
  monthCalendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  monthHeaderTitleWrap: {
    gap: 2,
  },
  monthNameTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#131b2e',
    letterSpacing: -0.3,
  },
  monthSubTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6d7a77',
  },
  monthStatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff0e5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffd8be',
  },
  monthStatText: {
    fontSize: 11,
    fontWeight: '850',
    color: '#ea580c',
  },
  monthDOWRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 6,
  },
  monthDOWText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '800',
    color: '#6d7a77',
    letterSpacing: 0.3,
  },
  monthWeeksContainer: {
    gap: 6,
  },
  monthWeekRow: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'space-between',
  },
  monthOtherMonthCell: {
    flex: 1,
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: '#fafbff',
    borderWidth: 1,
    borderColor: '#f0f2f8',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 6,
    opacity: 0.35,
  },
  monthOtherMonthNum: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
  },
  monthDayCell: {
    flex: 1,
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: '#f8f9ff',
    borderWidth: 1.5,
    borderColor: '#eaedff',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 2,
  },
  monthDayCellToday: {
    backgroundColor: COLORS.primary,
    borderColor: '#89f5e7',
    borderWidth: 2,
    borderBottomWidth: 3,
    borderBottomColor: '#004c44',
  },
  monthDayCellSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#f0fdfa',
    borderWidth: 2,
  },
  monthDayNum: {
    fontSize: 12,
    fontWeight: '800',
    color: '#131b2e',
  },
  monthDayNumToday: {
    color: '#ffffff',
    fontWeight: '900',
  },
  monthDayNumSelected: {
    color: COLORS.primary,
    fontWeight: '900',
  },
  monthDayDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthDayEmptyDot: {
    width: 20,
    height: 20,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#131b2e',
  },
  modalSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 16,
  },
  eventOptionsList: {
    gap: 10,
  },
  eventOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  eventOptionCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#f0fdfa',
  },
  eventOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  eventOptionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#ccfbf1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventOptionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#131b2e',
  },
  eventOptionDate: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 2,
  },
});
