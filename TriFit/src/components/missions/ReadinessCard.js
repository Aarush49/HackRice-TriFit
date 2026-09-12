import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { PopInView, BouncyButton } from '../AnimatedComponents';
import styles from '../../screens/styles/DailyMissionsScreen.styles';

export default function ReadinessCard({
  wearableData,
  isSyncing,
  handleSyncWearables,
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
                strokeDashoffset="15"
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
                <Text style={styles.metricPillGreenText}>HRV {wearableData.hrv_ms}ms</Text>
              </View>
              <View style={styles.metricPillTeal}>
                <Ionicons name="moon" size={11} color="#0f766e" />
                <Text style={styles.metricPillTealText}>{wearableData.sleep_hours}h Sleep</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Right Quests Progress Indicator & Sync Button */}
        <View style={styles.questsSummary}>
          <BouncyButton
            style={styles.syncBtnPill}
            onPress={handleSyncWearables}
            disabled={isSyncing}
            shakeOnPress={false}
          >
            <MaterialCommunityIcons name="sync" size={13} color="#0f766e" />
            <Text style={styles.syncBtnText}>{isSyncing ? 'Syncing...' : 'Sync Wearables'}</Text>
          </BouncyButton>
          <Text style={styles.xpGainedSub}>Open Wearables API</Text>
        </View>
      </View>

      {/* 3-Column Micro-Gauge Strip */}
      <View style={styles.microGaugeStrip}>
        <View style={styles.microGaugeCol}>
          <View style={styles.microGaugeHeader}>
            <Text style={styles.microGaugeTitle}>CARDIO</Text>
            <MaterialCommunityIcons name="check-circle" size={13} color="#10b981" />
          </View>
          <Text style={styles.microGaugeVal}>45 / 45m</Text>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: '100%', backgroundColor: '#10b981' }]} />
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
