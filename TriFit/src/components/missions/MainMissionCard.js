import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PopInView, BouncyButton } from '../AnimatedComponents';
import styles from '../../screens/styles/DailyMissionsScreen.styles';

export default function MainMissionCard({
  workoutTheme,
  todayWorkout,
  cleanDesc,
  onNavigateToSchedule,
  isEventCompleted,
  isTodaySelected,
  selectedDay,
  handleStartWorkout,
  onSelectDay,
}) {
  return (
    <PopInView delay={170}>
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
        <BouncyButton
          style={styles.clickableDescriptionBox}
          onPress={onNavigateToSchedule}
          shakeOnPress={false}
        >
          <View style={styles.descTextRow}>
            <Text style={styles.highlightText} numberOfLines={2} ellipsizeMode="tail">
              {cleanDesc}
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#0f766e" style={{ marginLeft: 4 }} />
          </View>
        </BouncyButton>

        {/* Chunky Vibrant CTA (Hidden on Rest Days unless completed, locked on non-today days) */}
        {workoutTheme.isRest ? (
          isEventCompleted ? (
            <View style={[styles.disabledPastBtn, { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0', marginTop: 4 }]}>
              <Ionicons name="checkmark-circle" size={16} color="#059669" style={{ marginRight: 6 }} />
              <Text style={[styles.disabledPastText, { color: '#065f46', fontWeight: '700' }]}>
                Rest Day Logged • Done
              </Text>
            </View>
          ) : null
        ) : isTodaySelected ? (
          isEventCompleted ? (
            <View style={[styles.disabledPastBtn, { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0', marginTop: 4 }]}>
              <Ionicons name="checkmark-circle" size={18} color="#059669" style={{ marginRight: 6 }} />
              <Text style={[styles.disabledPastText, { color: '#065f46', fontWeight: '700' }]}>
                Session Completed Today • +120 XP
              </Text>
            </View>
          ) : (
            <BouncyButton
              onPress={handleStartWorkout}
              shakeOnPress={true}
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
            </BouncyButton>
          )
        ) : selectedDay < 12 ? (
          isEventCompleted ? (
            <View style={styles.disabledPastBtn}>
              <Ionicons name="checkmark-circle" size={16} color="#059669" style={{ marginRight: 6 }} />
              <Text style={styles.disabledPastText}>Session Completed (Day {selectedDay})</Text>
            </View>
          ) : (
            <View style={[styles.disabledPastBtn, { backgroundColor: '#f1f5f9', borderColor: '#cbd5e1' }]}>
              <Ionicons name="time-outline" size={16} color="#64748b" style={{ marginRight: 6 }} />
              <Text style={[styles.disabledPastText, { color: '#64748b' }]}>
                Past Session (Day {selectedDay}) • Not Logged
              </Text>
            </View>
          )
        ) : (
          <View style={{ gap: 8, marginTop: 4 }}>
            <View style={styles.disabledFutureBtn}>
              <Ionicons name="lock-closed" size={16} color="#64748b" style={{ marginRight: 6 }} />
              <Text style={styles.disabledFutureText}>Scheduled for Day {selectedDay} • Locked</Text>
            </View>
            <TouchableOpacity
              style={styles.jumpTodaySecondaryBtn}
              onPress={() => onSelectDay && onSelectDay(12)}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-undo" size={13} color="#00685f" style={{ marginRight: 5 }} />
              <Text style={styles.jumpTodaySecondaryText}>Switch to Today to Start Workout</Text>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
    </PopInView>
  );
}
