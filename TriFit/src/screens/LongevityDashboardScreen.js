import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  SafeAreaView,
  Platform,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme';

const RECIPES_DATA = [
  {
    id: 'glycogen',
    title: 'Glycogen Loading Bowl',
    shortTitle: 'Glycogen Bowl',
    tag: 'Pre-Run',
    tagColor: '#fd761a',
    prepTime: '15m',
    difficulty: 'Easy',
    calories: 520,
    carbs: 78,
    protein: 14,
    fats: 8,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUbvaQgMpJAsVdEruh_hzBEZVBeZuvKRglruS7Jc4vE_JFQpcnID0UXB2TjDUJ2KHIJozKi8IWeNZbSzQSkvosiBvf0pKBdXaTF30hua_4sTVNQ9CtXPL7sqNWfGFqXoRTCrAvyfy3b0yxIAmdrnu9KxbG6nTHw13uCQ35mgo13LFJvPMHqFCN-hGrR51o-MyNq0UvBKTN3nGKReCz4_M_K6j7iSXA6UTiCUtRPzJBP5Fk0iT3avpW',
    summary: 'High-glycemic carbohydrate loading bowl designed to top off muscle glycogen stores 2-3 hours prior to threshold runs or long bike rides.',
    proTip: 'Eat 90–120 minutes before high-intensity workouts for sustained energy without stomach distress.',
    ingredients: [
      '1 cup rolled oats (cooked in almond milk)',
      '1 ripe banana, sliced',
      '1/2 cup fresh organic blueberries',
      '1.5 tbsp raw clover honey or pure maple syrup',
      '1 tbsp chia seeds',
      '1 pinch Himalayan pink sea salt (electrolytes)',
    ],
    steps: [
      'Simmer rolled oats in unsweetened almond milk over medium heat for 4–5 minutes until thick and creamy.',
      'Stir in chia seeds and a pinch of pink sea salt to boost sodium retention.',
      'Pour into a bowl and arrange sliced banana and fresh blueberries across the top.',
      'Drizzle with raw honey and enjoy warm before your session.',
    ],
  },
  {
    id: 'salmon',
    title: 'Pan-Seared Salmon & Tart Cherry',
    shortTitle: 'Salmon & Cherry',
    tag: 'Recovery',
    tagColor: '#00685f',
    prepTime: '20m',
    difficulty: 'Medium',
    calories: 610,
    carbs: 18,
    protein: 42,
    fats: 22,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBV5x0AkDGXi5kbUCDQ8HtHxM-7JzIfX7l0SGZwURqR0xrAKEGIZ9AoBFziN4axT0RADqpZ_CDUCbEPjdF-WyHxs13nIROyrYZh2j7ZK-jVEFEVQk0I_Iur1ZmhkfW2_cNCU3wIK99EHjeIX41mBJPe08-GohVlnPVbTzOTkWdnGmhHHIwsWxlRJDBn426I7dB-y8SFrg7BJVw7OejXbTYzBqLELaGn8Q88wgWNsMXoLuWXYRAwSce',
    summary: 'Anti-inflammatory powerhouse loaded with Omega-3 fatty acids and anthocyanins from tart cherries to drastically cut muscle soreness.',
    proTip: 'Tart cherry juice has been clinically proven to reduce DOMS and lower systemic inflammation post-exercise.',
    ingredients: [
      '6 oz wild Atlantic salmon fillet',
      '2 tbsp pure tart cherry concentrate (or dried tart cherries)',
      '1 cup cooked tricolor quinoa or jasmine rice',
      '1 bunch roasted asparagus spears with lemon',
      '1 tbsp extra virgin olive oil',
      'Coarse sea salt & cracked black pepper to taste',
    ],
    steps: [
      'Pat salmon fillet dry and season both sides generously with sea salt and cracked black pepper.',
      'Heat olive oil in a skillet over medium-high heat. Sear salmon skin-side down for 4 minutes, flip and cook for 3 minutes.',
      'In a small saucepot, warm the tart cherry concentrate with a splash of balsamic vinegar until it thickens into a glaze.',
      'Plate the salmon alongside fluffy quinoa and asparagus, then drizzle the tart cherry reduction over the top.',
    ],
  },
  {
    id: 'quinoa',
    title: 'Citrus Quinoa & Feta Electrolyte Salad',
    shortTitle: 'Citrus Quinoa',
    tag: 'Hydration',
    tagColor: '#00628d',
    prepTime: '12m',
    difficulty: 'Easy',
    calories: 410,
    carbs: 62,
    protein: 16,
    fats: 10,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=80',
    summary: 'Refreshing electrolyte-dense grain bowl packed with potassium, magnesium, and bioavailable slow-release carbohydrates.',
    proTip: 'Great for warm-weather training days when sweat rates and mineral losses are high.',
    ingredients: [
      '1.5 cups cooked fluffy quinoa',
      '1 whole navel orange, segmented',
      '1 cup fresh baby spinach leaves',
      '2 tbsp crumbled organic feta cheese',
      '1 tbsp toasted pumpkin seeds (pepitas)',
      '1 tbsp lime juice & cold-pressed olive oil dressing',
    ],
    steps: [
      'Cook and fluff quinoa, allowing it to cool to room temperature.',
      'In a large salad bowl, gently fold together quinoa, baby spinach, and orange segments.',
      'Toss with lime juice, olive oil, and sea salt.',
      'Top with crumbled feta cheese and crunchy toasted pumpkin seeds.',
    ],
  },
  {
    id: 'beetroot',
    title: 'Nitrate Beetroot & Berry Rocket Smoothie',
    shortTitle: 'Beet & Berry',
    tag: 'Pre-Race',
    tagColor: '#c026d3',
    prepTime: '5m',
    difficulty: 'Easy',
    calories: 340,
    carbs: 54,
    protein: 22,
    fats: 4,
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&auto=format&fit=crop&q=80',
    summary: 'Natural dietary nitrate booster that enhances blood flow, oxygen efficiency, and mitochondrial power during endurance efforts.',
    proTip: 'Drink 2.5 hours before race start to hit peak plasma nitrite levels right at the gun.',
    ingredients: [
      '1/2 cup roasted beetroot chunks (or 1 scoop beet root powder)',
      '1 cup frozen organic raspberries & strawberries',
      '1 scoop vanilla whey or plant protein isolate',
      '1.5 cups pure coconut water',
      '1/2 squeeze fresh lemon juice',
    ],
    steps: [
      'Pour chilled coconut water into high-speed blender.',
      'Add beetroot chunks, frozen berries, and protein powder.',
      'Blend on high speed for 60 seconds until completely velvety.',
      'Serve chilled over ice 2–3 hours before race or hard interval efforts.',
    ],
  },
  {
    id: 'steak',
    title: 'Grass-Fed Sirloin & Sweet Potato Mash',
    shortTitle: 'Sirloin & Mash',
    tag: 'Deep Repair',
    tagColor: '#ea580c',
    prepTime: '25m',
    difficulty: 'Medium',
    calories: 680,
    carbs: 58,
    protein: 48,
    fats: 18,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80',
    summary: 'High-density protein and complex carbohydrate combo with bioavailable heme iron and zinc for rapid red blood cell regeneration.',
    proTip: 'Perfect post-long weekend workout dinner to rebuild micro-tears and restore central nervous system drive.',
    ingredients: [
      '6 oz grass-fed top sirloin steak',
      '1 large roasted Japanese or garnet sweet potato',
      '1 tbsp grass-fed butter or ghee',
      '1 cup steamed broccolini with garlic',
      'Fresh rosemary & sea salt',
    ],
    steps: [
      'Bake sweet potato at 400°F (200°C) until tender, then mash with grass-fed butter and sea salt.',
      'Season sirloin with salt, pepper, and fresh rosemary.',
      'Sear steak in a smoking-hot cast iron skillet for 3 minutes per side for medium-rare.',
      'Let steak rest for 5 minutes to lock in juices, slice thinly, and serve over warm sweet potato mash.',
    ],
  },
  {
    id: 'turmeric',
    title: 'Golden Turmeric Sleep Chia Pudding',
    shortTitle: 'Golden Chia',
    tag: 'Night Sleep',
    tagColor: '#d97706',
    prepTime: '10m',
    difficulty: 'Easy',
    calories: 290,
    carbs: 38,
    protein: 12,
    fats: 14,
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&auto=format&fit=crop&q=80',
    summary: 'Curcumin-infused nighttime treat that suppresses systemic inflammation, settles digestion, and promotes deep slow-wave restorative sleep.',
    proTip: 'Piperine (black pepper) boosts curcumin absorption by 2000%, maximizing cellular recovery while you sleep.',
    ingredients: [
      '3 tbsp organic chia seeds',
      '1 cup warm unsweetened cashew or almond milk',
      '1/2 tsp ground turmeric & pinch of black pepper',
      '1/4 tsp ground ginger & cinnamon',
      '1 tbsp pure amber maple syrup',
      '1 tbsp toasted coconut flakes',
    ],
    steps: [
      'In a mason jar, whisk together chia seeds, warm milk, turmeric, cinnamon, ginger, black pepper, and maple syrup.',
      'Let sit for 10 minutes, stir once more to prevent clumping, then chill in fridge for at least 2 hours.',
      'Top with toasted coconut flakes before enjoying 60 minutes prior to bedtime.',
    ],
  },
];

export default function LongevityDashboardScreen({ onOpenCoach, xp, setXp }) {
  // Dynamic Interactive States
  const [waterAmount, setWaterAmount] = useState(2.4);
  const [waterLogged, setWaterLogged] = useState(false);
  const [calories, setCalories] = useState(1840);
  const [carbs, setCarbs] = useState(232);
  const [protein, setProtein] = useState(110);
  const [fats, setFats] = useState(42);

  const [showAllRecipes, setShowAllRecipes] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const handleAddWater = () => {
    setWaterAmount((prev) => +(prev + 0.25).toFixed(2));
    setWaterLogged(true);
    setXp?.((prev) => prev + 10);
    setTimeout(() => setWaterLogged(false), 1600);
  };

  const calorieTarget = 2650;
  const calPercent = Math.min(Math.round((calories / calorieTarget) * 100), 100);
  const calLeft = Math.max(calorieTarget - calories, 0);

  const displayedRecipes = showAllRecipes ? RECIPES_DATA : RECIPES_DATA.slice(0, 2);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 1. Top Hero Header & Race Phase Badge */}
      <View style={styles.headerSection}>
        <View style={styles.badgeRow}>
          <View style={styles.phasePill}>
            <MaterialCommunityIcons name="dumbbell" size={13} color="#9d4300" />
            <Text style={styles.phasePillText}>HYROX BUILD</Text>
          </View>

          <View style={styles.dietPill}>
            <Ionicons name="flash" size={13} color="#00685f" />
            <Text style={styles.dietPillText}>High Carb</Text>
          </View>
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.mainTitle}>Recovery</Text>
          <Text style={styles.targetSub}>Target: {calorieTarget.toLocaleString()} kcal</Text>
        </View>
      </View>

      {/* 2. Calorie & Macro Target Card (Bento Box) */}
      <View style={styles.bentoCard}>
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

          {/* Quick Hydration Logger */}
          <TouchableOpacity
            style={[styles.hydrationBtn, waterLogged && styles.hydrationBtnSuccess]}
            onPress={handleAddWater}
            activeOpacity={0.8}
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
          </TouchableOpacity>
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
      </View>

      {/* 3. Performance Recipes Section */}
      <View style={styles.sectionWrap}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionHeadingRow}>
            <Text style={styles.sectionHeading}>Performance Recipes</Text>
            <View style={styles.recipeCountBadge}>
              <Text style={styles.recipeCountText}>{RECIPES_DATA.length} Total</Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowAllRecipes(!showAllRecipes)}
            style={styles.seeAllBtn}
          >
            <Text style={styles.seeAllLink}>
              {showAllRecipes ? 'Show Less ↑' : 'See All (6) →'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.tapTipText}>Tap any recipe card to view ingredients & cooking steps 📖</Text>

        <View style={styles.recipesGrid}>
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
      </View>

      {/* Recipe Detail Modal */}
      <Modal
        visible={!!selectedRecipe}
        animationType="slide"
        transparent={false}
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
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  headerSection: {
    gap: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  phasePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffdbca',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 14,
    borderBottomWidth: 2,
    borderBottomColor: '#ffb690',
  },
  phasePillText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#9d4300',
    letterSpacing: 0.5,
  },
  dietPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e2e7ff',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 14,
  },
  dietPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#131b2e',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#131b2e',
    letterSpacing: -0.4,
  },
  targetSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3d4947',
  },
  bentoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#131b2e',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    gap: 12,
  },
  bentoTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gaugeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  gaugeWrap: {
    position: 'relative',
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeCenterText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugePercent: {
    fontSize: 12,
    fontWeight: '900',
    color: '#00685f',
  },
  calInfoGroup: {
    gap: 2,
  },
  calNumbersRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  calIntake: {
    fontSize: 18,
    fontWeight: '900',
    color: '#131b2e',
  },
  calTarget: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  calLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  calLeftText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ea580c',
  },
  hydrationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#c9e6ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#89ceff',
  },
  hydrationBtnSuccess: {
    backgroundColor: '#89f5e7',
    borderBottomColor: '#6bd8cb',
  },
  hydrationText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#00628d',
  },
  hydrationTextSuccess: {
    color: '#00685f',
  },
  hydrationAddChip: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 2,
  },
  hydrationAddText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#00628d',
  },
  macroGrid: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#f2f3ff',
    paddingTop: 10,
  },
  macroCol: {
    flex: 1,
    backgroundColor: '#f2f3ff',
    borderRadius: 12,
    padding: 8,
    gap: 4,
  },
  macroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  macroLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  macroVal: {
    fontSize: 13,
    fontWeight: '900',
    color: '#131b2e',
  },
  macroMax: {
    fontSize: 9,
    fontWeight: '500',
    color: '#64748b',
  },
  progressBarBg: {
    height: 5,
    backgroundColor: '#e2e7ff',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 2,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  sectionWrap: {
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '900',
    color: '#131b2e',
    letterSpacing: -0.3,
  },
  recipeCountBadge: {
    backgroundColor: '#e2e7ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  recipeCountText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00685f',
  },
  seeAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  seeAllLink: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00685f',
  },
  tapTipText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
    marginTop: -4,
  },
  recipesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  recipeCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    gap: 6,
  },
  recipeImageWrap: {
    position: 'relative',
    height: 96,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#e2e7ff',
  },
  recipeImage: {
    width: '100%',
    height: '100%',
  },
  recipeTagBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#ffffff',
  },
  timeTag: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  timeTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#131b2e',
  },
  recipeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#131b2e',
  },
  recipeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  macroBadgeOrange: {
    backgroundColor: '#ffdbca',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  macroBadgeOrangeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#9d4300',
  },
  macroBadgeTeal: {
    backgroundColor: '#89f5e7',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  macroBadgeTealText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#00685f',
  },
  recipeCalories: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
    marginLeft: 'auto',
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#131b2e',
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  modalScrollContent: {
    paddingBottom: 40,
  },
  modalImageContainer: {
    position: 'relative',
    height: 220,
    width: '100%',
    backgroundColor: '#e2e7ff',
  },
  modalHeroImage: {
    width: '100%',
    height: '100%',
  },
  modalTagBadge: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modalTagText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
  },
  modalBodyGroup: {
    padding: 18,
    gap: 16,
  },
  modalRecipeTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#131b2e',
    letterSpacing: -0.4,
  },
  modalSummary: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    fontWeight: '500',
  },
  modalMacroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  modalMacroCol: {
    alignItems: 'center',
    gap: 2,
  },
  modalMacroVal: {
    fontSize: 17,
    fontWeight: '900',
    color: '#131b2e',
  },
  modalMacroLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  modalMacroDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#e2e8f0',
  },
  coachTipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fffbeb',
    borderRadius: 16,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  coachTipTextWrap: {
    flex: 1,
    gap: 2,
  },
  coachTipTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#92400e',
  },
  coachTipText: {
    fontSize: 12,
    color: '#78350f',
    lineHeight: 18,
    fontWeight: '500',
  },
  detailSectionWrap: {
    gap: 10,
    marginTop: 4,
  },
  sectionIconTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#131b2e',
  },
  ingredientList: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00685f',
  },
  ingredientText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
    flex: 1,
  },
  stepsList: {
    gap: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  stepNumberCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00685f',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#ffffff',
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
    lineHeight: 19,
    fontWeight: '500',
  },
});
