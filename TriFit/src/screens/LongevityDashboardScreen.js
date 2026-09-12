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
  TextInput,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme';
import { PopInView, ScrollPopView, BouncyButton } from '../components/AnimatedComponents';

const RECIPES_DATA = [
  // --- 6 VEGETARIAN RECIPES ---
  {
    id: 'glycogen',
    title: 'Glycogen Loading Bowl',
    shortTitle: 'Glycogen Bowl',
    tag: 'Pre-Run',
    tagColor: '#fd761a',
    isVeg: true,
    diet: 'veg',
    dietLabel: 'Veg',
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
    id: 'quinoa',
    title: 'Citrus Quinoa & Feta Electrolyte Salad',
    shortTitle: 'Citrus Quinoa',
    tag: 'Hydration',
    tagColor: '#00628d',
    isVeg: true,
    diet: 'veg',
    dietLabel: 'Veg',
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
    isVeg: true,
    diet: 'veg',
    dietLabel: 'Veg',
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
      '1 scoop vanilla plant or whey protein isolate',
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
    id: 'turmeric',
    title: 'Golden Turmeric Sleep Chia Pudding',
    shortTitle: 'Golden Chia',
    tag: 'Night Sleep',
    tagColor: '#d97706',
    isVeg: true,
    diet: 'veg',
    dietLabel: 'Veg',
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
  {
    id: 'tofu_soba',
    title: 'Crispy Sesame Tofu & Edamame Soba Bowl',
    shortTitle: 'Tofu Soba Bowl',
    tag: 'Plant Power',
    tagColor: '#059669',
    isVeg: true,
    diet: 'veg',
    dietLabel: 'Veg',
    prepTime: '18m',
    difficulty: 'Medium',
    calories: 530,
    carbs: 72,
    protein: 32,
    fats: 12,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80',
    summary: 'Fast-absorbing plant amino acid profile with 100% buckwheat slow carbs and anti-inflammatory ginger tamari glaze.',
    proTip: 'Soba noodles have a low glycemic index and provide rutin to protect capillaries during high-volume endurance weeks.',
    ingredients: [
      '1 bundle (80g) 100% Japanese buckwheat soba noodles',
      '6 oz organic extra-firm tofu, cubed & pan-crisped',
      '1/2 cup shelled organic edamame',
      '1 cup shredded purple cabbage & grated carrot',
      '1 tbsp toasted sesame oil & low-sodium tamari',
      '1 tsp freshly grated ginger & toasted white sesame seeds',
    ],
    steps: [
      'Boil soba noodles for 4 minutes, drain and rinse thoroughly in cold water to stop cooking.',
      'Pan-sear cubed tofu in sesame oil over medium-high heat until golden and crispy on all sides (6-7 mins).',
      'Toss noodles with tamari, ginger, and sesame oil.',
      'Assemble bowl with cold soba, crispy tofu, edamame, and crunchy shredded cabbage. Garnish with sesame seeds.',
    ],
  },
  {
    id: 'lentil_dahl',
    title: 'Golden Sweet Potato & Red Lentil Dahl',
    shortTitle: 'Lentil Dahl Bowl',
    tag: 'Deep Fuel',
    tagColor: '#b45309',
    isVeg: true,
    diet: 'veg',
    dietLabel: 'Veg',
    prepTime: '22m',
    difficulty: 'Easy',
    calories: 510,
    carbs: 84,
    protein: 24,
    fats: 9,
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&auto=format&fit=crop&q=80',
    summary: 'Rich in plant iron, bioavailable folate, and sustained complex starches for overnight glycogen replenishment.',
    proTip: 'Red split lentils cook quickly and provide sustained BCAAs without gastric heaviness before long-distance runs.',
    ingredients: [
      '3/4 cup red split lentils (rinsed)',
      '1 medium roasted sweet potato, diced',
      '1/2 cup light coconut milk & 1.5 cups vegetable broth',
      '1 cup fresh baby spinach leaves',
      '1 tsp cumin, coriander, ground turmeric & mustard seeds',
      '3/4 cup steamed brown basmati rice',
    ],
    steps: [
      'Simmer red lentils and diced sweet potato in broth and coconut milk with spices for 15 minutes until creamy.',
      'Fold in fresh baby spinach during the last 2 minutes until wilted.',
      'Serve warm over a bed of steamed brown basmati rice with a squeeze of fresh lime juice.',
    ],
  },

  // --- 6 NON-VEGETARIAN RECIPES ---
  {
    id: 'salmon',
    title: 'Pan-Seared Salmon & Tart Cherry',
    shortTitle: 'Salmon & Cherry',
    tag: 'Recovery',
    tagColor: '#00685f',
    isVeg: false,
    diet: 'non_veg',
    dietLabel: 'Non-Veg',
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
    id: 'steak',
    title: 'Grass-Fed Sirloin & Sweet Potato Mash',
    shortTitle: 'Sirloin & Mash',
    tag: 'Deep Repair',
    tagColor: '#ea580c',
    isVeg: false,
    diet: 'non_veg',
    dietLabel: 'Non-Veg',
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
    id: 'chicken_couscous',
    title: 'Lemon Herb Grilled Chicken & Pearl Couscous',
    shortTitle: 'Chicken Couscous',
    tag: 'Lean Muscle',
    tagColor: '#0284c7',
    isVeg: false,
    diet: 'non_veg',
    dietLabel: 'Non-Veg',
    prepTime: '20m',
    difficulty: 'Easy',
    calories: 540,
    carbs: 64,
    protein: 46,
    fats: 11,
    image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&auto=format&fit=crop&q=80',
    summary: 'Ultra-lean high biological value protein combined with light complex grains for rapid midday muscle synthesis.',
    proTip: 'High leucine content in chicken triggers mTOR pathway activation within 45 minutes of post-training consumption.',
    ingredients: [
      '6 oz organic grilled chicken breast (sliced)',
      '1 cup cooked Israeli pearl couscous',
      '1/2 cup halved sweet cherry tomatoes & English cucumber',
      '2 tbsp pitted Kalamata olives',
      '1 tbsp extra virgin olive oil & lemon juice dressing',
      'Fresh oregano, parsley & cracked black pepper',
    ],
    steps: [
      'Season chicken breast with lemon zest, dried oregano, salt, and olive oil. Grill for 6 minutes per side until 165°F.',
      'Cook pearl couscous in vegetable broth for 10 minutes until tender.',
      'Fold diced tomatoes, cucumber, olives, and herbs into the warm couscous.',
      'Top with sliced grilled chicken breast and a drizzle of lemon-herb dressing.',
    ],
  },
  {
    id: 'turkey_boat',
    title: 'Smoked Turkey & Avocado Sweet Potato Boat',
    shortTitle: 'Turkey Sweet Potato',
    tag: 'Post-Workout',
    tagColor: '#d97706',
    isVeg: false,
    diet: 'non_veg',
    dietLabel: 'Non-Veg',
    prepTime: '15m',
    difficulty: 'Easy',
    calories: 490,
    carbs: 52,
    protein: 38,
    fats: 15,
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&auto=format&fit=crop&q=80',
    summary: 'Tryptophan-rich turkey combined with potassium-dense avocado and sweet potato to prevent post-workout cramping.',
    proTip: 'Potassium from sweet potato and monounsaturated fats stabilize cellular electrolyte balances faster than sports drinks alone.',
    ingredients: [
      '5 oz lean smoked or roasted turkey breast, diced',
      '1 large roasted baked sweet potato (split open)',
      '1/2 ripe Hass avocado, sliced',
      '1/4 cup diced sweet red bell pepper & sweet corn',
      '1 tbsp Greek yogurt lime-cilantro crema',
      'Smoked paprika & pink sea salt',
    ],
    steps: [
      'Roast whole sweet potato at 400°F (200°C) until caramelized and fork tender; slice lengthwise down the center.',
      'Lightly warm the diced turkey breast with a pinch of smoked paprika and cumin.',
      'Stuff the sweet potato boat with warm turkey, sweet peppers, and corn.',
      'Top with sliced avocado and drizzle with lime-cilantro yogurt crema.',
    ],
  },
  {
    id: 'tuna_bowl',
    title: 'Seared Yellowfin Ahi Tuna & Mango Rice Bowl',
    shortTitle: 'Seared Ahi Tuna',
    tag: 'Peak Fuel',
    tagColor: '#dc2626',
    isVeg: false,
    diet: 'non_veg',
    dietLabel: 'Non-Veg',
    prepTime: '15m',
    difficulty: 'Medium',
    calories: 520,
    carbs: 68,
    protein: 44,
    fats: 8,
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&auto=format&fit=crop&q=80',
    summary: 'Lean oceanic protein loaded with selenium and magnesium paired with fast glycogen-replenishing mango fructose.',
    proTip: 'Fructose from mango bypasses standard SGLT1 gut transporters for accelerated hepatic glycogen restoration.',
    ingredients: [
      '6 oz sushi-grade Yellowfin Ahi tuna steak',
      '1 cup steamed jasmine rice or coconut rice',
      '1/2 cup fresh diced ripe mango',
      '1/3 cup steamed edamame & pickled ginger',
      '1 tbsp low-sodium tamari soy & ponzu sauce',
      '1 tsp black and white sesame seeds for crusting',
    ],
    steps: [
      'Coat tuna steak in sesame seeds, sea salt, and black pepper.',
      'Sear in a smoking hot skillet with 1 tsp sesame oil for exactly 60 seconds per side (rare center).',
      'Slice tuna into clean 1/4-inch sashimi strips.',
      'Arrange over warm jasmine rice alongside diced mango, edamame, and pickled ginger; drizzle with ponzu.',
    ],
  },
  {
    id: 'eggs_sourdough',
    title: 'Poached Organic Eggs & Wild Smoked Salmon Toast',
    shortTitle: 'Salmon & Eggs Toast',
    tag: 'Morning Power',
    tagColor: '#4f46e5',
    isVeg: false,
    diet: 'non_veg',
    dietLabel: 'Non-Veg',
    prepTime: '12m',
    difficulty: 'Easy',
    calories: 470,
    carbs: 42,
    protein: 34,
    fats: 19,
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&auto=format&fit=crop&q=80',
    summary: 'Choline-rich egg yolks support acetylcholine neurotransmission and neuromuscular firing efficiency during tough endurance intervals.',
    proTip: 'Choline from whole organic eggs accelerates cognitive motor-unit recruitment for precision pacing.',
    ingredients: [
      '2 pasture-raised organic poached eggs',
      '3 oz wild cold-smoked Atlantic salmon',
      '2 thick slices artisan fermented sourdough bread (toasted)',
      '1/2 mashed Haas avocado with lemon',
      '1 tbsp capers & fresh microgreens',
      'Cracked black pepper & sea salt flakes',
    ],
    steps: [
      'Toast thick slices of sourdough bread until golden and crisp.',
      'Spread mashed avocado with a squeeze of fresh lemon juice across both slices.',
      'Layer wild smoked salmon ribbons over the avocado spread.',
      'Gently top with soft poached eggs, capers, microgreens, and a sprinkle of coarse sea salt flakes.',
    ],
  },
];

export default function LongevityDashboardScreen({ currentUser, userProfile, onOpenCoach, xp, setXp }) {
  // Dynamic Interactive States
  const [waterAmount, setWaterAmount] = useState(0);
  const [waterLogged, setWaterLogged] = useState(false);
  const [calories, setCalories] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [protein, setProtein] = useState(0);
  const [fats, setFats] = useState(0);
  const [loggedMeals, setLoggedMeals] = useState([]);

  const [isAddMealModalOpen, setIsAddMealModalOpen] = useState(false);
  const [isCustomMealModalOpen, setIsCustomMealModalOpen] = useState(false);
  const [addMealTab, setAddMealTab] = useState('app'); // 'app' | 'custom'
  const [customName, setCustomName] = useState('');
  const [customCals, setCustomCals] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customFats, setCustomFats] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [customDiet, setCustomDiet] = useState('veg'); // 'veg' | 'non_veg'

  const handleLogMeal = (name, calNum, carbNum, protNum, fatNum) => {
    const calsInt = parseInt(calNum, 10) || 0;
    const carbsInt = parseInt(carbNum, 10) || 0;
    const protInt = parseInt(protNum, 10) || 0;
    const fatsInt = parseInt(fatNum, 10) || 0;

    setCalories((prev) => prev + calsInt);
    setCarbs((prev) => prev + carbsInt);
    setProtein((prev) => prev + protInt);
    setFats((prev) => prev + fatsInt);
    setXp?.((prev) => prev + 25);

    setLoggedMeals((prev) => [
      {
        id: Date.now().toString(),
        name: name || 'Custom Meal',
        calories: calsInt,
        carbs: carbsInt,
        protein: protInt,
        fats: fatsInt,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      ...prev,
    ]);
  };

  const handleLogCustomMealSubmit = () => {
    if (!customName.trim() && !customCals) return;
    handleLogMeal(
      customName.trim() || 'Custom Meal',
      customCals,
      customCarbs,
      customProtein,
      customFats
    );
    setCustomName('');
    setCustomCals('');
    setCustomCarbs('');
    setCustomProtein('');
    setCustomFats('');
    setCustomNotes('');
    setIsCustomMealModalOpen(false);
    setIsAddMealModalOpen(false);
  };

  const [dietFilter, setDietFilter] = useState('ALL'); // 'ALL' | 'VEG' | 'NON_VEG'
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

  const vegCount = RECIPES_DATA.filter((r) => r.isVeg).length;
  const nonVegCount = RECIPES_DATA.filter((r) => !r.isVeg).length;

  const displayedRecipes = RECIPES_DATA.filter((item) => {
    if (dietFilter === 'VEG') return item.isVeg;
    if (dietFilter === 'NON_VEG') return !item.isVeg;
    return true;
  });


  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 1. Top Hero Header & Race Phase Badge */}
      <PopInView delay={0}>
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
      </PopInView>

      {/* 2. Calorie & Macro Target Card (Bento Box) */}
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

      {/* Logged Meals List Card */}
      {loggedMeals.length > 0 && (
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
      )}

      {/* 3. Performance Recipes Section with Scroll Pop-In */}
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

        <Text style={styles.tapTipText}>Tap any recipe card to view ingredients & cooking steps 📖</Text>

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

      {/* Full Recipe-Style Custom Meal Detail Modal */}
      <Modal
        visible={isCustomMealModalOpen}
        animationType="slide"
        transparent={false}
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
              Custom Meal & Macro Log
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
              <Text style={styles.customFieldHeading}>MACROS & CALORIES</Text>
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

      {/* Add Meal / Custom Food Modal */}
      <Modal visible={isAddMealModalOpen} transparent animationType="slide" onRequestClose={() => setIsAddMealModalOpen(false)}>
        <SafeAreaView style={styles.addMealModalOverlay}>
          <View style={styles.addMealModalCard}>
            <View style={styles.addMealModalHeader}>
              <Text style={styles.addMealModalTitle}>Log Meal & Calories</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  addMealActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 8,
  },
  addMealActionBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  loggedMealsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  loggedMealsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  loggedMealsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  loggedMealsList: {
    gap: 8,
  },
  loggedMealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  loggedMealLeft: {
    gap: 2,
  },
  loggedMealName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  loggedMealSub: {
    fontSize: 12,
    color: '#64748b',
  },
  loggedMealCalBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  loggedMealCalText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#d97706',
  },
  logRecipeDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 20,
  },
  logRecipeDetailBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  addMealModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  addMealModalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  addMealModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  addMealModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  addMealTabGroup: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  addMealTabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  addMealTabBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  addMealTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  addMealTabTextActive: {
    color: '#0f172a',
  },
  appRecipeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  appRecipeThumb: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  appRecipeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  appRecipeSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  logAppRecipeChipBtn: {
    backgroundColor: '#ccfbf1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  logAppRecipeChipText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f766e',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
    marginTop: 10,
  },
  customInput: {
    height: 44,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#0f172a',
    marginBottom: 10,
  },
  submitCustomBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  submitCustomBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
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
  dietFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 2,
  },
  dietFilterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dietFilterBtnActiveAll: {
    backgroundColor: '#131b2e',
    borderColor: '#131b2e',
  },
  dietFilterBtnActiveVeg: {
    backgroundColor: '#00685f',
    borderColor: '#00685f',
  },
  dietFilterBtnActiveNonVeg: {
    backgroundColor: '#ea580c',
    borderColor: '#ea580c',
  },
  dietFilterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  dietFilterTextActive: {
    color: '#ffffff',
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
  dietBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  vegBadgeBg: {
    backgroundColor: '#00685f',
  },
  nonVegBadgeBg: {
    backgroundColor: '#ea580c',
  },
  dietBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ffffff',
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
  modalDietBadge: {
    position: 'absolute',
    bottom: 12,
    left: 110,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modalTagText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
  },
  modalDietText: {
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
  customRecipeCard: {
    width: '48%',
    backgroundColor: '#f0fdfa',
    borderRadius: 16,
    padding: 10,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#00685f',
    gap: 8,
  },
  customRecipeImageWrap: {
    height: 110,
    borderRadius: 12,
    backgroundColor: '#ccfbf1',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  customFieldHeading: {
    fontSize: 11,
    fontWeight: '900',
    color: '#00685f',
    letterSpacing: 0.8,
    marginTop: 4,
  },
  customTitleInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#00685f',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#131b2e',
  },
  modalMacroColInput: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  macroInputField: {
    fontSize: 18,
    fontWeight: '900',
    color: '#131b2e',
    textAlign: 'center',
    paddingVertical: 4,
    minWidth: 50,
    borderBottomWidth: 1.5,
    borderBottomColor: '#cbd5e1',
  },
  customNotesInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 14,
    padding: 12,
    fontSize: 13,
    color: '#131b2e',
    textAlignVertical: 'top',
    height: 80,
  },

});
