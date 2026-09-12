import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar, Platform } from 'react-native';
import Header from './src/components/Header';
import BottomNav from './src/components/BottomNav';
import DailyMissionsScreen from './src/screens/DailyMissionsScreen';
import OnboardingQuestionnaireScreen from './src/screens/OnboardingQuestionnaireScreen';
import LongevityDashboardScreen from './src/screens/LongevityDashboardScreen';
import LoginScreen from './src/screens/LoginScreen';
import SplashScreen from './src/screens/SplashScreen';
import CoachMayaModal from './src/components/CoachMayaModal';
import ActiveRunModal from './src/components/ActiveRunModal';
import AthleteProfileModal from './src/components/AthleteProfileModal';
import AuthModal from './src/components/AuthModal';
import TrainingScheduleScreen from './src/screens/TrainingScheduleScreen';
import ProgressDashboardScreen from './src/screens/ProgressDashboardScreen';
import { COLORS } from './src/theme';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState('today');
  const [coachVisible, setCoachVisible] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const [runVisible, setRunVisible] = useState(false);
  const [authVisible, setAuthVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [xp, setXp] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    race_type: '',
    race_date: '',
  });

  const fetchUserStats = async (username) => {
    if (!username) return;
    try {
      const res = await fetch(`http://localhost:8000/api/user-stats?username=${encodeURIComponent(username)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setXp(data.user.xp || 0);
          setStreakDays(data.user.streak_days || 0);
          setUserProfile((prev) => ({
            ...prev,
            name: data.user.username || data.user.email?.split('@')[0] || 'Athlete',
            email: data.user.email || '',
            race_type: data.profile?.race_type || '',
            race_date: data.profile?.race_date || '',
            fitness_level: data.profile?.fitness_level || '',
            training_days: data.profile?.training_days || 4,
            equipment: data.profile?.equipment || [],
            baseline_metrics: data.profile?.baseline_metrics || {},
          }));
        }
      }
    } catch (e) {
      console.log('Error fetching user stats:', e);
    }
  };

  const handleLoginSuccess = async (userData) => {
    const name = userData?.username || userData?.name || userData?.email?.split('@')[0] || '';
    const email = userData?.email || '';

    setUserProfile({
      name,
      email,
      race_type: '',
      race_date: '',
    });
    setCurrentUser(userData || { username: name, email });
    setIsLoggedIn(true);

    await fetchUserStats(userData?.username || name);

    // Only show onboarding when creating a new account (signup)
    if (userData?.isSignup) {
      setNeedsOnboarding(true);
    } else {
      setNeedsOnboarding(false);
    }
    setActiveTab('today');
  };

  const handleLogout = () => {
    setProfileVisible(false);
    setCoachVisible(false);
    setIsLoggedIn(false);
    setCurrentUser(null);
    setNeedsOnboarding(false);
    setXp(0);
    setStreakDays(0);
    setUserProfile({ name: '', email: '', race_type: '', race_date: '' });
  };

  const handleFinishRun = async () => {
    setXp((prev) => prev + 120);
    setStreakDays((prev) => (prev === 0 ? 1 : prev));
    if (currentUser?.username) {
      try {
        await fetch('http://localhost:8000/api/add-xp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: currentUser.username,
            xp_to_add: 120,
            increment_streak: true,
          }),
        });
      } catch (err) {
        console.log('Error syncing run xp:', err);
      }
    }
  };

  const handleAuthSuccess = (user, authToken) => {
    setCurrentUser(user);
    setToken(authToken);
    if (user?.username) {
      fetchUserStats(user.username);
    }
  };

  // 1. Show Splash Screen first on launch
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // 2. Show Login & Sign-up Screen if not logged in
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" translucent={Platform.OS === 'android'} />
        {Platform.OS === 'web' && (
          <style>{`
            html, body, #root {
              height: 100% !important;
              min-height: 100dvh !important;
              overscroll-behavior-y: none;
            }
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
            input, textarea {
              -webkit-user-select: text !important;
              user-select: text !important;
              touch-action: manipulation !important;
              pointer-events: auto !important;
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

  // 3. Show Onboarding Questionnaire after signup
  if (needsOnboarding) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />
        <OnboardingQuestionnaireScreen
          currentUser={currentUser}
          token={token}
          onComplete={() => setNeedsOnboarding(false)}
          onBackToLogin={handleLogout}
        />
      </SafeAreaView>
    );
  }

  // 4. Main Application Dashboard
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      {Platform.OS === 'web' && (
        <style>{`
          html, body, #root {
            height: 100% !important;
            min-height: 100dvh !important;
            overscroll-behavior-y: none;
          }
        `}</style>
      )}

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
            currentUser={currentUser}
            userProfile={userProfile}
            onStartRun={() => setRunVisible(true)}
            onOpenCoach={() => setCoachVisible(true)}
            xp={xp}
            setXp={setXp}
            streakDays={streakDays}
          />
        )}
        {activeTab === 'schedule' && (
          <TrainingScheduleScreen
            currentUser={currentUser}
            userProfile={userProfile}
            onStartWorkout={() => setRunVisible(true)}
            onOpenCoach={() => setCoachVisible(true)}
          />
        )}
        {(activeTab === 'recovery' || activeTab === 'longevity') && (
          <LongevityDashboardScreen
            currentUser={currentUser}
            userProfile={userProfile}
            onOpenCoach={() => setCoachVisible(true)}
            xp={xp}
            setXp={setXp}
          />
        )}
        {activeTab === 'progress' && (
          <ProgressDashboardScreen
            currentUser={currentUser}
            userProfile={userProfile}
            xp={xp}
            streakDays={streakDays}
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
        onUpdateProfile={(updated) => {
          setUserProfile((prev) => ({ ...prev, ...updated }));
          if (updated.name) {
            setCurrentUser((prev) => (prev ? { ...prev, name: updated.name, username: updated.name } : prev));
          }
        }}
        xp={xp}
        streakDays={streakDays}
      />

      {/* Coach Maya AI Assistant Sheet */}
      <CoachMayaModal
        visible={coachVisible}
        onClose={() => setCoachVisible(false)}
        onLogout={handleLogout}
        currentUser={currentUser}
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
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0,
  },
  mainContent: {
    flex: 1,
  },
});
