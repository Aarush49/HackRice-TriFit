import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { PopInView } from '../AnimatedComponents';
import styles from '../../screens/styles/DailyMissionsScreen.styles';

export default function ReadinessCard({
  wearableData,
  completedHabits,
}) {
  return (
    <PopInView delay={90} style={styles.readinessCard}>
      <View style={styles.readinessTopRow}>
        {/* Circular Gauge */}
        <View style={styles.gaugeContainer}>
          <View style={styles.svgRingWrapper}>
            <Svg width={56} height={56} viewBox="0 0 48 48">
              <Circle
                cx="24"
                cy="24"
                r="20"
                stroke="#f1f5f9"
                strokeWidth="4.5"
                fill="none"
              />
              <Circle
                cx="24"
                cy="24"
                r="20"
                stroke="#008378"
                strokeWidth="4.5"
                strokeDasharray="125.66"
                strokeDashoffset={125.66 * (1 - Math.min(100, Math.max(0, wearableData.readiness_score || 0)) / 100)}
                strokeLinecap="round"
                fill="none"
                transform="rotate(-90 24 24)"
              />
            </Svg>
            <View style={styles.gaugeInnerLabel}>
              <Text style={styles.gaugePercent}>{wearableData.readiness_score}%</Text>
              <Text style={styles.gaugeStatus}>
                {wearableData.readiness_score >= 80 ? 'READY' : 'RECOVER'}
              </Text>
            </View>
          </View>

          <View style={styles.readinessInfo}>
            <View style={styles.stateTitleRow}>
              <Text style={styles.stateTitle}>
                {wearableData.readiness_score >= 80 ? 'Optimum State' : 'Recovery Focus'}
              </Text>
            </View>
            <View style={styles.metricPillsRow}>
              <View style={styles.metricPillGreen}>
                <Ionicons name="heart" size={11} color="#15803d" />
                <Text style={styles.metricPillGreenText}>HRV {wearableData.hrv_ms ?? 0}ms</Text>
              </View>
              <View style={styles.metricPillTeal}>
                <Ionicons name="moon" size={11} color="#0f766e" />
                <Text style={styles.metricPillTealText}>{wearableData.sleep_hours ?? 0}h Sleep</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* 3-Column Micro-Gauge Strip */}
      <View style={styles.microGaugeStrip}>
        <View style={styles.microGaugeCol}>
          <View style={styles.microGaugeHeader}>
            <Text style={styles.microGaugeTitle}>CARDIO</Text>
            <MaterialCommunityIcons
              name={(wearableData.zone2_minutes || 0) >= 45 ? 'check-circle' : 'heart-pulse'}
              size={13}
              color={(wearableData.zone2_minutes || 0) >= 45 ? '#10b981' : '#64748b'}
            />
          </View>
          <Text style={styles.microGaugeVal}>{wearableData.zone2_minutes || 0} / 45m</Text>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(100, Math.round(((wearableData.zone2_minutes || 0) / 45) * 100))}%`,
                  backgroundColor: '#10b981',
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.microGaugeCol}>
          <View style={styles.microGaugeHeader}>
            <Text style={styles.microGaugeTitle}>STRENGTH</Text>
            <Text style={[styles.microGaugeHeaderRight, { color: '#f97316' }]}>35m</Text>
          </View>
          <Text style={styles.microGaugeVal}>0 / 35m</Text>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: '20%', backgroundColor: '#f97316' }]} />
          </View>
        </View>

        <View style={styles.microGaugeCol}>
          <View style={styles.microGaugeHeader}>
            <Text style={styles.microGaugeTitle}>MOBILITY</Text>
            <Text style={styles.microGaugeHeaderRight}>15m</Text>
          </View>
          <Text style={styles.microGaugeVal}>
            {completedHabits['habit_1'] ? 'Done' : 'Pending'}
          </Text>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: completedHabits['habit_1'] ? '100%' : '0%',
                  backgroundColor: '#06b6d4',
                },
              ]}
            />
          </View>
        </View>
      </View>
    </PopInView>
  );
}
