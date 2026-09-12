import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme';

export default function LongevityDashboardScreen({ onOpenCoach, xp, setXp }) {
  const [boostClaimed, setBoostClaimed] = useState(false);

  const handleBoostKarma = () => {
    if (!boostClaimed) {
      setXp((prev) => prev + 50);
      setBoostClaimed(true);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Welcoming Longevity Capsule */}
      <View style={styles.topCapsule}>
        <View style={styles.capsuleLeft}>
          <View style={styles.capsuleIconBox}>
            <MaterialCommunityIcons name="heart-pulse" size={22} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.capsuleTitle}>Longevity Engine</Text>
            <Text style={styles.capsuleSub}>Cellular & Vitals Profile</Text>
          </View>
        </View>
        <View style={styles.calibratedBadge}>
          <View style={styles.greenPing} />
          <Text style={styles.calibratedText}>CALIBRATED</Text>
        </View>
      </View>

      {/* Hero Card: Fitness Age Gauge */}
      <View style={styles.heroGaugeCard}>
        <View style={styles.optimalBadge}>
          <Ionicons name="checkmark-seal" size={16} color="#ffffff" />
          <Text style={styles.optimalBadgeText}>Optimal Longevity Zone</Text>
        </View>

        {/* Circular SVG Gauge */}
        <View style={styles.gaugeWrap}>
          <Svg width={200} height={200} viewBox="0 0 200 200">
            {/* Background Track */}
            <Circle cx="100" cy="100" r="82" stroke="#eaedff" strokeWidth="16" fill="none" />
            {/* Emerald Progress Arc */}
            <Circle
              cx="100"
              cy="100"
              r="82"
              stroke="#10b981"
              strokeWidth="16"
              strokeDasharray="515"
              strokeDashoffset="130"
              strokeLinecap="round"
              fill="none"
              rotation="-90"
              origin="100, 100"
            />
            {/* Orange Accent Arc */}
            <Circle
              cx="100"
              cy="100"
              r="82"
              stroke="#f97316"
              strokeWidth="16"
              strokeDasharray="515"
              strokeDashoffset="340"
              strokeLinecap="round"
              fill="none"
              rotation="-90"
              origin="100, 100"
            />
          </Svg>

          {/* Center Gauge Text Overlay */}
          <View style={styles.gaugeCenterText}>
            <Text style={styles.gaugeLabel}>FITNESS AGE</Text>
            <View style={styles.ageNumRow}>
              <Text style={styles.ageNum}>27</Text>
              <Text style={styles.ageUnit}>yo</Text>
            </View>
            <View style={styles.youngerBadge}>
              <Text style={styles.youngerBadgeText}>-7 Years Younger! ✨</Text>
            </View>
          </View>
        </View>

        {/* Age Context Strip */}
        <View style={styles.contextStrip}>
          <View style={styles.contextItem}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.tertiary} />
            <Text style={styles.contextText}>
              Chronological: <Text style={styles.contextBold}>34 yrs</Text>
            </Text>
          </View>
          <View style={styles.dotSep} />
          <View style={styles.contextItem}>
            <Ionicons name="pulse" size={14} color={COLORS.primary} />
            <Text style={styles.contextText}>
              Resilience: <Text style={styles.primaryBold}>Top 8%</Text>
            </Text>
          </View>
        </View>

        <Text style={styles.heroSubText}>
          Cardiovascular resilience peaking with optimal Zone 2 stimulus.
        </Text>

        {/* Tactile Button */}
        <TouchableOpacity
          style={[styles.boostBtn, boostClaimed && styles.boostBtnClaimed]}
          onPress={handleBoostKarma}
          activeOpacity={0.8}
        >
          <Ionicons
            name={boostClaimed ? 'checkmark-circle' : 'party-popper'}
            size={18}
            color="#ffffff"
          />
          <Text style={styles.boostBtnText}>
            {boostClaimed ? '50 XP Claimed! Keep Flowing' : 'Boost Daily Karma +50 XP'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Coach Maya Longevity Whisper */}
      <View style={styles.mayaWhisperCard}>
        <Image
          source={{
            uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCNF6DrCWxMm5Lv1YkzwT2KVsurMoDrkDXgPAkoqmIC1Hcawc03Tu0S4b5z4t8OxsjsvqazCQkgNUKUOPKGxly21xtC-gahcc4q0ouhxWImTdz35f8wcCPy33ybK6REvfjcZkTPtS-r0yOcaRp1m6dt7AfXcD3D_RYh4JqLpuD0NRX4Jl0NKoPHuUkL8fTyeFOi6PSebBb2Ipdg5QMjLrHtCuiA_P2bFXg5n9nXK_yZ3L8lkwLSiWrj',
          }}
          style={styles.whisperAvatar}
        />
        <View style={styles.whisperContent}>
          <View style={styles.whisperHeader}>
            <Text style={styles.whisperName}>Coach Maya</Text>
            <Text style={styles.whisperBadge}>Physiology Insight</Text>
          </View>
          <Text style={styles.whisperText}>
            “Tomorrow's 45 min run will lock in your lowest resting HR. Keep it breezy! 👟”
          </Text>
        </View>
      </View>

      {/* Visual Training Load Sweet Spot */}
      <View style={styles.sweetSpotCard}>
        <View style={styles.sweetSpotHeader}>
          <View style={styles.sweetSpotTitleRow}>
            <View style={styles.balanceIconBox}>
              <MaterialCommunityIcons name="scale-balance" size={18} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.sweetSpotTitle}>Weekly Sweet Spot</Text>
              <Text style={styles.sweetSpotSub}>Adaptive stimulus without burnout</Text>
            </View>
          </View>
          <View style={styles.optimumPill}>
            <Text style={styles.optimumPillText}>82% Optimum</Text>
          </View>
        </View>

        {/* Multi-Zone Load Bar */}
        <View style={styles.loadBarContainer}>
          <View style={styles.loadBarTrack}>
            <View style={[styles.loadSegment, { width: '30%', backgroundColor: '#38bdf8' }]} />
            <View
              style={[
                styles.loadSegment,
                { width: '45%', backgroundColor: '#10b981', position: 'relative' },
              ]}
            >
              <View style={styles.youAreHereDot} />
            </View>
            <View style={[styles.loadSegment, { width: '25%', backgroundColor: '#f97316' }]} />
          </View>
          <View style={styles.loadLabelsRow}>
            <Text style={styles.loadLabelText}>Recovery</Text>
            <Text style={styles.hereText}>🎯 You are here (82%)</Text>
            <Text style={styles.loadLabelText}>Overreach</Text>
          </View>
        </View>

        {/* Safety Micro Banner */}
        <View style={styles.safetyBanner}>
          <Ionicons name="shield-checkmark" size={22} color="#059669" />
          <View style={styles.safetyTextWrap}>
            <Text style={styles.safetyTitle}>Joints & Tendons: Green Zone</Text>
            <Text style={styles.safetySub}>
              Zero fatigue risk. <Text style={styles.boldText}>45 min capacity</Text> remaining
              this week.
            </Text>
          </View>
        </View>
      </View>

      {/* Longevity Pillar Mix (2x2 Grid) */}
      <View style={styles.pillarSection}>
        <View style={styles.pillarHeader}>
          <View>
            <Text style={styles.pillarTitle}>Longevity Pillar Mix</Text>
            <Text style={styles.pillarSub}>All 4 movement pillars active</Text>
          </View>
          <View style={styles.totalHoursBadge}>
            <Text style={styles.totalHoursText}>Total 6.8 hrs</Text>
          </View>
        </View>

        <View style={styles.pillarGrid}>
          {/* Running */}
          <View style={[styles.pillarCard, { borderColor: '#ffedd5' }]}>
            <View style={styles.pillarCardTop}>
              <View style={[styles.pillarIconBox, { backgroundColor: '#ea580c' }]}>
                <FontAwesome5 name="running" size={16} color="#ffffff" />
              </View>
              <Text style={[styles.pillarPct, { color: '#c2410c' }]}>35%</Text>
            </View>
            <View style={styles.pillarTextWrap}>
              <Text style={styles.pillarName}>Running</Text>
              <Text style={[styles.pillarTag, { color: '#ea580c' }]}>Aerobic Base</Text>
              <Text style={styles.pillarNote}>Solid base! 🏃</Text>
            </View>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: '85%', backgroundColor: '#ff6b4a' }]} />
            </View>
          </View>

          {/* Cycling */}
          <View style={[styles.pillarCard, { borderColor: '#e0f2fe' }]}>
            <View style={styles.pillarCardTop}>
              <View style={[styles.pillarIconBox, { backgroundColor: '#0ea5e9' }]}>
                <Ionicons name="bicycle" size={18} color="#ffffff" />
              </View>
              <Text style={[styles.pillarPct, { color: '#0369a1' }]}>25%</Text>
            </View>
            <View style={styles.pillarTextWrap}>
              <Text style={styles.pillarName}>Cycling</Text>
              <Text style={[styles.pillarTag, { color: '#0284c7' }]}>Low-Impact</Text>
              <Text style={styles.pillarNote}>Protects knees 🚴</Text>
            </View>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: '70%', backgroundColor: '#0ea5e9' }]} />
            </View>
          </View>

          {/* Swimming */}
          <View style={[styles.pillarCard, { borderColor: '#cffafe' }]}>
            <View style={styles.pillarCardTop}>
              <View style={[styles.pillarIconBox, { backgroundColor: '#06b6d4' }]}>
                <Ionicons name="water" size={18} color="#ffffff" />
              </View>
              <Text style={[styles.pillarPct, { color: '#0e7490' }]}>15%</Text>
            </View>
            <View style={styles.pillarTextWrap}>
              <Text style={styles.pillarName}>Swimming</Text>
              <Text style={[styles.pillarTag, { color: '#0891b2' }]}>Lung Vitality</Text>
              <Text style={styles.pillarNote}>Clear airway! 🏊</Text>
            </View>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: '45%', backgroundColor: '#06b6d4' }]} />
            </View>
          </View>

          {/* Hyrox Strength */}
          <View style={[styles.pillarCard, { borderColor: '#f3e8ff' }]}>
            <View style={styles.pillarCardTop}>
              <View style={[styles.pillarIconBox, { backgroundColor: '#a855f7' }]}>
                <FontAwesome5 name="dumbbell" size={16} color="#ffffff" />
              </View>
              <Text style={[styles.pillarPct, { color: '#7e22ce' }]}>25%</Text>
            </View>
            <View style={styles.pillarTextWrap}>
              <Text style={styles.pillarName}>Hyrox Strength</Text>
              <Text style={[styles.pillarTag, { color: '#9333ea' }]}>Bone & Grip</Text>
              <Text style={styles.pillarNote}>Density boost! 🏋️</Text>
            </View>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: '90%', backgroundColor: '#a855f7' }]} />
            </View>
          </View>
        </View>
      </View>

      {/* Visual Story Card: Mitochondrial Resilience */}
      <View style={styles.storyCard}>
        <View style={styles.storyHeader}>
          <Text style={styles.storyTitle}>Cellular Adaptation</Text>
          <View style={styles.powerPill}>
            <Text style={styles.powerPillText}>Zone-2 Power</Text>
          </View>
        </View>

        <View style={styles.storyImageWrap}>
          <Image
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBMI3MLpVkHDd4JmkFm8ods0jCun-9rkWtPB-bWLpzxXgKhNEXYUYecHPgh-1wmDX9-TalRrxD0ZadfCDZ-dyWYbGlics2-NnCcf5cDfBZFqJi3ICdwE2eDopJAJGlOp_ic0oau0ON0RC6tds-e1UaM6EjvUtxkOHsNJtsfgbMeHMcpfrxPXvCHA_6nmAAsbLk3NJqSiTui_tgE9ZJ3HtH3Uovke3d-s5sur4h89I2u6kECuDH56ILq',
            }}
            style={styles.storyImage}
          />
          <LinearGradient
            colors={['transparent', 'rgba(19, 27, 46, 0.85)']}
            style={styles.storyGradientOverlay}
          >
            <Text style={styles.storyOverlayText}>
              Daily Zone-2 base runs protect telomeres and boost mitochondrial volume.
            </Text>
          </LinearGradient>
        </View>
      </View>

      {/* Longevity Trophies */}
      <View style={styles.trophySection}>
        <View style={styles.trophyHeader}>
          <Text style={styles.trophyTitle}>Longevity Trophies</Text>
          <View style={styles.unlockedBadge}>
            <Text style={styles.unlockedText}>2 New Unlocked</Text>
          </View>
        </View>

        <View style={styles.trophyCard}>
          <View style={[styles.trophyIconWrap, { backgroundColor: '#10b981' }]}>
            <MaterialCommunityIcons name="battery-charging-high" size={24} color="#ffffff" />
          </View>
          <View style={styles.trophyContent}>
            <View style={styles.trophyTopRow}>
              <Text style={styles.trophyName}>Mitochondrial Engine III</Text>
              <Text style={[styles.unlockedTag, { backgroundColor: '#059669' }]}>Unlocked ⚡</Text>
            </View>
            <Text style={styles.trophySub}>+4.2 weekly healthspan hours earned.</Text>
          </View>
        </View>

        <View style={styles.trophyCard}>
          <View style={[styles.trophyIconWrap, { backgroundColor: '#f97316' }]}>
            <Ionicons name="heart" size={24} color="#ffffff" />
          </View>
          <View style={styles.trophyContent}>
            <View style={styles.trophyTopRow}>
              <Text style={styles.trophyName}>Heart Rate Drop: -24 bpm</Text>
              <Text style={[styles.unlockedTag, { backgroundColor: '#ea580c' }]}>Top 10% 🔥</Text>
            </View>
            <Text style={styles.trophySub}>Rapid 1-min vagal tone recovery confirmed.</Text>
          </View>
        </View>
      </View>

      {/* Scientific Credibility Banner */}
      <View style={styles.credibilityBanner}>
        <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
        <View style={styles.credTextWrap}>
          <Text style={styles.credTitle}>Exercise Physiology Verified</Text>
          <Text style={styles.credSub}>
            Physiology verified via real-time HRV, VO₂ max drift, and resting metrics.
          </Text>
        </View>
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
  topCapsule: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  capsuleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  capsuleIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#89f5e7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  capsuleTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  capsuleSub: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    fontWeight: '500',
  },
  calibratedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 104, 95, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  greenPing: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  calibratedText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.primary,
  },
  heroGaugeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  optimalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 16,
    marginBottom: 10,
  },
  optimalBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  gaugeWrap: {
    position: 'relative',
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  gaugeCenterText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.onSurfaceVariant,
    letterSpacing: 0.5,
  },
  ageNumRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  ageNum: {
    fontSize: 52,
    fontWeight: '900',
    color: '#059669',
  },
  ageUnit: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
  },
  youngerBadge: {
    backgroundColor: '#f97316',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 2,
  },
  youngerBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
  },
  contextStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  contextItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contextText: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  contextBold: {
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  primaryBold: {
    fontWeight: '900',
    color: COLORS.primary,
  },
  dotSep: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#cbd5e1',
  },
  heroSubText: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  boostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.secondaryContainer,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 16,
    elevation: 2,
  },
  boostBtnClaimed: {
    backgroundColor: COLORS.primary,
  },
  boostBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  mayaWhisperCard: {
    backgroundColor: '#f2f3ff',
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  whisperAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  whisperContent: {
    flex: 1,
    gap: 4,
  },
  whisperHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  whisperName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  whisperBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
  },
  whisperText: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    lineHeight: 18,
    fontWeight: '500',
  },
  sweetSpotCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    gap: 14,
    elevation: 2,
  },
  sweetSpotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sweetSpotTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  balanceIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#89f5e7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sweetSpotTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  sweetSpotSub: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  optimumPill: {
    backgroundColor: '#89f5e7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  optimumPillText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#00201d',
  },
  loadBarContainer: {
    gap: 6,
  },
  loadBarTrack: {
    height: 18,
    backgroundColor: '#eaedff',
    borderRadius: 10,
    flexDirection: 'row',
    overflow: 'hidden',
    padding: 2,
  },
  loadSegment: {
    height: '100%',
    borderRadius: 8,
  },
  youAreHereDot: {
    position: 'absolute',
    right: 4,
    top: 3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  loadLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  loadLabelText: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    fontWeight: '600',
  },
  hereText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.primary,
  },
  safetyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 12,
    borderRadius: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  safetyTextWrap: {
    flex: 1,
  },
  safetyTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065f46',
  },
  safetySub: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  boldText: {
    fontWeight: '900',
    color: COLORS.onSurface,
  },
  pillarSection: {
    gap: 12,
  },
  pillarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pillarTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.onSurface,
  },
  pillarSub: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  totalHoursBadge: {
    backgroundColor: 'rgba(0, 104, 95, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  totalHoursText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  pillarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pillarCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    justifyContent: 'space-between',
    gap: 10,
  },
  pillarCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pillarIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillarPct: {
    fontSize: 16,
    fontWeight: '900',
  },
  pillarTextWrap: {
    gap: 2,
  },
  pillarName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  pillarTag: {
    fontSize: 12,
    fontWeight: '700',
  },
  pillarNote: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  progressBg: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  storyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    gap: 12,
  },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  powerPill: {
    backgroundColor: '#89f5e7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  powerPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00201d',
  },
  storyImageWrap: {
    position: 'relative',
    height: 140,
    borderRadius: 18,
    overflow: 'hidden',
  },
  storyImage: {
    width: '100%',
    height: '100%',
  },
  storyGradientOverlay: {
    position: 'absolute',
    inset: 0,
    justifyContent: 'flex-end',
    padding: 12,
  },
  storyOverlayText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  trophySection: {
    gap: 12,
  },
  trophyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trophyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.onSurface,
  },
  unlockedBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  unlockedText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065f46',
  },
  trophyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  trophyIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trophyContent: {
    flex: 1,
    gap: 2,
  },
  trophyTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trophyName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  unlockedTag: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  trophySub: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  credibilityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f3ff',
    padding: 14,
    borderRadius: 18,
    gap: 10,
  },
  credTextWrap: {
    flex: 1,
  },
  credTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  credSub: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
});
