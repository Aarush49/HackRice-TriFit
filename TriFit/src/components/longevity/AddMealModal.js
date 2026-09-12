import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Image, Modal, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RECIPES_DATA from '../../data/recipesData';
import styles from '../../screens/styles/LongevityDashboardScreen.styles';

export default function AddMealModal({
  isAddMealModalOpen,
  setIsAddMealModalOpen,
  addMealTab,
  setAddMealTab,
  handleLogMeal,
  customName,
  setCustomName,
  customCals,
  setCustomCals,
  customCarbs,
  setCustomCarbs,
  customProtein,
  setCustomProtein,
  customFats,
  setCustomFats,
  handleLogCustomMealSubmit,
  setIsCustomMealModalOpen,
}) {
  return (
    <Modal visible={isAddMealModalOpen} transparent animationType="slide" onRequestClose={() => setIsAddMealModalOpen(false)}>
      <SafeAreaView style={styles.addMealModalOverlay}>
        <View style={styles.addMealModalCard}>
          <View style={styles.addMealModalHeader}>
            <Text style={styles.addMealModalTitle}>Log Meal &amp; Calories</Text>
            <TouchableOpacity onPress={() => setIsAddMealModalOpen(false)}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Tab Switcher: App Recipes vs Custom Meal */}
          <View style={styles.addMealTabGroup}>
            <TouchableOpacity
              style={[styles.addMealTabBtn, addMealTab === 'app' && styles.addMealTabBtnActive]}
              onPress={() => setAddMealTab('app')}
            >
              <Text style={[styles.addMealTabText, addMealTab === 'app' && styles.addMealTabTextActive]}>
                App Recipes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addMealTabBtn, addMealTab === 'custom' && styles.addMealTabBtnActive]}
              onPress={() => setAddMealTab('custom')}
            >
              <Text style={[styles.addMealTabText, addMealTab === 'custom' && styles.addMealTabTextActive]}>
                + Custom Meal
              </Text>
            </TouchableOpacity>
          </View>

          {addMealTab === 'app' ? (
            <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
              {RECIPES_DATA.map((recipe) => (
                <View key={recipe.id} style={styles.appRecipeRow}>
                  <Image source={{ uri: recipe.image }} style={styles.appRecipeThumb} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.appRecipeTitle}>{recipe.title}</Text>
                    <Text style={styles.appRecipeSub}>
                      {recipe.calories} kcal • {recipe.carbs}g C / {recipe.protein}g P / {recipe.fats}g F
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.logAppRecipeChipBtn}
                    onPress={() => {
                      handleLogMeal(recipe.title, recipe.calories, recipe.carbs, recipe.protein, recipe.fats);
                      setIsAddMealModalOpen(false);
                    }}
                  >
                    <Text style={styles.logAppRecipeChipText}>+ Log</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          ) : (
            <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Meal Name</Text>
              <TextInput
                style={styles.customInput}
                placeholder="e.g. Avocado Toast & Eggs"
                placeholderTextColor="#94a3b8"
                value={customName}
                onChangeText={setCustomName}
              />

              <Text style={styles.inputLabel}>Calories (kcal)</Text>
              <TextInput
                style={styles.customInput}
                placeholder="e.g. 450"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                value={customCals}
                onChangeText={setCustomCals}
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Carbs (g)</Text>
                  <TextInput
                    style={styles.customInput}
                    placeholder="e.g. 50"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                    value={customCarbs}
                    onChangeText={setCustomCarbs}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Protein (g)</Text>
                  <TextInput
                    style={styles.customInput}
                    placeholder="e.g. 30"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                    value={customProtein}
                    onChangeText={setCustomProtein}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Fats (g)</Text>
                  <TextInput
                    style={styles.customInput}
                    placeholder="e.g. 15"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                    value={customFats}
                    onChangeText={setCustomFats}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.submitCustomBtn}
                onPress={handleLogCustomMealSubmit}
                activeOpacity={0.85}
              >
                <Text style={styles.submitCustomBtnText}>Log Custom Meal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ marginTop: 10, alignItems: 'center' }}
                onPress={() => {
                  setIsAddMealModalOpen(false);
                  setIsCustomMealModalOpen(true);
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#00685f' }}>
                  📖 Open Full Recipe-Style Meal Builder
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}
