import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../theme';
import { ScrollPopView } from '../AnimatedComponents';
import styles from '../../screens/styles/TrainingScheduleScreen.styles';

export default function PlanAdaptationsSection({
  isTodaySelected,
  isRestDay,
  adaptedPlan,
  handleAdapt,
}) {
  return (
    <ScrollPopView delay={80} style={styles.adaptSection}>
      <View style={styles.adaptCard}>
        {/* Header */}
        <View style={styles.adaptHeader}>
          <View style={styles.adaptIconBox}>
            <MaterialCommunityIcons name="tune" size={22} color="#783200" />
          </View>
          <View style={styles.adaptHeaderTextWrap}>
            <Text style={styles.adaptTitle}>Not Feeling 100%?</Text>
            <Text style={styles.adaptSubtitle}>
              {!isTodaySelected
                ? 'Switch to today to adapt current plan'
                : isRestDay
                ? 'Plan adaptations disabled on rest days'
                : 'Tired, sore, or short on time? Adapt in 1-tap.'}
            </Text>
          </View>
        </View>

        {/* 2x2 Quick Action Buttons Grid */}
        <View style={styles.adaptButtonsGrid}>
          {/* Active Walk */}
          <TouchableOpacity
            disabled={isRestDay || !isTodaySelected}
            style={[
              styles.adaptOptionBtn,
              adaptedPlan === 'walk' && styles.adaptOptionBtnActive,
              (isRestDay || !isTodaySelected) && { opacity: 0.5 },
            ]}
            onPress={() => handleAdapt('walk', 'Active Walk')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="hiking" size={22} color="#9d4300" />
            <View>
              <Text style={styles.adaptOptionTitle}>Active Walk</Text>
              <Text style={styles.adaptOptionSub}>Gentle 25 min</Text>
            </View>
          </TouchableOpacity>

          {/* Ease Effort */}
          <TouchableOpacity
            disabled={isRestDay || !isTodaySelected}
            style={[
              styles.adaptOptionBtn,
              adaptedPlan === 'ease' && styles.adaptOptionBtnActive,
              (isRestDay || !isTodaySelected) && { opacity: 0.5 },
            ]}
            onPress={() => handleAdapt('ease', 'Ease Effort')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="speedometer" size={22} color={COLORS.primary} />
            <View>
              <Text style={styles.adaptOptionTitle}>Ease Effort</Text>
              <Text style={styles.adaptOptionSub}>-30% intensity</Text>
            </View>
          </TouchableOpacity>

          {/* Take Rest Day */}
          <TouchableOpacity
            disabled={isRestDay || !isTodaySelected}
            style={[
              styles.adaptOptionBtn,
              adaptedPlan === 'rest' && styles.adaptOptionBtnActive,
              (isRestDay || !isTodaySelected) && { opacity: 0.5 },
            ]}
            onPress={() => handleAdapt('rest', 'Take Rest Day')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="bed-empty" size={22} color="#64748b" />
            <View>
              <Text style={styles.adaptOptionTitle}>Take Rest Day</Text>
              <Text style={styles.adaptOptionSub}>Slide to tomorrow</Text>
            </View>
          </TouchableOpacity>

          {/* Custom Edit */}
          <TouchableOpacity
            disabled={isRestDay || !isTodaySelected}
            style={[
              styles.adaptOptionBtn,
              adaptedPlan === 'custom' && styles.adaptOptionBtnActive,
              (isRestDay || !isTodaySelected) && { opacity: 0.5 },
            ]}
            onPress={() => handleAdapt('custom', 'Custom Edit')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="calendar-edit" size={22} color={COLORS.primary} />
            <View>
              <Text style={styles.adaptOptionTitle}>Custom Edit</Text>
              <Text style={styles.adaptOptionSub}>Rearrange week</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Adaptive Promise Footer */}
        <View style={styles.promiseFooter}>
          <MaterialCommunityIcons name="check-decagram" size={18} color={COLORS.primary} />
          <Text style={styles.promiseText}>
            Coach Jim automatically rebalances your weekly training volume. 🦫
          </Text>
        </View>
      </View>
    </ScrollPopView>
  );
}
