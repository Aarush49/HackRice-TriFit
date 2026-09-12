import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { PopInView, BouncyButton } from '../AnimatedComponents';
import styles from '../../screens/styles/LongevityDashboardScreen.styles';

export default function MacroTargetCard({
  calPercent,
  protein,
  calories,
  calorieTarget,
  calLeft,
  waterAmount,
  waterLogged,
  handleAddWater,
  carbs,
  fats,
  setIsAddMealModalOpen,
}) {
  return (
    <PopInView delay={90} style={styles.bentoCard}>
      <View style={styles.bentoTopRow}>
        {/* Dual Ring Circular SVG Progress Gauge */}
        <View style={styles.gaugeContainer}>
          <View style={styles.gaugeWrap}>
            <Svg width={64} height={64} viewBox="0 0 84 84">
              {/* Outer Ring Background */}
              <Circle cx="42" cy="42" r="36" stroke="#eaedff" strokeWidth="8" fill="none" />
              {/* Outer Ring Progress (Orange Calories) */}
              <Circle
                cx="42"
                cy="42"
                r="36"
                stroke="#fd761a"
                strokeWidth="8"
                strokeDasharray="226.2"
                strokeDashoffset={226.2 - (226.2 * calPercent) / 100}
                strokeLinecap="round"
                fill="none"
                rotation="-90"
                origin="42, 42"
              />
              {/* Inner Ring Background */}
              <Circle cx="42" cy="42" r="26" stroke="#eaedff" strokeWidth="6" fill="none" />
              {/* Inner Ring Progress (Teal Protein) */}
              <Circle
                cx="42"
                cy="42"
                r="26"
                stroke="#00685f"
                strokeWidth="6"
                strokeDasharray="163.3"
                strokeDashoffset={163.3 - (163.3 * Math.min(protein / 145, 1))}
                strokeLinecap="round"
                fill="none"
                rotation="-90"
                origin="42, 42"
              />
            </Svg>
            <View style={styles.gaugeCenterText}>
              <Text style={styles.gaugePercent}>{calPercent}%</Text>
            </View>
          </View>

          <View style={styles.calInfoGroup}>
            <View style={styles.calNumbersRow}>
              <Text style={styles.calIntake}>{calories.toLocaleString()}</Text>
              <Text style={styles.calTarget}>/ {calorieTarget.toLocaleString()} kcal</Text>
            </View>
            <View style={styles.calLeftRow}>
              <MaterialCommunityIcons name="fire" size={14} color="#ea580c" />
              <Text style={styles.calLeftText}>{calLeft} kcal left</Text>
            </View>
          </View>
        </View>

        {/* Quick Hydration Logger with Bouncy Press & Shake */}
        <BouncyButton
          style={[styles.hydrationBtn, waterLogged && styles.hydrationBtnSuccess]}
          onPress={handleAddWater}
          shakeOnPress={true}
        >
          <MaterialCommunityIcons
            name={waterLogged ? 'check-circle' : 'cup-water'}
            size={16}
            color={waterLogged ? '#00685f' : '#00628d'}
          />
          <Text style={[styles.hydrationText, waterLogged && styles.hydrationTextSuccess]}>
            {waterAmount}L
          </Text>
          <View style={styles.hydrationAddChip}>
            <Text style={styles.hydrationAddText}>+250ml</Text>
          </View>
        </BouncyButton>
      </View>

      {/* 3 Macro Progress Bars */}
      <View style={styles.macroGrid}>
        {/* Carbs */}
        <View style={styles.macroCol}>
          <View style={styles.macroHeader}>
            <Text style={[styles.macroLabel, { color: '#9d4300' }]}>CARBS</Text>
            <MaterialCommunityIcons name="barley" size={13} color="#9d4300" />
          </View>
          <Text style={styles.macroVal}>
            {carbs}
            <Text style={styles.macroMax}>/330g</Text>
          </Text>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min((carbs / 330) * 100, 100)}%`,
                  backgroundColor: '#fd761a',
                },
              ]}
            />
          </View>
        </View>

        {/* Protein */}
        <View style={styles.macroCol}>
          <View style={styles.macroHeader}>
            <Text style={[styles.macroLabel, { color: '#00685f' }]}>PROTEIN</Text>
            <MaterialCommunityIcons name="dna" size={13} color="#00685f" />
          </View>
          <Text style={styles.macroVal}>
            {protein}
            <Text style={styles.macroMax}>/145g</Text>
          </Text>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min((protein / 145) * 100, 100)}%`,
                  backgroundColor: '#00685f',
                },
              ]}
            />
          </View>
        </View>

        {/* Fats */}
        <View style={styles.macroCol}>
          <View style={styles.macroHeader}>
            <Text style={[styles.macroLabel, { color: '#00628d' }]}>FATS</Text>
            <MaterialCommunityIcons name="water" size={13} color="#00628d" />
          </View>
          <Text style={styles.macroVal}>
            {fats}
            <Text style={styles.macroMax}>/65g</Text>
          </Text>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min((fats / 65) * 100, 100)}%`,
                  backgroundColor: '#007cb1',
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Add Meal Action Button */}
      <BouncyButton
        style={styles.addMealActionBtn}
        onPress={() => setIsAddMealModalOpen(true)}
        shakeOnPress={false}
      >
        <Ionicons name="add-circle" size={18} color="#ffffff" />
        <Text style={styles.addMealActionBtnText}>+ Log Meal / Food</Text>
      </BouncyButton>
    </PopInView>
  );
}
