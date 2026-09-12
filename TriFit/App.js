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
import CoachMayaTour from './src/components/CoachMayaTour';
import ActiveRunModal from './src/components/ActiveRunModal';
import AthleteProfileModal from './src/components/AthleteProfileModal';
import AuthModal from './src/components/AuthModal';
import TrainingScheduleScreen, { getSportTrainingPlan } from './src/screens/TrainingScheduleScreen';
import ProgressDashboardScreen from './src/screens/ProgressDashboardScreen';
import { COLORS } from './src/theme';
import API_BASE_URL from './src/config';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState('today');
  const [coachVisible, setCoachVisible] = useState(false);
  const [tourVisible, setTourVisible] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const [runVisible, setRunVisible] = useState(false);
  const [authVisible, setAuthVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [xp, setXp] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [selectedDay, setSelectedDay] = useState(12);
  const [trainingPlan, setTrainingPlan] = useState(null);
  const [adaptedPlan, setAdaptedPlan] = useState(null);
  const [dbEvents, setDbEvents] = useState([]);
  const activeUsernameRef = React.useRef(null);
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    race_type: '',
    race_date: '',
  });

  const fetchDbEvents = async (usernameOverride) => {
    const username = usernameOverride || currentUser?.username;
    if (!username) {
      setDbEvents([]);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/events?username=${username}&month=9`);
      const data = await res.json();
      if (data.success && data.events && activeUsernameRef.current === username) {
        setDbEvents(data.events);
      }
    } catch (e) {
      console.log('Fetch DB events fallback:', e?.message || e);
    }
  };

  React.useEffect(() => {
    if (isLoggedIn) {
      activeUsernameRef.current = currentUser?.username || null;
      fetchDbEvents(currentUser?.username);
    }
  }, [isLoggedIn, currentUser?.username]);

  React.useEffect(() => {
    if (!isLoggedIn) return;
    const fetchSharedPlan = async () => {
      const username = currentUser?.username || 'DemoAccount';
      try {
        let res = await fetch(`${API_BASE_URL}/api/plan/current?username=${username}`);
        let data = await res.json();
        if (data.success && data.plan?.plan_data) {
          setTrainingPlan(data.plan.plan_data);
          return;
        }
      } catch (e) {
        console.log('Could not fetch shared plan from backend:', e?.message || e);
      }
      const race = userProfile?.race_type || 'Hyrox Open / Pro';
      const date = userProfile?.race_date || 'November 15, 2026';
      setTrainingPlan(getSportTrainingPlan(race, date));
    };
    fetchSharedPlan();
  }, [isLoggedIn, currentUser?.username, userProfile?.race_type]);

  const fetchUserStats = async (username) => {
    if (!username) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/user-stats?username=${encodeURIComponent(username)}`);
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
      console.log('Error fetching user stats:', e?.message || e);
    }
  };

  const handleUpdateProfile = (updated) => {
    setUserProfile((prev) => ({ ...prev, ...updated }));
    if (updated.name) {
      setCurrentUser((prev) => (prev ? { ...prev, name: updated.name, username: updated.name } : prev));
    }
    if (updated.xp !== undefined) {
      setXp(updated.xp);
    }
    if (updated.streak_days !== undefined) {
      setStreakDays(updated.streak_days);
    }
  };

  const handleLoginSuccess = async (userData) => {
    const name = userData?.username || userData?.name || userData?.email?.split('@')[0] || '';
    const email = userData?.email || '';
    activeUsernameRef.current = userData?.username || name;

    setUserProfile({
      name,
      email,
      race_type: '',
      race_date: '',
    });
    setCurrentUser(userData || { username: name, email });
    setIsLoggedIn(true);
    setDbEvents([]);

    if (userData?.isDemo) {
      // Seed demo stats directly — no backend call needed
      setXp(userData.user?.xp || 2450);
      setStreakDays(userData.user?.streak_days || 7);
      setUserProfile({
        name: 'DemoAccount',
        email: 'demo@trifit.io',
        race_type: 'Hyrox Open',
        race_date: '2026-11-20',
        fitness_level: 'Train regularly',
        training_days: 5,
        equipment: ['Running shoes', 'Gym access', 'Smart watch'],
        baseline_metrics: {
          vo2_max: 54.2,
          swim_pace: '1:48 / 100m',
          run_pace: '4:12 / km',
        },
        resting_hr: 52,
        is_demo: true,
      });
    } else {
      await fetchUserStats(userData?.username || name);
    }
    fetchDbEvents(userData?.username || name);

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
    setTourVisible(false);
    setIsLoggedIn(false);
    setCurrentUser(null);
    activeUsernameRef.current = null;
    setNeedsOnboarding(false);
    setXp(0);
    setStreakDays(0);
    setDbEvents([]);
    setUserProfile({ name: '', email: '', race_type: '', race_date: '' });
  };

  const handleFinishRun = async () => {
    const username = currentUser?.username || 'DemoAccount';
    try {
      const res = await fetch(`${API_BASE_URL}/api/events/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          day_number: 12,
          event_date: '2026-09-12',
          xp_awarded: 120,
        }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setXp(data.user.xp);
        setStreakDays(data.user.streak_days);
      } else {
        setXp((prev) => prev + 120);
        setStreakDays((prev) => (prev === 0 ? 1 : prev));
      }
    } catch (err) {
      console.log('Error completing event from run modal:', err?.message || err);
      setXp((prev) => prev + 120);
      setStreakDays((prev) => (prev === 0 ? 1 : prev));
    } finally {
      fetchDbEvents();
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
          onComplete={() => {
            setNeedsOnboarding(false);
            setActiveTab('today');
            setTourVisible(true);
          }}
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
            trainingPlan={trainingPlan}
            adaptedPlan={adaptedPlan}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            onUpdatePlan={setTrainingPlan}
            onUpdateAdaptedPlan={setAdaptedPlan}
            onStartRun={() => setRunVisible(true)}
            onOpenCoach={() => setCoachVisible(true)}
            onNavigateToSchedule={() => setActiveTab('schedule')}
            xp={xp}
            setXp={setXp}
            streakDays={streakDays}
            dbEvents={dbEvents}
            onRefreshEvents={fetchDbEvents}
            onUpdateProfile={handleUpdateProfile}
          />
        )}
        {activeTab === 'schedule' && (
          <TrainingScheduleScreen
            currentUser={currentUser}
            userProfile={userProfile}
            trainingPlan={trainingPlan}
            adaptedPlan={adaptedPlan}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            onUpdatePlan={setTrainingPlan}
            onUpdateAdaptedPlan={setAdaptedPlan}
            onUpdateProfile={handleUpdateProfile}
            onStartWorkout={() => setRunVisible(true)}
            onOpenCoach={() => setCoachVisible(true)}
            dbEvents={dbEvents}
            onRefreshEvents={fetchDbEvents}
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
        setActiveTab={(tab) => {
          // Stop any playing voiceover when switching tabs
          if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
          }
          setCoachVisible(false);
          setActiveTab(tab);
        }}
        onOpenCoach={() => setCoachVisible(true)}
      />

      {/* Coach-led quick tour shown only after new-account onboarding */}
      <CoachMayaTour
        visible={tourVisible}
        athleteName={currentUser?.name || currentUser?.username}
        onNavigate={setActiveTab}
        onFinish={() => {
          setTourVisible(false);
          setActiveTab('today');
        }}
      />

      {/* Athlete Profile Page Modal */}
      <AthleteProfileModal
        visible={profileVisible}
        onClose={() => setProfileVisible(false)}
        onLogout={handleLogout}
        userProfile={userProfile}
        onUpdateProfile={handleUpdateProfile}
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
