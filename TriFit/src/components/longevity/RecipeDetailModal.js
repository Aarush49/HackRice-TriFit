import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Modal, SafeAreaView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import styles from '../../screens/styles/LongevityDashboardScreen.styles';

export default function RecipeDetailModal({
  selectedRecipe,
  setSelectedRecipe,
  handleLogMeal,
}) {
  return (
    <Modal
      visible={!!selectedRecipe}
      animationType="slide"
      transparent={false}
      presentationStyle="fullScreen"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={() => setSelectedRecipe(null)}
    >
      {selectedRecipe && (
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setSelectedRecipe(null)}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color="#131b2e" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle} numberOfLines={1}>
              {selectedRecipe.title}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            {/* Recipe Cover Image */}
            <View style={styles.modalImageContainer}>
              <Image
                source={{ uri: selectedRecipe.image }}
                style={styles.modalHeroImage}
              />
              <View style={[styles.modalTagBadge, { backgroundColor: selectedRecipe.tagColor }]}>
                <Text style={styles.modalTagText}>{selectedRecipe.tag}</Text>
              </View>
              <View style={[styles.modalDietBadge, selectedRecipe.isVeg ? styles.vegBadgeBg : styles.nonVegBadgeBg]}>
                <Text style={styles.modalDietText}>
                  {selectedRecipe.isVeg ? '🌱 Vegetarian' : '🍗 Non-Vegetarian'}
                </Text>
              </View>
            </View>

            {/* Title & Timing Strip */}
            <View style={styles.modalBodyGroup}>
              <Text style={styles.modalRecipeTitle}>{selectedRecipe.title}</Text>
              <Text style={styles.modalSummary}>{selectedRecipe.summary}</Text>

              {/* Macro Nutrition Summary Cards */}
              <View style={styles.modalMacroRow}>
                <View style={styles.modalMacroCol}>
                  <Text style={styles.modalMacroVal}>{selectedRecipe.calories}</Text>
                  <Text style={styles.modalMacroLabel}>KCAL</Text>
                </View>
                <View style={styles.modalMacroDivider} />
                <View style={styles.modalMacroCol}>
                  <Text style={[styles.modalMacroVal, { color: '#9d4300' }]}>{selectedRecipe.carbs}g</Text>
                  <Text style={styles.modalMacroLabel}>CARBS</Text>
                </View>
                <View style={styles.modalMacroDivider} />
                <View style={styles.modalMacroCol}>
                  <Text style={[styles.modalMacroVal, { color: '#00685f' }]}>{selectedRecipe.protein}g</Text>
                  <Text style={styles.modalMacroLabel}>PROTEIN</Text>
                </View>
                <View style={styles.modalMacroDivider} />
                <View style={styles.modalMacroCol}>
                  <Text style={[styles.modalMacroVal, { color: '#00628d' }]}>{selectedRecipe.fats}g</Text>
                  <Text style={styles.modalMacroLabel}>FATS</Text>
                </View>
              </View>

              {/* Pro Fuel Coaching Tip */}
              <View style={styles.coachTipCard}>
                <Ionicons name="bulb" size={20} color="#f59e0b" />
                <View style={styles.coachTipTextWrap}>
                  <Text style={styles.coachTipTitle}>Coach Maya Fuel Cue</Text>
                  <Text style={styles.coachTipText}>{selectedRecipe.proTip}</Text>
                </View>
              </View>

              {/* Ingredients List */}
              <View style={styles.detailSectionWrap}>
                <View style={styles.sectionIconTitleRow}>
                  <MaterialCommunityIcons name="basket-outline" size={20} color="#00685f" />
                  <Text style={styles.detailSectionTitle}>Ingredients</Text>
                </View>
                <View style={styles.ingredientList}>
                  {selectedRecipe.ingredients.map((ing, idx) => (
                    <View key={idx} style={styles.ingredientRow}>
                      <View style={styles.bulletDot} />
                      <Text style={styles.ingredientText}>{ing}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Preparation Steps */}
              <View style={styles.detailSectionWrap}>
                <View style={styles.sectionIconTitleRow}>
                  <MaterialCommunityIcons name="chef-hat" size={20} color="#9d4300" />
                  <Text style={styles.detailSectionTitle}>Preparation Instructions</Text>
                </View>
                <View style={styles.stepsList}>
                  {selectedRecipe.steps.map((step, idx) => (
                    <View key={idx} style={styles.stepRow}>
                      <View style={styles.stepNumberCircle}>
                        <Text style={styles.stepNumberText}>{idx + 1}</Text>
                      </View>
                      <Text style={styles.stepText}>{step}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Log Recipe Button */}
              <TouchableOpacity
                style={styles.logRecipeDetailBtn}
                onPress={() => {
                  handleLogMeal(
                    selectedRecipe.title,
                    selectedRecipe.calories,
                    selectedRecipe.carbs,
                    selectedRecipe.protein,
                    selectedRecipe.fats
                  );
                  setSelectedRecipe(null);
                }}
                activeOpacity={0.85}
              >
                <Ionicons name="add-circle" size={20} color="#ffffff" />
                <Text style={styles.logRecipeDetailBtnText}>
                  Log Recipe (+{selectedRecipe.calories} kcal)
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      )}
    </Modal>
  );
}
