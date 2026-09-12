import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme';

export default function DailyMissionsScreen({ onStartRun, onOpenCoach, xp, setXp }) {
  const [audioGuideEnabled, setAudioGuideEnabled] = useState(true);
  const [mobilityCompleted, setMobilityCompleted] = useState(true);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Greeting & Race Countdown Banner */}
      <View style={styles.greetingSection}>
        <View style={styles.titleRow}>
          <Ionicons name="sunny" size={26} color="#f59e0b" />
          <Text style={styles.greetingText}>
            Day 14 <Text style={styles.orangeDot}>•</Text> Zone In!
          </Text>
        </View>

        <LinearGradient
          colors={['#e0f2fe', '#ecfeff', '#fef3c7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.raceCard}
        >
          <View style={styles.raceLeft}>
            <Ionicons name="timer" size={20} color="#0284c7" />
            <Text style={styles.raceTitle}>London Hyrox Open</Text>
          </View>
          <LinearGradient
            colors={['#ea580c', '#f97316']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.daysLeftBadge}
          >
            <Text style={styles.daysLeftText}>68D LEFT</Text>
            <Ionicons name="flag" size={12} color="#ffffff" />
          </LinearGradient>
        </LinearGradient>
      </View>

      {/* Today's Missions Section */}
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

          {/* Toggle & Start Button */}
          <View style={styles.questControls}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                <Ionicons name="mic-outline" size={18} color="#0d9488" />
                <Text style={styles.toggleText}>Maya Audio Guide</Text>
              </View>
              <Switch
                value={audioGuideEnabled}
                onValueChange={setAudioGuideEnabled}
                trackColor={{ false: '#cbd5e1', true: '#10b981' }}
                thumbColor="#ffffff"
              />
            </View>

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

      {/* Daily Consistency & Streak Tracker */}
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

      {/* Maya Encouragement Banner */}
      <View style={styles.encouragementBanner}>
        <Ionicons name="heart" size={20} color="#10b981" />
        <Text style={styles.encouragementText}>
          Speed is built on easy miles. Enjoy it, Alex! 🏃💨
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
    gap: 20,
  },
  greetingSection: {
    gap: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.onSurface,
    letterSpacing: -0.5,
  },
  orangeDot: {
    color: '#f97316',
  },
  raceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(186, 230, 253, 0.6)',
  },
  raceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  raceTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  daysLeftBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  daysLeftText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
  },
  mayaCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(110, 231, 183, 0.6)',
    elevation: 3,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  mayaGradient: {
    padding: 16,
    gap: 12,
  },
  mayaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mayaProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrap: {
    position: 'relative',
  },
  mayaAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#10b981',
  },
  boltDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mayaNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mayaName: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.onSurface,
  },
  tunedPill: {
    backgroundColor: '#06b6d4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  tunedText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  shieldText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0d9488',
    marginTop: 2,
  },
  speechBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(167, 243, 208, 0.6)',
  },
  speechText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.onSurface,
    lineHeight: 20,
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
  streakSection: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    gap: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
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
