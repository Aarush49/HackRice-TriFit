import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { PopInView } from '../components/AnimatedComponents';
import RECIPES_DATA from '../data/recipesData';
import styles from './styles/LongevityDashboardScreen.styles';
import MacroTargetCard from '../components/longevity/MacroTargetCard';
import LoggedMealsCard from '../components/longevity/LoggedMealsCard';
import PerformanceRecipesSection from '../components/longevity/PerformanceRecipesSection';
import RecipeDetailModal from '../components/longevity/RecipeDetailModal';
import CustomMealDetailModal from '../components/longevity/CustomMealDetailModal';
import AddMealModal from '../components/longevity/AddMealModal';

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
          <View style={styles.titleRow}>
            <Text style={styles.mainTitle}>Recovery</Text>
            <Text style={styles.targetSub}>Target: {calorieTarget.toLocaleString()} kcal</Text>
          </View>
        </View>
      </PopInView>

      {/* 2. Calorie & Macro Target Card (Bento Box) */}
      <MacroTargetCard
        calPercent={calPercent}
        protein={protein}
        calories={calories}
        calorieTarget={calorieTarget}
        calLeft={calLeft}
        waterAmount={waterAmount}
        waterLogged={waterLogged}
        handleAddWater={handleAddWater}
        carbs={carbs}
        fats={fats}
        setIsAddMealModalOpen={setIsAddMealModalOpen}
      />

      {/* Logged Meals List Card */}
      <LoggedMealsCard loggedMeals={loggedMeals} />

      {/* 3. Performance Recipes Section with Scroll Pop-In */}
      <PerformanceRecipesSection
        displayedRecipes={displayedRecipes}
        dietFilter={dietFilter}
        setDietFilter={setDietFilter}
        vegCount={vegCount}
        nonVegCount={nonVegCount}
        setIsCustomMealModalOpen={setIsCustomMealModalOpen}
        setSelectedRecipe={setSelectedRecipe}
      />

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        selectedRecipe={selectedRecipe}
        setSelectedRecipe={setSelectedRecipe}
        handleLogMeal={handleLogMeal}
      />

      {/* Full Recipe-Style Custom Meal Detail Modal */}
      <CustomMealDetailModal
        isCustomMealModalOpen={isCustomMealModalOpen}
        setIsCustomMealModalOpen={setIsCustomMealModalOpen}
        customDiet={customDiet}
        setCustomDiet={setCustomDiet}
        customName={customName}
        setCustomName={setCustomName}
        customCals={customCals}
        setCustomCals={setCustomCals}
        customCarbs={customCarbs}
        setCustomCarbs={setCustomCarbs}
        customProtein={customProtein}
        setCustomProtein={setCustomProtein}
        customFats={customFats}
        setCustomFats={setCustomFats}
        customNotes={customNotes}
        setCustomNotes={setCustomNotes}
        handleLogCustomMealSubmit={handleLogCustomMealSubmit}
      />

      {/* Add Meal / Custom Food Modal */}
      <AddMealModal
        isAddMealModalOpen={isAddMealModalOpen}
        setIsAddMealModalOpen={setIsAddMealModalOpen}
        addMealTab={addMealTab}
        setAddMealTab={setAddMealTab}
        handleLogMeal={handleLogMeal}
        customName={customName}
        setCustomName={setCustomName}
        customCals={customCals}
        setCustomCals={setCustomCals}
        customCarbs={customCarbs}
        setCustomCarbs={setCustomCarbs}
        customProtein={customProtein}
        setCustomProtein={setCustomProtein}
        customFats={customFats}
        setCustomFats={setCustomFats}
        handleLogCustomMealSubmit={handleLogCustomMealSubmit}
        setIsCustomMealModalOpen={setIsCustomMealModalOpen}
      />
    </ScrollView>
  );
}
