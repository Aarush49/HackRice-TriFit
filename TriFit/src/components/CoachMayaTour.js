import React, { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';

const coachMayaAvatar = require('../../assets/coach_maya.png');

const TOUR_STEPS = [
  {
    tab: 'today',
    icon: 'home-outline',
    eyebrow: 'YOUR DAILY HOME',
    title: 'Start with Today',
    body: 'Your daily mission, readiness, and habits live here. Complete the featured workout to build XP and your streak.',
  },
  {
    tab: 'recovery',
    icon: 'heart-outline',
    eyebrow: 'RECOVER & REFUEL',
    title: 'Use Recovery to recharge',
    body: 'Track calories and macros, log meals, and open recipe cards for ingredients and step-by-step preparation.',
  },
  {
    tab: 'progress',
    icon: 'trophy-outline',
    eyebrow: 'SEE YOUR MOMENTUM',
    title: 'Watch Progress build',
    body: 'Your XP tier, personal bests, biological age, and milestones update as you complete training.',
  },
  {
    tab: 'schedule',
    icon: 'calendar-outline',
    eyebrow: 'YOUR TRAINING PLAN',
    title: 'Plan with Schedule',
    body: 'Preview upcoming sessions, adjust your target event, and open each day for workout details.',
  },
  {
    tab: null,
    icon: 'chatbubbles-outline',
    eyebrow: 'YOUR AI COACH',
    title: 'I’m always one tap away',
    body: 'Tap Coach in the bottom bar whenever you want help with training, pacing, recovery, or nutrition.',
  },
];

export default function CoachMayaTour({ visible, athleteName, onNavigate, onFinish }) {
  const [stepIndex, setStepIndex] = useState(0);
  const step = TOUR_STEPS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === TOUR_STEPS.length - 1;

  useEffect(() => {
    if (visible) setStepIndex(0);
  }, [visible]);

  useEffect(() => {
    if (visible && step?.tab) onNavigate(step.tab);
  }, [visible, stepIndex]);

  const goBack = () => {
    if (!isFirst) setStepIndex((current) => current - 1);
  };

  const goForward = () => {
    if (isLast) {
      onFinish();
      return;
    }
    setStepIndex((current) => current + 1);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={onFinish}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.coachRow}>
              <Image source={coachMayaAvatar} style={styles.avatar} />
              <View>
                <Text style={styles.coachName}>Coach Maya</Text>
                <Text style={styles.stepCount}>Quick tour · {stepIndex + 1} of {TOUR_STEPS.length}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onFinish}
              style={styles.skipButton}
              accessibilityRole="button"
              accessibilityLabel="Skip app tour"
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </View>

          {isFirst && (
            <Text style={styles.welcomeText}>Welcome, {athleteName || 'Athlete'}!</Text>
          )}

          <View style={styles.messageRow}>
            <View style={styles.iconCircle}>
              <Ionicons name={step.icon} size={24} color={COLORS.primary} />
            </View>
            <View style={styles.messageCopy}>
              <Text style={styles.eyebrow}>{step.eyebrow}</Text>
              <Text style={styles.title}>{step.title}</Text>
              <Text style={styles.body}>{step.body}</Text>
            </View>
          </View>

          <View style={styles.footerRow}>
            <View style={styles.dotsRow}>
              {TOUR_STEPS.map((_, index) => (
                <View
                  key={index}
                  style={[styles.dot, index === stepIndex && styles.activeDot]}
                />
              ))}
            </View>

            <View style={styles.actionsRow}>
              {!isFirst && (
                <TouchableOpacity onPress={goBack} style={styles.backButton} accessibilityRole="button">
                  <Ionicons name="chevron-back" size={17} color={COLORS.primary} />
                  <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={goForward} style={styles.nextButton} accessibilityRole="button">
                <Text style={styles.nextText}>{isLast ? 'Start exploring' : 'Next'}</Text>
                <Ionicons name={isLast ? 'checkmark' : 'chevron-forward'} size={17} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.48)',
    paddingHorizontal: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 18,
  },
  card: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 18,
    gap: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  coachRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#89f5e7',
  },
  coachName: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.onSurface,
  },
  stepCount: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  skipButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primary,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d8fff8',
  },
  messageCopy: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    color: COLORS.primary,
  },
  title: {
    marginTop: 3,
    fontSize: 19,
    fontWeight: '900',
    color: COLORS.onSurface,
  },
  body: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.onSurfaceVariant,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#cbd5e1',
  },
  activeDot: {
    width: 18,
    backgroundColor: COLORS.primary,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  backText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 42,
    paddingHorizontal: 15,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
  },
  nextText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#ffffff',
  },
});
