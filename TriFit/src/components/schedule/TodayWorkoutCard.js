import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../theme';
import { BouncyButton } from '../AnimatedComponents';
import styles from '../../screens/styles/TrainingScheduleScreen.styles';

export default function TodayWorkoutCard({
  isLoading,
  isTodaySelected,
  selectedDay,
  todayDay,
  cardTheme,
  activeIcon,
  selectedDayData,
  activeWorkoutType,
  adaptedPlan,
  getScheduleTags,
  handleToggleComplete,
  isRestDay,
  onStartWorkout,
  setSelectedDay,
}) {
  return (
    <View style={styles.todaySection}>
      <View style={styles.todayHeaderRow}>
        <View style={styles.todayTitleLeft}>
          {isTodaySelected && <View style={styles.livePing} />}
          <Text style={styles.todaySectionTitle}>
            {isTodaySelected ? 'What to do today' : `Scheduled for Day ${selectedDay}`}
          </Text>
        </View>
        <View style={[styles.todayPill, !isTodaySelected && { backgroundColor: '#f1f5f9' }]}>
          <Text style={[styles.todayPillText, !isTodaySelected && { color: '#64748b' }]}>
            {isTodaySelected ? `Day ${todayDay} • Today` : `Day ${selectedDay} • Scheduled`}
          </Text>
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
                {activeIcon === 'walk' ? (
                  <MaterialCommunityIcons name="walk" size={28} color={cardTheme.iconColor} />
                ) : activeIcon === 'bed' || activeIcon === 'spa' ? (
                  <MaterialCommunityIcons name="bed" size={28} color={cardTheme.iconColor} />
                ) : selectedDayData.iconType === 'ion' ? (
                  <Ionicons name={selectedDayData.icon} size={28} color={cardTheme.iconColor} />
                ) : (
                  <MaterialCommunityIcons name={selectedDayData.icon || 'run'} size={28} color={cardTheme.iconColor} />
                )}
              </View>
              <View style={styles.workoutTextWrap}>
                <Text style={styles.workoutTitle}>
                  {activeWorkoutType || 'Zone 2 Aerobic & Form Drills'}
                </Text>
                <Text style={styles.workoutSubtitle}>
                  {adaptedPlan && isTodaySelected
                    ? (adaptedPlan === 'walk'
                        ? 'Gentle outdoor walk to keep tendons supple'
                        : adaptedPlan === 'ease'
                        ? 'Dialed back 30% intensity for fresh legs'
                        : 'Sleep, hydrate, and let mitochondria rebuild')
                    : (selectedDayData.aiDescription || 'Steady rhythmic breathing + cadence builds')}
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
            {isTodaySelected ? (
              selectedDayData?.isCompleted ? (
                <View style={{ width: '100%' }}>
                  <View style={[styles.startWorkoutBtn, { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0', borderWidth: 1 }]}>
                    <Ionicons name="checkmark-circle" size={20} color="#059669" />
                    <Text style={[styles.startWorkoutBtnText, { color: '#065f46' }]}>
                      Completed Today • +120 XP
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={{ alignSelf: 'center', marginTop: 8, paddingVertical: 4, paddingHorizontal: 12 }}
                    onPress={() => handleToggleComplete(false, todayDay)}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 12, color: '#64748b', textDecorationLine: 'underline' }}>
                      Undo completion
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : !isRestDay ? (
                <View style={{ width: '100%', gap: 8 }}>
                  <BouncyButton
                    style={[styles.startWorkoutBtn, { backgroundColor: cardTheme.btnBg, borderBottomColor: cardTheme.btnBorder }]}
                    onPress={onStartWorkout}
                    shakeOnPress={true}
                  >
                    <Ionicons name="play" size={20} color="#ffffff" />
                    <Text style={styles.startWorkoutBtnText}>Start Today's Workout</Text>
                  </BouncyButton>
                  <TouchableOpacity
                    style={[styles.startWorkoutBtn, { backgroundColor: 'rgba(255, 255, 255, 0.88)', borderWidth: 1, borderColor: cardTheme.btnBorder }]}
                    onPress={() => handleToggleComplete(true, todayDay)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="checkmark-done" size={18} color={cardTheme.btnBg} />
                    <Text style={[styles.startWorkoutBtnText, { color: cardTheme.btnBg }]}>Mark as Done (+120 XP)</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ width: '100%', gap: 8 }}>
                  <View style={[styles.startWorkoutBtn, { backgroundColor: 'rgba(255, 255, 255, 0.4)', borderWidth: 1, borderColor: '#99f6e4' }]}>
                    <Ionicons name="bed" size={20} color="#0f766e" />
                    <Text style={[styles.startWorkoutBtnText, { color: '#0f766e' }]}>Rest &amp; Recovery Day</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.startWorkoutBtn, { backgroundColor: 'rgba(255, 255, 255, 0.88)', borderWidth: 1, borderColor: '#0f766e' }]}
                    onPress={() => handleToggleComplete(true, todayDay)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="checkmark-done" size={18} color="#0f766e" />
                    <Text style={[styles.startWorkoutBtnText, { color: '#0f766e' }]}>Mark Rest Day as Done</Text>
                  </TouchableOpacity>
                </View>
              )
            ) : selectedDay < todayDay ? (
              selectedDayData?.isCompleted ? (
                <View style={{ width: '100%' }}>
                  <View style={[styles.startWorkoutBtn, styles.disabledPastBtn]}>
                    <Ionicons name="checkmark-circle" size={20} color="#059669" />
                    <Text style={styles.disabledPastBtnText}>Session Completed (Day {selectedDay})</Text>
                  </View>
                  <TouchableOpacity
                    style={{ alignSelf: 'center', marginTop: 8, paddingVertical: 4, paddingHorizontal: 12 }}
                    onPress={() => handleToggleComplete(false, selectedDay)}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 12, color: '#64748b', textDecorationLine: 'underline' }}>
                      Undo completion
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ width: '100%' }}>
                  <View style={[styles.startWorkoutBtn, { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#cbd5e1' }]}>
                    <Ionicons name="time-outline" size={18} color="#64748b" />
                    <Text style={[styles.startWorkoutBtnText, { color: '#475569' }]}>
                      Past Session (Day {selectedDay}) • Not Logged
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={{ alignSelf: 'center', marginTop: 8, paddingVertical: 4, paddingHorizontal: 12 }}
                    onPress={() => handleToggleComplete(true, selectedDay)}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 12, color: COLORS.primary, fontWeight: '700' }}>
                      + Mark as Completed Retroactively
                    </Text>
                  </TouchableOpacity>
                </View>
              )
            ) : (
              <View style={styles.lockedBtnContainer}>
                <View style={[styles.startWorkoutBtn, styles.disabledFutureBtn]}>
                  <Ionicons name="lock-closed" size={18} color="#475569" />
                  <Text style={styles.disabledFutureBtnText}>Scheduled for Day {selectedDay} • Locked</Text>
                </View>
                <TouchableOpacity
                  style={styles.jumpToTodayBtn}
                  onPress={() => setSelectedDay(todayDay)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="calendar" size={14} color={COLORS.primary} />
                  <Text style={styles.jumpToTodayBtnText}>Switch to Today to Start Workout</Text>
                </TouchableOpacity>
              </View>
            )}
          </LinearGradient>
        </View>
      )}
    </View>
  );
}
