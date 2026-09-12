import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar, Platform } from 'react-native';
import Header from './src/components/Header';
import BottomNav from './src/components/BottomNav';
import DailyMissionsScreen from './src/screens/DailyMissionsScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import OnboardingQuestionnaireScreen from './src/screens/OnboardingQuestionnaireScreen';
import LongevityDashboardScreen from './src/screens/LongevityDashboardScreen';
import LoginScreen from './src/screens/LoginScreen';
import SplashScreen from './src/screens/SplashScreen';
import CoachMayaModal from './src/components/CoachMayaModal';
import ActiveRunModal from './src/components/ActiveRunModal';
import AthleteProfileModal from './src/components/AthleteProfileModal';
import AuthModal from './src/components/AuthModal';
import { COLORS } from './src/theme';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(true);
  const [activeTab, setActiveTab] = useState('today');
  const [coachVisible, setCoachVisible] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const [runVisible, setRunVisible] = useState(false);
  const [authVisible, setAuthVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [xp, setXp] = useState(420);
  const [streakDays, setStreakDays] = useState(14);
  const [userProfile, setUserProfile] = useState({
    name: 'Alex Rivers',
    email: 'alex@endurance.io',
  });

  const handleLoginSuccess = (userData) => {
    setUserProfile({
      name: userData?.name || 'Alex Rivers',
      email: userData?.email || 'alex@endurance.io',
    });
    setCurrentUser(userData || { name: 'Alex Rivers' });
    setIsLoggedIn(true);
    // When login is successful, they go to the questionnaire if they need it.
    setActiveTab('today');
  };

  const handleLogout = () => {
    setProfileVisible(false);
    setCoachVisible(false);
    setIsLoggedIn(false);
    setCurrentUser(null);
    // Optional: reset onboarding so they see it again if they sign up again.
    setNeedsOnboarding(true);
  };

  const handleFinishRun = () => {
    setXp((prev) => prev + 120);
  };

  const handleAuthSuccess = (user, authToken) => {
    setCurrentUser(user);
    setToken(authToken);
  };

  // 1. Show Splash Screen first on launch
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // 2. Show Login & Sign-up Screen if not logged in
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />
        {Platform.OS === 'web' && (
          <style>{`
            input,
            input:focus,
            input:active,
            input:hover,
            input:-webkit-autofill,
            input:-webkit-autofill:hover,
            input:-webkit-autofill:focus,
            input:-webkit-autofill:active,
            textarea:focus,
            select:focus,
            button:focus,
            *:focus {
              outline: none !important;
              outline-width: 0 !important;
              outline-style: none !important;
              outline-color: transparent !important;
              box-shadow: none !important;
              -webkit-tap-highlight-color: transparent !important;
            }
            input:-webkit-autofill,
            input:-webkit-autofill:hover,
            input:-webkit-autofill:focus,
            input:-webkit-autofill:active {
              -webkit-box-shadow: 0 0 0px 1000px #ffffff inset !important;
              box-shadow: 0 0 0px 1000px #ffffff inset !important;
              -webkit-text-fill-color: #0f172a !important;
              transition: background-color 50000s ease-in-out 0s;
            }
          `}</style>
        )}
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      </SafeAreaView>
    );
  }

  // 3. Show Onboarding Questionnaire after login
  if (needsOnboarding) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />
        <OnboardingQuestionnaireScreen onComplete={() => setNeedsOnboarding(false)} />
      </SafeAreaView>
    );
  }

  // 4. Main Application Dashboard
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Main Header */}
      <Header
        onOpenProfile={() => setProfileVisible(true)}
        onOpenCoach={() => setCoachVisible(true)}
        onOpenAuth={() => setAuthVisible(true)}
        currentUser={currentUser}
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

      {/* Athlete Profile Page Modal */}
      <AthleteProfileModal
        visible={profileVisible}
        onClose={() => setProfileVisible(false)}
        onLogout={handleLogout}
        userProfile={userProfile}
        xp={xp}
        streakDays={streakDays}
      />

      {/* Coach Maya AI Assistant Sheet */}
      <CoachMayaModal
        visible={coachVisible}
        onClose={() => setCoachVisible(false)}
        onLogout={handleLogout}
      />

      {/* Active Quest Run Overlay */}
      <ActiveRunModal
        visible={runVisible}
        onClose={() => setRunVisible(false)}
        onFinishRun={handleFinishRun}
      />

      {/* Login & Account Creation Modal */}
      <AuthModal
        visible={authVisible}
        onClose={() => setAuthVisible(false)}
        onAuthSuccess={handleAuthSuccess}
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
