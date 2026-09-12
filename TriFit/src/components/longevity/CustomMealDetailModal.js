import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Image, Modal, SafeAreaView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import styles from '../../screens/styles/LongevityDashboardScreen.styles';

export default function CustomMealDetailModal({
  isCustomMealModalOpen,
  setIsCustomMealModalOpen,
  customDiet,
  setCustomDiet,
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
  customNotes,
  setCustomNotes,
  handleLogCustomMealSubmit,
}) {
  return (
    <Modal
      visible={isCustomMealModalOpen}
      animationType="slide"
      transparent={false}
      presentationStyle="fullScreen"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={() => setIsCustomMealModalOpen(false)}
    >
      <SafeAreaView style={styles.modalSafeArea}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.modalCloseBtn}
            onPress={() => setIsCustomMealModalOpen(false)}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color="#131b2e" />
          </TouchableOpacity>
          <Text style={styles.modalHeaderTitle} numberOfLines={1}>
            Custom Meal &amp; Macro Log
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
          {/* Hero Cover Container */}
          <View style={styles.modalImageContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80' }}
              style={styles.modalHeroImage}
            />
            <View style={[styles.modalTagBadge, { backgroundColor: '#00685f' }]}>
              <Text style={styles.modalTagText}>+ Custom Fuel Entry</Text>
            </View>
            <View style={[styles.modalDietBadge, customDiet === 'veg' ? styles.vegBadgeBg : styles.nonVegBadgeBg]}>
              <TouchableOpacity
                onPress={() => setCustomDiet(customDiet === 'veg' ? 'non_veg' : 'veg')}
                activeOpacity={0.8}
              >
                <Text style={styles.modalDietText}>
                  {customDiet === 'veg' ? '🌱 Veg (Tap to toggle)' : '🍗 Non-Veg (Tap to toggle)'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Title & Timing Strip */}
          <View style={styles.modalBodyGroup}>
            <Text style={styles.customFieldHeading}>MEAL / DISH NAME</Text>
            <TextInput
              style={styles.customTitleInput}
              placeholder="e.g. Avocado Toast & Poached Eggs..."
              placeholderTextColor="#94a3b8"
              value={customName}
              onChangeText={setCustomName}
            />
            <Text style={styles.modalSummary}>
              Enter your custom nutrition macros below. Coach Maya will track these towards your daily endurance targets.
            </Text>

            {/* Macro Nutrition Summary & Input Cards */}
            <Text style={styles.customFieldHeading}>MACROS &amp; CALORIES</Text>
            <View style={styles.modalMacroRow}>
              <View style={styles.modalMacroColInput}>
                <Text style={styles.modalMacroLabel}>KCAL</Text>
                <TextInput
                  style={styles.macroInputField}
                  placeholder="450"
                  placeholderTextColor="#cbd5e1"
                  keyboardType="numeric"
                  value={customCals}
                  onChangeText={setCustomCals}
                />
              </View>
              <View style={styles.modalMacroDivider} />
              <View style={styles.modalMacroColInput}>
                <Text style={[styles.modalMacroLabel, { color: '#9d4300' }]}>CARBS (g)</Text>
                <TextInput
                  style={[styles.macroInputField, { color: '#9d4300' }]}
                  placeholder="50"
                  placeholderTextColor="#cbd5e1"
                  keyboardType="numeric"
                  value={customCarbs}
                  onChangeText={setCustomCarbs}
                />
              </View>
              <View style={styles.modalMacroDivider} />
              <View style={styles.modalMacroColInput}>
                <Text style={[styles.modalMacroLabel, { color: '#00685f' }]}>PROTEIN (g)</Text>
                <TextInput
                  style={[styles.macroInputField, { color: '#00685f' }]}
                  placeholder="30"
                  placeholderTextColor="#cbd5e1"
                  keyboardType="numeric"
                  value={customProtein}
                  onChangeText={setCustomProtein}
                />
              </View>
              <View style={styles.modalMacroDivider} />
              <View style={styles.modalMacroColInput}>
                <Text style={[styles.modalMacroLabel, { color: '#00628d' }]}>FATS (g)</Text>
                <TextInput
                  style={[styles.macroInputField, { color: '#00628d' }]}
                  placeholder="15"
                  placeholderTextColor="#cbd5e1"
                  keyboardType="numeric"
                  value={customFats}
                  onChangeText={setCustomFats}
                />
              </View>
            </View>

            {/* Pro Fuel Coaching Tip */}
            <View style={styles.coachTipCard}>
              <Ionicons name="bulb" size={20} color="#f59e0b" />
              <View style={styles.coachTipTextWrap}>
                <Text style={styles.coachTipTitle}>Coach Maya Live Fuel Tip</Text>
                <Text style={styles.coachTipText}>
                  {customProtein && parseInt(customProtein, 10) >= 25
                    ? '⚡ High protein detected! Excellent for triggering post-workout muscle protein synthesis (mTOR activation).'
                    : customCarbs && parseInt(customCarbs, 10) >= 60
                    ? '🚴 High carb loading detected! Ideal for filling glycogen stores 2-3 hours prior to long aerobic efforts.'
                    : 'Customize your calories and protein to match your target endurance goals for today!'}
                </Text>
              </View>
            </View>

            {/* Ingredients / Notes Section */}
            <View style={styles.detailSectionWrap}>
              <View style={styles.sectionIconTitleRow}>
                <MaterialCommunityIcons name="basket-outline" size={20} color="#00685f" />
                <Text style={styles.detailSectionTitle}>Ingredients / Recipe Notes (Optional)</Text>
              </View>
              <TextInput
                style={styles.customNotesInput}
                placeholder="e.g. 2 sourdough slices, 2 poached eggs, half avocado..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={3}
                value={customNotes}
                onChangeText={setCustomNotes}
              />
            </View>

            {/* Log Custom Recipe Button */}
            <TouchableOpacity
              style={styles.logRecipeDetailBtn}
              onPress={handleLogCustomMealSubmit}
              activeOpacity={0.85}
            >
              <Ionicons name="add-circle" size={20} color="#ffffff" />
              <Text style={styles.logRecipeDetailBtnText}>
                Log Custom Meal (+{customCals || '0'} kcal)
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
