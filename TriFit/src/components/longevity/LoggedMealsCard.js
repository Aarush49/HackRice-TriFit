import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import styles from '../../screens/styles/LongevityDashboardScreen.styles';

export default function LoggedMealsCard({ loggedMeals }) {
  if (!loggedMeals || loggedMeals.length === 0) return null;

  return (
    <View style={styles.loggedMealsCard}>
      <View style={styles.loggedMealsHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <MaterialCommunityIcons name="silverware-fork-knife" size={18} color="#00685f" />
          <Text style={styles.loggedMealsTitle}>Today's Logged Meals ({loggedMeals.length})</Text>
        </View>
      </View>
      <View style={styles.loggedMealsList}>
        {loggedMeals.map((meal) => (
          <View key={meal.id} style={styles.loggedMealRow}>
            <View style={styles.loggedMealLeft}>
              <Text style={styles.loggedMealName}>{meal.name}</Text>
              <Text style={styles.loggedMealSub}>
                {meal.time} • {meal.carbs}g C / {meal.protein}g P / {meal.fats}g F
              </Text>
            </View>
            <View style={styles.loggedMealCalBadge}>
              <Text style={styles.loggedMealCalText}>+{meal.calories} kcal</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
