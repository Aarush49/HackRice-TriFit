import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollPopView, BouncyButton } from '../AnimatedComponents';
import styles from '../../screens/styles/DailyMissionsScreen.styles';

export default function HabitsGrid({
  completedHabits,
  toggleHabit,
  wearableData,
  isStepsDone,
  isSyncing,
  handleSyncWearables,
}) {
  return (
    <ScrollPopView delay={120} style={styles.habitsSection}>
      <View style={styles.habitsHeader}>
        <Text style={styles.habitsTitle}>DAILY HABITS &amp; SIDE QUESTS</Text>
        <Text style={styles.habitsSub}>+90 XP remaining</Text>
      </View>

      <View style={styles.habitsGrid}>
        {/* Habit Card 1: Cold Shower */}
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

          <BouncyButton
            onPress={() => toggleHabit('habit_1', 20)}
            shakeOnPress={true}
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
          </BouncyButton>
        </View>

        {/* Habit Card 2: Steps */}
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

          <BouncyButton
            onPress={handleSyncWearables}
            shakeOnPress={true}
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
          </BouncyButton>
        </View>

        {/* Habit Card 3: Hydration */}
        <View style={styles.habitCard}>
          <View style={styles.habitContent}>
            <View style={styles.habitTopRow}>
              <View style={[styles.habitIconBox, { backgroundColor: '#e0f2fe' }]}>
                <Ionicons name="water" size={15} color="#0284c7" />
              </View>
              <View style={styles.habitXpBadge}>
                <Text style={styles.habitXpText}>+15 XP</Text>
              </View>
            </View>

            <Text style={styles.habitCardTitle}>3L Hydration</Text>
            <Text style={styles.habitCardSub}>Electrolytes &amp; Minerals</Text>
          </View>

          <BouncyButton
            onPress={() => toggleHabit('habit_3', 15)}
            shakeOnPress={true}
            style={[
              styles.habitActionBtn,
              completedHabits['habit_3'] && styles.habitActionBtnActive,
            ]}
          >
            <Ionicons
              name={completedHabits['habit_3'] ? 'checkmark-circle' : 'add'}
              size={13}
              color={completedHabits['habit_3'] ? '#15803d' : '#0284c7'}
            />
            <Text
              style={[
                styles.habitActionText,
                completedHabits['habit_3'] && { color: '#15803d' },
              ]}
            >
              {completedHabits['habit_3'] ? 'Completed' : 'Done'}
            </Text>
          </BouncyButton>
        </View>

        {/* Habit Card 4: Mobility */}
        <View style={styles.habitCard}>
          <View style={styles.habitContent}>
            <View style={styles.habitTopRow}>
              <View style={[styles.habitIconBox, { backgroundColor: '#f3e8ff' }]}>
                <MaterialCommunityIcons name="spa" size={15} color="#7c3aed" />
              </View>
              <View style={styles.habitXpBadge}>
                <Text style={styles.habitXpText}>+25 XP</Text>
              </View>
            </View>

            <Text style={styles.habitCardTitle}>Post-Run Mobility</Text>
            <Text style={styles.habitCardSub}>10m Foam Roll &amp; Stretch</Text>
          </View>

          <BouncyButton
            onPress={() => toggleHabit('habit_4', 25)}
            shakeOnPress={true}
            style={[
              styles.habitActionBtn,
              completedHabits['habit_4'] && styles.habitActionBtnActive,
            ]}
          >
            <Ionicons
              name={completedHabits['habit_4'] ? 'checkmark-circle' : 'add'}
              size={13}
              color={completedHabits['habit_4'] ? '#15803d' : '#7c3aed'}
            />
            <Text
              style={[
                styles.habitActionText,
                completedHabits['habit_4'] && { color: '#15803d' },
              ]}
            >
              {completedHabits['habit_4'] ? 'Completed' : 'Done'}
            </Text>
          </BouncyButton>
        </View>
      </View>
    </ScrollPopView>
  );
}
