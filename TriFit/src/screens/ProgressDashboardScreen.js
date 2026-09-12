import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme';

const PERSONAL_BESTS = [
  {
    id: 'run5k',
    icon: 'run-fast',
    iconFamily: 'MaterialCommunityIcons',
    iconColor: '#ea580c',
    iconBg: '#ffedd5',
    label: '5k Tempo Run',
    value: '21:30',
    improvement: '+1:45 faster',
    improvColor: '#ea580c',
    tag: 'Gold PR',
  },
  {
    id: 'sled',
    icon: 'weight-lifter',
    iconFamily: 'MaterialCommunityIcons',
    iconColor: '#9d4300',
    iconBg: '#ffdbca',
    label: 'Hyrox Sled Push',
    value: '152 kg',
    improvement: '+24 kg gain',
    improvColor: '#ea580c',
    tag: 'Strength PR',
  },
  {
    id: 'swim',
    icon: 'swim',
    iconFamily: 'MaterialCommunityIcons',
    iconColor: '#00628d',
    iconBg: '#c9e6ff',
    label: '1,000m Swim Pace',
    value: '1:38/100m',
    improvement: '-6s improvement',
    improvColor: '#0f766e',
    tag: 'Aerobic PR',
  },
  {
    id: 'vo2',
    icon: 'heart-pulse',
    iconFamily: 'MaterialCommunityIcons',
    iconColor: '#00685f',
    iconBg: '#89f5e7',
    label: 'VO\u2082 Max Est.',
    value: '54.2',
    improvement: '+4.1 pts increase',
    improvColor: '#00685f',
    tag: 'Longevity',
  },
];

const MILESTONES = [
  { emoji: '\uD83C\uDFC6', title: 'Century Club', subtitle: '100km run logged' },
  { emoji: '\u26A1', title: 'Cold Grit', subtitle: '14 cold showers' },
  { emoji: '\uD83D\uDEE1\uFE0F', title: 'Iron Tendons', subtitle: '0 missed recovery' },
  { emoji: '\uD83C\uDFAF', title: 'Sub-75 Hyrox', subtitle: 'Pacing locked' },
];

export default function ProgressDashboardScreen({ currentUser, userProfile, xp = 420, streakDays = 14 }) {
  const tierXpCap = 1000;
  const tierXp = Math.min(xp, tierXpCap);
  const tierProgress = tierXp / tierXpCap;
  const xpToNextTier = Math.max(0, tierXpCap - tierXp);

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
      {/* Sub-header */}
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

      {/* Tier Bento Card */}
      <View style={styles.tierCard}>
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
            <Text style={styles.microStatValue}>{Math.max(streakDays, 21)} Days</Text>
            <Text style={[styles.microStatSub, { color: '#ea580c' }]}>All-time best</Text>
          </View>
          <View style={[styles.microStatItem, styles.microStatCenter]}>
            <View style={styles.microStatLabel}>
              <MaterialCommunityIcons name="heart-pulse" size={13} color={COLORS.primary} />
              <Text style={styles.microStatLabelText}>Bio-Age</Text>
            </View>
            <Text style={[styles.microStatValue, { color: COLORS.primary }]}>-3.4 Yrs</Text>
            <Text style={[styles.microStatSub, { color: COLORS.primary }]}>vs Baseline</Text>
          </View>
          <View style={styles.microStatItem}>
            <View style={styles.microStatLabel}>
              <Ionicons name="flash" size={13} color="#00628d" />
              <Text style={styles.microStatLabelText}>PRs Broken</Text>
            </View>
            <Text style={styles.microStatValue}>12</Text>
            <Text style={[styles.microStatSub, { color: '#00628d' }]}>This Block</Text>
          </View>
        </View>
      </View>

      {/* New Personal Best Callout */}
      <View style={styles.newPBCard}>
        <View style={styles.newPBHeader}>
          <View style={styles.newPBTitleRow}>
            <Text style={styles.newPBEmoji}>🎉</Text>
            <Text style={styles.newPBTitle}>NEW PERSONAL BEST!</Text>
          </View>
          <View style={styles.newPBDateBadge}>
            <Text style={styles.newPBDate}>Yesterday</Text>
          </View>
        </View>
        <Text style={styles.newPBMetric}>5K Tempo Pace: 4:18 /km</Text>
        <Text style={styles.newPBImprovement}>Improved by -12s vs starting baseline (4:30 /km)</Text>
        <View style={styles.newPBTags}>
          <View style={styles.newPBTag}>
            <Ionicons name="shield-checkmark" size={13} color={COLORS.primary} />
            <Text style={styles.newPBTagText}>Joint Strain: Safe</Text>
          </View>
          <View style={styles.newPBTag}>
            <Ionicons name="checkmark-circle" size={13} color="#00628d" />
            <Text style={styles.newPBTagText}>Lactate: Balanced</Text>
          </View>
        </View>
      </View>

      {/* Personal Bests Grid */}
      <View style={styles.pbSection}>
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
              <TouchableOpacity style={styles.historyBtn} activeOpacity={0.8}>
                <Ionicons name="time-outline" size={13} color="#3d4947" />
                <Text style={styles.historyBtnText}>History</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      {/* Milestones Trophy Case */}
      <View style={styles.milestonesCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <MaterialCommunityIcons name="star-circle" size={20} color="#ea580c" />
            <Text style={styles.sectionTitle}>Unlocked Milestones</Text>
          </View>
          <Text style={[styles.sectionSubtitle, { color: COLORS.primary, fontWeight: '700' }]}>
            4 / 18 Earned
          </Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.milestonePillsRow}
        >
          {MILESTONES.map((m, idx) => (
            <View key={idx} style={styles.milestonePill}>
              <Text style={styles.milestoneEmoji}>{m.emoji}</Text>
              <View>
                <Text style={styles.milestoneTitle}>{m.title}</Text>
                <Text style={styles.milestoneSubtitle}>{m.subtitle}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

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
    paddingTop: 8,
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
});
