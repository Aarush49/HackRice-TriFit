import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollPopView } from '../AnimatedComponents';
import RECIPES_DATA from '../../data/recipesData';
import styles from '../../screens/styles/LongevityDashboardScreen.styles';

export default function PerformanceRecipesSection({
  displayedRecipes,
  dietFilter,
  setDietFilter,
  vegCount,
  nonVegCount,
  setIsCustomMealModalOpen,
  setSelectedRecipe,
}) {
  return (
    <ScrollPopView delay={60} style={styles.sectionWrap}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionHeadingRow}>
          <Text style={styles.sectionHeading}>Performance Recipes</Text>
          <View style={styles.recipeCountBadge}>
            <Text style={styles.recipeCountText}>{displayedRecipes.length} shown</Text>
          </View>
        </View>
      </View>

      {/* Veg / Non-Veg Diet Filter Bar */}
      <View style={styles.dietFilterRow}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => setDietFilter('ALL')}
          style={[
            styles.dietFilterBtn,
            dietFilter === 'ALL' && styles.dietFilterBtnActiveAll,
          ]}
        >
          <Text
            style={[
              styles.dietFilterText,
              dietFilter === 'ALL' && styles.dietFilterTextActive,
            ]}
          >
            All ({RECIPES_DATA.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => setDietFilter('VEG')}
          style={[
            styles.dietFilterBtn,
            dietFilter === 'VEG' && styles.dietFilterBtnActiveVeg,
          ]}
        >
          <Text
            style={[
              styles.dietFilterText,
              dietFilter === 'VEG' && styles.dietFilterTextActive,
            ]}
          >
            🌱 Veg ({vegCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => setDietFilter('NON_VEG')}
          style={[
            styles.dietFilterBtn,
            dietFilter === 'NON_VEG' && styles.dietFilterBtnActiveNonVeg,
          ]}
        >
          <Text
            style={[
              styles.dietFilterText,
              dietFilter === 'NON_VEG' && styles.dietFilterTextActive,
            ]}
          >
            🍗 Non-Veg ({nonVegCount})
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.tapTipText}>Tap any recipe card to view ingredients &amp; cooking steps 📖</Text>

      <View style={styles.recipesGrid}>
        {/* Custom Meal Recipe Card */}
        <TouchableOpacity
          style={styles.customRecipeCard}
          onPress={() => setIsCustomMealModalOpen(true)}
          activeOpacity={0.88}
        >
          <View style={styles.customRecipeImageWrap}>
            <MaterialCommunityIcons name="plus-circle-outline" size={38} color="#00685f" />
            <View style={[styles.recipeTagBadge, { backgroundColor: '#00685f' }]}>
              <Text style={styles.tagText}>+ Custom</Text>
            </View>
            <View style={[styles.dietBadge, { backgroundColor: '#0284c7' }]}>
              <Text style={styles.dietBadgeText}>✨ Any Macros</Text>
            </View>
          </View>

          <Text style={styles.recipeTitle} numberOfLines={1}>
            + Add Custom Meal
          </Text>

          <View style={styles.recipeMetaRow}>
            <View style={styles.macroBadgeTeal}>
              <Text style={styles.macroBadgeTealText}>Custom Fuel</Text>
            </View>
            <Text style={styles.recipeCalories}>Log Cals ✍️</Text>
          </View>
        </TouchableOpacity>

        {displayedRecipes.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.recipeCard}
            onPress={() => setSelectedRecipe(item)}
            activeOpacity={0.88}
          >
            <View style={styles.recipeImageWrap}>
              <Image
                source={{ uri: item.image }}
                style={styles.recipeImage}
              />
              <View style={[styles.recipeTagBadge, { backgroundColor: item.tagColor }]}>
                <Text style={styles.tagText}>{item.tag}</Text>
              </View>
              <View style={[styles.dietBadge, item.isVeg ? styles.vegBadgeBg : styles.nonVegBadgeBg]}>
                <Text style={styles.dietBadgeText}>
                  {item.isVeg ? '🌱 Veg' : '🍗 Non-Veg'}
                </Text>
              </View>
              <View style={styles.timeTag}>
                <Text style={styles.timeTagText}>{item.prepTime}</Text>
              </View>
            </View>

            <Text style={styles.recipeTitle} numberOfLines={1}>
              {item.shortTitle}
            </Text>

            <View style={styles.recipeMetaRow}>
              <View style={styles.macroBadgeOrange}>
                <Text style={styles.macroBadgeOrangeText}>{item.carbs}g C</Text>
              </View>
              <View style={styles.macroBadgeTeal}>
                <Text style={styles.macroBadgeTealText}>{item.protein}g P</Text>
              </View>
              <Text style={styles.recipeCalories}>{item.calories} kcal</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollPopView>
  );
}
