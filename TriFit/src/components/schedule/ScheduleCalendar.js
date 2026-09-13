import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../theme';
import { PopInView } from '../AnimatedComponents';
import { getEventIcon } from '../../utils/trainingPlanGenerator';
import styles from '../../screens/styles/TrainingScheduleScreen.styles';

export default function ScheduleCalendar({
  viewMode,
  setViewMode,
  targetRace,
  aiPlan,
  dynamicDays,
  selectedDay,
  setSelectedDay,
  monthWeeks,
  currentDate,
}) {
  const monthLabel = currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const firstWeekDay = dynamicDays[0]?.date;
  const lastWeekDay = dynamicDays[dynamicDays.length - 1]?.date;
  const monthName = currentDate.toLocaleDateString(undefined, { month: 'short' });

  return (
    <>
      {/* Title & Week/Month Switcher */}
      <PopInView delay={80}>
        <View style={styles.topHeader}>
          <View>
            <View style={styles.monthBadgeRow}>
              <Ionicons name="calendar-outline" size={13} color={COLORS.primary} />
              <Text style={styles.monthBadgeText}>{monthLabel.toUpperCase()}</Text>
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
      </PopInView>

      {/* 2. Calendar Card: Week View vs Month View */}
      {viewMode === 'week' ? (
        /* Week Horizontal Strip Calendar Card */
        <View style={styles.calendarCard}>
          <View style={styles.calendarCardHeader}>
            <View style={styles.weekThemeRow}>
              <MaterialCommunityIcons
                name={getEventIcon(targetRace) === 'dumbbell' ? 'dumbbell' : 'lightning-bolt'}
                size={18}
                color={COLORS.primary}
              />
              <Text
                style={styles.weekThemeText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                Week 1 • {aiPlan?.weeks?.[0]?.focus || 'Aerobic Base'}
              </Text>
            </View>
            <View style={styles.weekDateBadge}>
              <Text style={styles.weekDateRange}>{monthName} {firstWeekDay} – {monthName} {lastWeekDay}</Text>
            </View>
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
              <Text style={styles.monthNameTitle}>{monthLabel}</Text>
              <Text style={styles.monthSubTitle}>18-Week Periodized Plan</Text>
            </View>
            <View style={styles.monthStatBadge}>
              <Ionicons name="flame" size={14} color="#ea580c" />
              <Text style={styles.monthStatText}>{currentDate.getDate()} Days</Text>
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
    </>
  );
}
