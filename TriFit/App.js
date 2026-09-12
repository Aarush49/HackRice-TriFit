import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar } from 'react-native';
import Header from './src/components/Header';
import BottomNav from './src/components/BottomNav';
import DailyMissionsScreen from './src/screens/DailyMissionsScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LongevityDashboardScreen from './src/screens/LongevityDashboardScreen';
import CoachMayaModal from './src/components/CoachMayaModal';
import ActiveRunModal from './src/components/ActiveRunModal';
import { COLORS } from './src/theme';

export default function App() {
  const [activeTab, setActiveTab] = useState('today');
  const [coachVisible, setCoachVisible] = useState(false);
  const [runVisible, setRunVisible] = useState(false);
  const [xp, setXp] = useState(420);
  const [streakDays, setStreakDays] = useState(14);

  const handleFinishRun = () => {
    setXp((prev) => prev + 120);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Main Header */}
      <Header
        onOpenCoach={() => setCoachVisible(true)}
        streakDays={streakDays}
        xpPoints={xp}
      />

      {/* Main View Area */}
      <View style={styles.mainContent}>
        {activeTab === 'today' && (
          <DailyMissionsScreen
            onStartRun={() => setRunVisible(true)}
            onOpenCoach={() => setCoachVisible(true)}
            xp={xp}
            setXp={setXp}
          />
        )}
        {activeTab === 'onboarding' && (
          <OnboardingScreen onCompletePlan={() => setActiveTab('today')} />
        )}
        {activeTab === 'longevity' && (
          <LongevityDashboardScreen
            onOpenCoach={() => setCoachVisible(true)}
            xp={xp}
            setXp={setXp}
          />
        )}
      </View>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCoach={() => setCoachVisible(true)}
      />

      {/* Coach Maya AI Assistant Sheet */}
      <CoachMayaModal visible={coachVisible} onClose={() => setCoachVisible(false)} />

      {/* Active Quest Run Overlay */}
      <ActiveRunModal
        visible={runVisible}
        onClose={() => setRunVisible(false)}
        onFinishRun={handleFinishRun}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mainContent: {
    flex: 1,
  },
});
