import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme';

export default function OnboardingScreen({ onCompletePlan }) {
  const [selectedRace, setSelectedRace] = useState('hyrox');
  const [selectedFreq, setSelectedFreq] = useState('3-4');
  const [targetDate, setTargetDate] = useState('November 15, 2025');

  const races = [
    {
      id: 'hyrox',
      title: 'Hyrox Open / Pro',
      subtitle: 'Functional strength + running blend',
      pill: 'Metabolic boost & power',
      icon: 'dumbbell',
      iconFamily: 'FontAwesome5',
      colors: ['#89f5e7', '#6bd8cb', '#46cdbe'],
      border: '#00685f',
      textColor: '#00201d',
    },
    {
      id: 'triathlon',
      title: 'Sprint / Olympic Triathlon',
      subtitle: 'Swim, bike, run for joint health',
      pill: 'Zero-impact joint conditioning',
      icon: 'water',
      iconFamily: 'Ionicons',
      colors: ['#f0f9ff', '#e0f2fe'],
      border: '#38bdf8',
      textColor: '#131b2e',
      iconBg: '#0ea5e9',
    },
    {
      id: 'ironman',
      title: 'Half / Full Ironman 70.3',
      subtitle: 'Long-range stamina & cellular energy',
      pill: 'Peak endurance capacity',
      icon: 'bicycle',
      iconFamily: 'Ionicons',
      colors: ['#fff7ed', '#ffedd5'],
      border: '#fb923c',
      textColor: '#131b2e',
      iconBg: '#f97316',
    },
    {
      id: 'longevity',
      title: 'Custom Longevity Base',
      subtitle: 'Pure Zone 2 aerobic vitality',
      pill: 'Healthspan & metabolic health',
      icon: 'heart',
      iconFamily: 'Ionicons',
      colors: ['#faf5ff', '#f3e8ff'],
      border: '#c084fc',
      textColor: '#131b2e',
      iconBg: '#8b5cf6',
    },
  ];

  const handleLockIn = () => {
    Alert.alert(
      'Plan Calibrated! 🎉',
      `Your custom ${selectedRace.toUpperCase()} training plan has been generated with Coach Maya!`,
      [{ text: 'View Missions', onPress: () => onCompletePlan() }]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Progress Header */}
      <View style={styles.progressHeader}>
        <View style={styles.progressTopRow}>
          <View style={styles.stepBadge}>
            <Ionicons name="sparkles" size={14} color={COLORS.primary} />
            <Text style={styles.stepText}>Step 2 of 4: Your Target Race</Text>
          </View>
          <Text style={styles.readyPct}>50% ready</Text>
        </View>

        {/* 4 Segmented Progress Bar */}
        <View style={styles.progressBarRow}>
          <View style={[styles.progressSegment, styles.segmentFilled]} />
          <View style={[styles.progressSegment, styles.segmentFilledActive]} />
          <View style={styles.progressSegment} />
          <View style={styles.progressSegment} />
        </View>
      </View>

      {/* Motivational Title & Subhead */}
      <View style={styles.titleSection}>
        <Text style={styles.mainTitle}>What adventure are we conquering together?</Text>
        <Text style={styles.subTitle}>Build endurance, one joyful habit at a time.</Text>
      </View>

      {/* Race Selector Cards */}
      <View style={styles.raceList}>
        {races.map((race) => {
          const isSelected = selectedRace === race.id;
          return (
            <TouchableOpacity
              key={race.id}
              activeOpacity={0.85}
              onPress={() => setSelectedRace(race.id)}
            >
              <LinearGradient
                colors={isSelected ? ['#89f5e7', '#6bd8cb', '#46cdbe'] : race.colors}
                style={[
                  styles.raceCard,
                  isSelected && styles.raceCardSelected,
                  { borderColor: isSelected ? '#00685f' : 'rgba(0,0,0,0.06)' },
                ]}
              >
                <View style={styles.cardMain}>
                  <View style={styles.cardHeaderRow}>
                    <View
                      style={[
                        styles.iconBox,
                        { backgroundColor: race.iconBg || COLORS.primary },
                      ]}
                    >
                      {race.iconFamily === 'FontAwesome5' ? (
                        <FontAwesome5 name={race.icon} size={20} color="#ffffff" />
                      ) : (
                        <Ionicons name={race.icon} size={22} color="#ffffff" />
                      )}
                    </View>

                    <View style={styles.cardTextWrap}>
                      <View style={styles.cardTitleRow}>
                        <Text
                          style={[
                            styles.raceTitle,
                            isSelected && styles.raceTitleSelected,
                          ]}
                        >
                          {race.title}
                        </Text>
                        {isSelected && (
                          <View style={styles.checkBadge}>
                            <Ionicons name="checkmark" size={12} color="#ffffff" />
                          </View>
                        )}
                      </View>
                      <Text style={styles.raceSubtitle}>{race.subtitle}</Text>
                    </View>
                  </View>
                </View>

                {/* Pill bottom tag */}
                <View style={styles.pillTag}>
                  <Ionicons name="flash" size={12} color={COLORS.primary} />
                  <Text style={styles.pillTagText}>{race.pill}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Race Date & Timeline Picker Card */}
      <View style={styles.dateCard}>
        <View style={styles.dateTopRow}>
          <View style={styles.dateLeft}>
            <View style={styles.calendarIconBox}>
              <Ionicons name="calendar" size={20} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.dateLabel}>TARGET EVENT DATE</Text>
              <Text style={styles.dateValue}>{targetDate}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.adjustBtn}
            onPress={() =>
              setTargetDate((prev) =>
                prev.includes('November') ? 'December 10, 2025' : 'November 15, 2025'
              )
            }
          >
            <Text style={styles.adjustBtnText}>Adjust</Text>
          </TouchableOpacity>
        </View>

        {/* Timeline Ramp Pill */}
        <View style={styles.rampPill}>
          <View style={styles.trendingBox}>
            <Ionicons name="trending-up" size={18} color="#783200" />
          </View>
          <View style={styles.rampTextWrap}>
            <View style={styles.rampHeaderRow}>
              <Text style={styles.rampWeeks}>18 Weeks Away</Text>
              <View style={styles.dotSeparator} />
              <Text style={styles.rampLabel}>Optimal Ramp</Text>
            </View>
            <Text style={styles.rampSub}>
              Ample buffer to adapt tendons and elevate VO2 max gradually!
            </Text>
          </View>
        </View>
      </View>

      {/* Baseline Frequency Section */}
      <View style={styles.freqSection}>
        <Text style={styles.freqTitle}>How many days a week feels fun right now?</Text>
        <Text style={styles.freqSub}>
          We adapt workouts to your calendar, not the other way around.
        </Text>

        <View style={styles.freqGrid}>
          {/* 2-3 */}
          <TouchableOpacity
            style={[
              styles.freqBtn,
              selectedFreq === '2-3' && styles.freqBtnSelected,
            ]}
            onPress={() => setSelectedFreq('2-3')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.freqNum,
                selectedFreq === '2-3' && styles.freqNumSelected,
              ]}
            >
              2-3
            </Text>
            <Text style={styles.freqTag}>Gentle 🍃</Text>
          </TouchableOpacity>

          {/* 3-4 */}
          <TouchableOpacity
            style={[
              styles.freqBtn,
              selectedFreq === '3-4' && styles.freqBtnSelectedActive,
            ]}
            onPress={() => setSelectedFreq('3-4')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.freqNum,
                selectedFreq === '3-4' && styles.freqNumSelectedActive,
              ]}
            >
              3-4 ⭐️
            </Text>
            <Text
              style={[
                styles.freqTag,
                selectedFreq === '3-4' && styles.freqTagSelectedActive,
              ]}
            >
              Sweet Spot
            </Text>
          </TouchableOpacity>

          {/* 5+ */}
          <TouchableOpacity
            style={[
              styles.freqBtn,
              selectedFreq === '5+' && styles.freqBtnSelected,
            ]}
            onPress={() => setSelectedFreq('5+')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.freqNum,
                selectedFreq === '5+' && styles.freqNumSelected,
              ]}
            >
              5+
            </Text>
            <Text style={styles.freqTag}>Crush ⚡️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Coach Maya Warm Callout */}
      <View style={styles.mayaCalloutContainer}>
        <View style={styles.mayaAvatarRow}>
          <Image
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCAEsNjseeGCE734scFcz96x_HWKdSap5jgR_AYgkz_inJm0s80m7TjPdEAvjo4YSRSXNDCaHnvRdniP6v37kUaaO7pCO-098Goo8frI962Ert8mG3L4xfu60RkRm-eItgMuAufHEAL4xqJWYCYgQKUv9PtHah6rUmXZ9SIc8aMqM09OKVwKbRVI3gGMKOt1rABwPVLAF1JK1lRWRqgF1CSSqhq-27SjIoVbVAJfr9L8bF7qcJjS8Dp',
            }}
            style={styles.mayaCalloutAvatar}
          />
          <View style={styles.mayaCalloutNameTag}>
            <Text style={styles.mayaCalloutName}>Coach Maya</Text>
          </View>
        </View>

        <View style={styles.mayaBubbleCard}>
          <Text style={styles.mayaSpeechText}>
            “I'll balance your load so you never burn out. Train strong, stay injury-free, and have fun!”
          </Text>
          <View style={styles.pacingRow}>
            <View style={styles.greenPing} />
            <Text style={styles.pacingText}>Personalized pacing activated</Text>
          </View>
        </View>
      </View>

      {/* Tactical CTA Button */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity style={styles.ctaBtn} onPress={handleLockIn} activeOpacity={0.85}>
          <LinearGradient
            colors={['#00685f', '#008378', '#0ea5e9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaText}>Lock It In & Build My Plan</Text>
            <Ionicons name="sparkles" size={20} color="#89f5e7" />
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.guaranteeRow}>
          <Ionicons name="shield-checkmark" size={16} color={COLORS.primary} />
          <Text style={styles.guaranteeText}>100% science-backed aerobic programming</Text>
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
  progressHeader: {
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
    color: COLORS.outline,
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
  titleSection: {
    gap: 6,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.onSurface,
    letterSpacing: -0.5,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.onSurfaceVariant,
  },
  raceList: {
    gap: 12,
  },
  raceCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 2,
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  raceCardSelected: {
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  cardMain: {
    gap: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTextWrap: {
    flex: 1,
    gap: 2,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  raceTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  raceTitleSelected: {
    color: '#00201d',
  },
  checkBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  raceSubtitle: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    fontWeight: '500',
  },
  pillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pillTagText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  dateCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  dateTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  calendarIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#89f5e7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.outline,
    letterSpacing: 0.5,
  },
  dateValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  adjustBtn: {
    backgroundColor: '#eaedff',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  adjustBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  rampPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f3ff',
    padding: 12,
    borderRadius: 14,
    gap: 10,
  },
  trendingBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#ffdbca',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rampTextWrap: {
    flex: 1,
    gap: 2,
  },
  rampHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rampWeeks: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#9d4300',
  },
  rampLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9d4300',
  },
  rampSub: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    fontWeight: '500',
  },
  freqSection: {
    gap: 10,
  },
  freqTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  freqSub: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  freqGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  freqBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    gap: 4,
  },
  freqBtnSelected: {
    borderColor: '#38bdf8',
    backgroundColor: '#e0f2fe',
  },
  freqBtnSelectedActive: {
    borderColor: '#008378',
    backgroundColor: COLORS.primary,
  },
  freqNum: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.onSurface,
  },
  freqNumSelected: {
    color: '#0369a1',
  },
  freqNumSelectedActive: {
    color: '#ffffff',
  },
  freqTag: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.outline,
  },
  freqTagSelectedActive: {
    color: '#89f5e7',
  },
  mayaCalloutContainer: {
    position: 'relative',
    marginTop: 10,
  },
  mayaAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: -12,
    zIndex: 1,
    paddingLeft: 12,
  },
  mayaCalloutAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  mayaCalloutNameTag: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mayaCalloutName: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.primary,
  },
  mayaBubbleCard: {
    backgroundColor: 'rgba(137, 245, 231, 0.35)',
    borderRadius: 20,
    padding: 16,
    paddingTop: 20,
    gap: 8,
  },
  mayaSpeechText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  pacingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greenPing: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  pacingText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
  },
  ctaContainer: {
    gap: 10,
    marginTop: 10,
  },
  ctaBtn: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  ctaGradient: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '900',
  },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  guaranteeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
  },
});
