import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../theme';
import { PopInView } from '../AnimatedComponents';
import { getEventIcon, calculateWeeksAway } from '../../utils/trainingPlanGenerator';
import styles from '../../screens/styles/TrainingScheduleScreen.styles';

export default function RaceCountdownBanner({
  targetRace,
  targetDate,
  handleOpenAdjustModal,
}) {
  return (
    <PopInView delay={0}>
      <View style={styles.targetEventCard}>
        <View style={styles.targetEventTopRow}>
          <View style={styles.targetEventLeft}>
            <View style={styles.targetEventIconBox}>
              <FontAwesome5 name={getEventIcon(targetRace)} size={16} color={COLORS.primary} />
            </View>
            <View style={styles.targetEventTextWrap}>
              <Text style={styles.targetEventLabel}>TARGET EVENT</Text>
              <Text style={styles.targetEventTitle}>{targetRace}</Text>
              <Text style={styles.targetEventDate}>{targetDate}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.adjustBtn}
            onPress={handleOpenAdjustModal}
            activeOpacity={0.8}
          >
            <Text style={styles.adjustBtnText}>Adjust</Text>
          </TouchableOpacity>
        </View>

        {/* Timeline Ramp Pill */}
        <View style={styles.targetRampPill}>
          <View style={styles.trendingBox}>
            <Ionicons name="trending-up" size={16} color="#783200" />
          </View>
          <View style={styles.rampTextWrap}>
            <View style={styles.rampHeaderRow}>
              <Text style={styles.rampWeeks}>{calculateWeeksAway(targetDate)}</Text>
              <View style={styles.dotSeparator} />
              <Text style={styles.rampLabel}>Optimal Ramp</Text>
            </View>
            <Text style={styles.rampSub}>
              Ample buffer to adapt tendons and elevate VO2 max gradually!
            </Text>
          </View>
        </View>
      </View>
    </PopInView>
  );
}
