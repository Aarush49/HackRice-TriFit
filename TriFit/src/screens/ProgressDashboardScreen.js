import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme';
import { computeBioAge } from '../bioAge';
import { PopInView, ScrollPopView, BouncyButton } from '../components/AnimatedComponents';

const PERSONAL_BESTS = [
  {
    id: 'run5k',
    icon: 'run-fast',
    iconFamily: 'MaterialCommunityIcons',
    iconColor: '#ea580c',
    iconBg: '#ffedd5',
    label: '5k Tempo Run',
    value: '--:--',
    improvement: 'No PR logged yet',
    improvColor: '#64748b',
    tag: 'Unset',
  },
  {
    id: 'sled',
    icon: 'weight-lifter',
    iconFamily: 'MaterialCommunityIcons',
    iconColor: '#9d4300',
    iconBg: '#ffdbca',
    label: 'Hyrox Sled Push',
    value: '-- kg',
    improvement: 'No PR logged yet',
    improvColor: '#64748b',
    tag: 'Unset',
  },
  {
    id: 'swim',
    icon: 'swim',
    iconFamily: 'MaterialCommunityIcons',
    iconColor: '#00628d',
    iconBg: '#c9e6ff',
    label: '1,000m Swim Pace',
    value: '--:--',
    improvement: 'No PR logged yet',
    improvColor: '#64748b',
    tag: 'Unset',
  },
  {
    id: 'vo2',
    icon: 'heart-pulse',
    iconFamily: 'MaterialCommunityIcons',
    iconColor: '#00685f',
    iconBg: '#89f5e7',
    label: 'VO₂ Max Est.',
    value: '--',
    improvement: 'No PR logged yet',
    improvColor: '#64748b',
    tag: 'Unset',
  },
];

const ALL_MILESTONES = [
  { id: 1, emoji: '🏆', title: 'Century Club', subtitle: '100km run logged', req: '0 / 100 km' },
  { id: 2, emoji: '⚡', title: 'Cold Grit', subtitle: '14 cold showers', req: '0 / 14 sessions' },
  { id: 3, emoji: '🛡️', title: 'Iron Tendons', subtitle: '0 missed recovery', req: '0 / 10 days' },
  { id: 4, emoji: '🎯', title: 'Sub-75 Hyrox', subtitle: 'Pacing locked', req: '0 / 75 min target' },
  { id: 5, emoji: '🫀', title: 'VO₂ Pioneer', subtitle: 'Hit 55+ VO₂ Max', req: '0 / 55 ml/kg/min' },
  { id: 6, emoji: '🏋️‍♂️', title: 'Sled Destroyer', subtitle: 'Push 150kg sled 50m', req: '0 / 150 kg' },
  { id: 7, emoji: '🚴‍♂️', title: 'Iron Lung', subtitle: '2h Zone 2 ride', req: '0 / 120 min' },
  { id: 8, emoji: '💧', title: 'Hydration Master', subtitle: '3L water for 7 days', req: '0 / 7 days' },
  { id: 9, emoji: '🌅', title: 'Early Riser', subtitle: '5 AM workout sessions', req: '0 / 5 sessions' },
  { id: 10, emoji: '🏊‍♂️', title: 'Triathlon Titan', subtitle: 'Swim, Bike & Run in 1 week', req: '0 / 3 sports' },
  { id: 11, emoji: '⏱️', title: 'Fast Finisher', subtitle: 'Negative split 10k', req: '0 / 1 run' },
  { id: 12, emoji: '🔥', title: 'Streak Savage', subtitle: '30-day workout streak', req: '0 / 30 days' },
  { id: 13, emoji: '⚡', title: 'Metabolic Machine', subtitle: 'Burn 15,000 active kcal', req: '0 / 15,000 kcal' },
  { id: 14, emoji: '🧠', title: 'Coach Maya Pupil', subtitle: '20 AI check-ins', req: '0 / 20 check-ins' },
  { id: 15, emoji: '📈', title: 'Lactate Master', subtitle: '40m threshold run', req: '0 / 40 min' },
  { id: 16, emoji: '🧘', title: 'Mobility Guru', subtitle: '10 mobility routines', req: '0 / 10 sessions' },
  { id: 17, emoji: '🎯', title: 'Pacing Pro', subtitle: 'Finish within 2% target pace', req: '0 / 1 race' },
  { id: 18, emoji: '👑', title: 'TriFit Legend', subtitle: 'Reach Level 10 Rank', req: '0 / Level 10' },
];

export default function ProgressDashboardScreen({ currentUser, userProfile, xp = 420, streakDays = 14 }) {
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const tierXpCap = 1000;
  const tierXp = Math.min(xp, tierXpCap);
  const tierProgress = tierXp / tierXpCap;
  const xpToNextTier = Math.max(0, tierXpCap - tierXp);

  const { biologicalAge, bioAgeAdj, bioAgeTagText } = computeBioAge(userProfile);

  const getTierName = (x) => {
    if (x >= 1000) return 'Platinum Tier';
    if (x >= 750) return 'Gold Tier';
    if (x >= 400) return 'Silver Tier';
    return 'Bronze Tier';
  };
  const getNextTierName = (x) => {
    if (x >= 1000) return 'Max Tier';
    if (x >= 750) return 'Platinum Tier';
    if (x >= 400) return 'Gold Tier';
    return 'Silver Tier';
  };

  const currentTier = getTierName(xp);
  const nextTier = getNextTierName(xp);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Sub-header & Title Block */}
      <PopInView delay={0}>
        <View style={styles.subHeader}>
          <View style={styles.pillRow}>
            <View style={styles.programPill}>
              <MaterialCommunityIcons name="weight-lifter" size={13} color="#9d4300" />
              <Text style={styles.programPillText}>HYROX BUILD</Text>
            </View>
            <View style={styles.levelPill}>
              <Text style={styles.levelPillText}>Level 7 Athlete</Text>
            </View>
          </View>
          <View style={styles.trackBadge}>
            <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} />
            <Text style={styles.trackBadgeText}>Self-Paced Track</Text>
          </View>
        </View>

        {/* Screen Title */}
        <View style={styles.titleBlock}>
          <Text style={styles.screenTitle}>Your Progress</Text>
          <Text style={styles.screenSubtitle}>
            Compete only with yesterday's self. Consistency over ego.
          </Text>
        </View>
      </PopInView>

      {/* Tier Bento Card */}
      <PopInView delay={100} style={styles.tierCard}>
        <View style={styles.tierTopRow}>
          {/* Shield Badge */}
          <View style={styles.shieldOuter}>
            <View style={styles.shieldInner}>
              <MaterialCommunityIcons name="shield-star" size={30} color="#89f5e7" />
              <Text style={styles.shieldLabel}>GOLD TIER</Text>
            </View>
          </View>

          {/* Tier Details */}
          <View style={styles.tierDetails}>
            <View style={styles.tierDetailHeader}>
              <Text style={styles.tierStatusLabel}>Tier Status</Text>
              <Text style={styles.tierXpText}>{tierXp} / {tierXpCap} XP</Text>
            </View>
            <Text style={styles.tierName}>{currentTier} • Consistency Engine</Text>
            <Text style={styles.tierUnlocks} numberOfLines={1}>
              Unlocks: Advanced Lactate Threshold Simulations
            </Text>
            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: `${Math.round(tierProgress * 100)}%` }]} />
              </View>
              <View style={styles.progressBarLabels}>
                <Text style={styles.progressBarLeft}>{Math.round(tierProgress * 100)}% to {nextTier}</Text>
                <Text style={styles.progressBarRight}>{xpToNextTier} XP to level up</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 3-Column Micro Stats */}
        <View style={styles.microStats}>
          <View style={styles.microStatItem}>
            <View style={styles.microStatLabel}>
              <MaterialCommunityIcons name="fire" size={13} color="#ea580c" />
              <Text style={styles.microStatLabelText}>Streak PR</Text>
            </View>
            <Text style={styles.microStatValue}>{streakDays} Days</Text>
            <Text style={[styles.microStatSub, { color: '#ea580c' }]}>All-time best</Text>
          </View>
          <View style={[styles.microStatItem, styles.microStatCenter]}>
            <View style={styles.microStatLabel}>
              <MaterialCommunityIcons name="heart-pulse" size={13} color={COLORS.primary} />
              <Text style={styles.microStatLabelText}>Bio-Age</Text>
            </View>
            <Text style={[styles.microStatValue, { color: COLORS.primary }]}>{biologicalAge} yrs</Text>
            <Text style={[styles.microStatSub, { color: COLORS.primary }]}>{bioAgeTagText}</Text>
          </View>
          <View style={styles.microStatItem}>
            <View style={styles.microStatLabel}>
              <Ionicons name="flash" size={13} color="#00628d" />
              <Text style={styles.microStatLabelText}>PRs Broken</Text>
            </View>
            <Text style={styles.microStatValue}>0</Text>
            <Text style={[styles.microStatSub, { color: '#00628d' }]}>This Block</Text>
          </View>
        </View>
      </PopInView>

      {/* New Personal Best Callout */}
      <PopInView delay={180} style={styles.newPBCard}>
        <View style={styles.newPBHeader}>
          <View style={styles.newPBTitleRow}>
            <Text style={styles.newPBEmoji}>🎯</Text>
            <Text style={styles.newPBTitle}>BENCHMARK YOUR PRs</Text>
          </View>
          <View style={styles.newPBDateBadge}>
            <Text style={styles.newPBDate}>Get Started</Text>
          </View>
        </View>
        <Text style={styles.newPBMetric}>Ready to log your first activity?</Text>
        <Text style={styles.newPBImprovement}>Complete your daily mission or sync your wearables to log personal bests!</Text>
        <View style={styles.newPBTags}>
          <View style={styles.newPBTag}>
            <Ionicons name="shield-checkmark" size={13} color={COLORS.primary} />
            <Text style={styles.newPBTagText}>Tendon Shield Active</Text>
          </View>
          <View style={styles.newPBTag}>
            <Ionicons name="checkmark-circle" size={13} color="#00628d" />
            <Text style={styles.newPBTagText}>Pacing Guard On</Text>
          </View>
        </View>
      </PopInView>

      {/* Personal Bests Grid */}
      <ScrollPopView delay={100} style={styles.pbSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <MaterialCommunityIcons name="trophy" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Personal Bests (All-Time)</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Self-Benchmarked</Text>
        </View>
        <View style={styles.pbGrid}>
          {PERSONAL_BESTS.map((pb) => (
            <View key={pb.id} style={styles.pbCard}>
              <View style={styles.pbCardTop}>
                <View style={[styles.pbIconCircle, { backgroundColor: pb.iconBg }]}>
                  <MaterialCommunityIcons name={pb.icon} size={16} color={pb.iconColor} />
                </View>
                <View style={styles.pbTagBadge}>
                  <Text style={styles.pbTagText}>{pb.tag}</Text>
                </View>
              </View>
              <Text style={styles.pbLabel}>{pb.label}</Text>
              <Text style={styles.pbValue}>{pb.value}</Text>
              <Text style={[styles.pbImprovement, { color: pb.improvColor }]}>{pb.improvement}</Text>
              <BouncyButton style={styles.historyBtn} shakeOnPress={false}>
                <Ionicons name="time-outline" size={13} color="#3d4947" />
                <Text style={styles.historyBtnText}>History</Text>
              </BouncyButton>
            </View>
          ))}
        </View>
      </ScrollPopView>

      {/* Milestones Trophy Case */}
      <ScrollPopView delay={140} style={styles.milestonesCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <MaterialCommunityIcons name="star-circle-outline" size={18} color="#64748b" />
            <Text style={styles.sectionTitle}>Unlocked Milestones</Text>
            <View style={styles.zeroEarnedBadge}>
              <Text style={styles.zeroEarnedBadgeText}>0/18</Text>
            </View>
          </View>
          <BouncyButton
            style={styles.seeAllMilestonesLink}
            onPress={() => setIsMilestoneModalOpen(true)}
            shakeOnPress={false}
          >
            <Text style={styles.seeAllMilestonesLinkText}>See all ›</Text>
          </BouncyButton>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.milestonePillsRow}
        >
          {ALL_MILESTONES.slice(0, 4).map((m) => (
            <View key={m.id} style={styles.lockedMilestonePill}>
              <View style={styles.lockedEmojiWrapper}>
                <Text style={styles.lockedMilestoneEmoji}>{m.emoji}</Text>
                <View style={styles.padlockBadge}>
                  <Ionicons name="lock-closed" size={9} color="#ffffff" />
                </View>
              </View>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={styles.lockedMilestoneTitle}>{m.title}</Text>
                  <Text style={styles.lockedTag}>Locked</Text>
                </View>
                <Text style={styles.lockedMilestoneSubtitle}>{m.subtitle}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </ScrollPopView>

      {/* Unclaimed Milestones Modal */}
      <Modal
        visible={isMilestoneModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsMilestoneModalOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsMilestoneModalOpen(false)}
        >
          <View style={styles.milestonesModalCard} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MaterialCommunityIcons name="trophy-outline" size={22} color="#64748b" />
                <View>
                  <Text style={styles.modalHeaderTitle}>All Milestones (0/18 Earned)</Text>
                  <Text style={styles.modalHeaderSub}>All 18 trophies currently unclaimed</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setIsMilestoneModalOpen(false)}
              >
                <Ionicons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 460 }} showsVerticalScrollIndicator={false}>
              <View style={styles.milestonesModalList}>
                {ALL_MILESTONES.map((m) => (
                  <View key={m.id} style={styles.modalMilestoneCard}>
                    <View style={styles.modalMilestoneLeft}>
                      <View style={styles.modalMilestoneEmojiWrap}>
                        <Text style={styles.modalMilestoneEmoji}>{m.emoji}</Text>
                        <View style={styles.modalLockBadge}>
                          <Ionicons name="lock-closed" size={9} color="#ffffff" />
                        </View>
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Text style={styles.modalMilestoneTitle}>{m.title}</Text>
                          <View style={styles.modalUnclaimedBadge}>
                            <Text style={styles.modalUnclaimedText}>{m.req}</Text>
                          </View>
                        </View>
                        <Text style={styles.modalMilestoneSub}>{m.subtitle}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.closeMilestonesBtn}
              onPress={() => setIsMilestoneModalOpen(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.closeMilestonesBtnText}>Close Milestones</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Mindset Quote */}
      <View style={styles.quoteCard}>
        <Text style={styles.quoteText}>
          "Your only rival is who you were before you laced up."
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf8ff',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 32,
    gap: 14,
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  programPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffdbca',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  programPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9d4300',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  levelPill: {
    backgroundColor: '#e2e7ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  levelPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#3d4947',
    letterSpacing: 0.5,
  },
  trackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  trackBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  titleBlock: {
    gap: 2,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#131b2e',
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: 13,
    color: '#3d4947',
    lineHeight: 18,
  },
  tierCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
  },
  tierTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  shieldOuter: {
    width: 76,
    height: 76,
    borderRadius: 16,
    backgroundColor: '#ffdbca',
    padding: 4,
    shadowColor: '#005049',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    elevation: 4,
    flexShrink: 0,
  },
  shieldInner: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#008378',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  shieldLabel: {
    fontSize: 7,
    fontWeight: '900',
    color: '#89f5e7',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  tierDetails: {
    flex: 1,
    gap: 2,
  },
  tierDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tierStatusLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9d4300',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tierXpText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
  },
  tierName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#131b2e',
    marginTop: 2,
  },
  tierUnlocks: {
    fontSize: 12,
    color: '#3d4947',
    marginTop: 1,
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#e2e7ff',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },
  progressBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  progressBarLeft: {
    fontSize: 10,
    color: '#3d4947',
    fontWeight: '500',
  },
  progressBarRight: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '700',
  },
  microStats: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eaedff',
    paddingTop: 12,
    gap: 4,
  },
  microStatItem: {
    flex: 1,
    backgroundColor: '#f2f3ff',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  microStatCenter: {
    marginHorizontal: 4,
  },
  microStatLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 4,
  },
  microStatLabelText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#3d4947',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  microStatValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#131b2e',
  },
  microStatSub: {
    fontSize: 9,
    fontWeight: '700',
    color: '#3d4947',
    marginTop: 2,
  },
  newPBCard: {
    backgroundColor: '#ffedd5',
    borderRadius: 14,
    padding: 16,
    gap: 6,
  },
  newPBHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newPBTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  newPBEmoji: {
    fontSize: 14,
  },
  newPBTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#9d4300',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  newPBDateBadge: {
    backgroundColor: '#9d4300',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  newPBDate: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  newPBMetric: {
    fontSize: 18,
    fontWeight: '800',
    color: '#131b2e',
    letterSpacing: -0.3,
  },
  newPBImprovement: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9d4300',
  },
  newPBTags: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  newPBTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  newPBTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3d4947',
  },
  pbSection: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#131b2e',
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#3d4947',
  },
  pbGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pbCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    width: '47.5%',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  pbCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  pbIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pbTagBadge: {
    backgroundColor: '#eaedff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  pbTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#3d4947',
  },
  pbLabel: {
    fontSize: 12,
    color: '#3d4947',
    fontWeight: '500',
  },
  pbValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#131b2e',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  pbImprovement: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#eaedff',
    borderRadius: 999,
    paddingVertical: 6,
    marginTop: 8,
  },
  historyBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3d4947',
  },
  milestonesCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  milestonePillsRow: {
    gap: 8,
    paddingRight: 4,
  },
  milestonePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f2f3ff',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexShrink: 0,
  },
  milestoneEmoji: {
    fontSize: 16,
  },
  milestoneTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#131b2e',
  },
  milestoneSubtitle: {
    fontSize: 10,
    color: '#3d4947',
    fontWeight: '400',
  },
  quoteCard: {
    backgroundColor: '#f2f3ff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  quoteText: {
    fontSize: 13,
    color: '#3d4947',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
  },
  zeroEarnedBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginLeft: 4,
  },
  zeroEarnedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
  },
  seeAllMilestonesLink: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  seeAllMilestonesLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00685f',
  },
  lockedMilestonePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexShrink: 0,
  },
  lockedEmojiWrapper: {
    position: 'relative',
  },
  lockedMilestoneEmoji: {
    fontSize: 18,
    opacity: 0.45,
  },
  padlockBadge: {
    position: 'absolute',
    bottom: -2,
    right: -4,
    backgroundColor: '#64748b',
    borderRadius: 6,
    padding: 2,
  },
  lockedMilestoneTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
  },
  lockedTag: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94a3b8',
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  lockedMilestoneSubtitle: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  milestonesModalCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalHeaderTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0f172a',
  },
  modalHeaderSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestonesModalList: {
    gap: 10,
  },
  modalMilestoneCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  modalMilestoneLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalMilestoneEmojiWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  modalMilestoneEmoji: {
    fontSize: 20,
    opacity: 0.45,
  },
  modalLockBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#475569',
    borderRadius: 6,
    padding: 2,
  },
  modalMilestoneTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
  },
  modalMilestoneSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  modalUnclaimedBadge: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  modalUnclaimedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
  },
  closeMilestonesBtn: {
    backgroundColor: '#00685f',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  closeMilestonesBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
});
