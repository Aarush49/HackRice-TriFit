import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import API_BASE_URL from '../config';
import styles from './styles/OnboardingQuestionnaireScreen.styles';
import QuestionnaireStep1 from '../components/onboarding/QuestionnaireStep1';
import QuestionnaireStep2 from '../components/onboarding/QuestionnaireStep2';
import QuestionnaireStep3 from '../components/onboarding/QuestionnaireStep3';
import QuestionnaireStep4 from '../components/onboarding/QuestionnaireStep4';

export default function OnboardingQuestionnaireScreen({ onComplete, onBackToLogin, currentUser, token }) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [validationError, setValidationError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Answers State
  const [raceType, setRaceType] = useState(null);
  const [raceDate, setRaceDate] = useState('');
  const [isFirstTime, setIsFirstTime] = useState(null);
  const [previousTime, setPreviousTime] = useState('');

  const [age, setAge] = useState('25');
  const [fitnessLevel, setFitnessLevel] = useState(null);
  const [trainingDays, setTrainingDays] = useState(4);
  const [equipment, setEquipment] = useState([]);

  const [swimPace, setSwimPace] = useState('');
  const [bikeFtp, setBikeFtp] = useState('');
  const [runPace, setRunPace] = useState('');

  const [sleepHours, setSleepHours] = useState(null);
  const [stressLevel, setStressLevel] = useState(null);
  const [injuries, setInjuries] = useState('');

  const [baselineNotSure, setBaselineNotSure] = useState(false);

  const toggleEquipment = (item) => {
    setValidationError('');
    if (equipment.includes(item)) {
      setEquipment(equipment.filter((e) => e !== item));
    } else {
      setEquipment([...equipment, item]);
    }
  };

  const isTriathlon =
    raceType &&
    (raceType.toLowerCase().includes('triathlon') ||
      raceType.toLowerCase().includes('ironman'));
  const isHyrox = raceType === 'Hyrox';

  const validateCurrentStep = () => {
    if (currentStep === 1) {
      if (!raceType) {
        return 'Please select what event or race you are training for.';
      }
      if (!raceDate || !raceDate.trim()) {
        return 'Please select or enter your target race date.';
      }
      const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raceDate);
      if (!dateMatch) {
        return 'Please enter the race date as YYYY-MM-DD.';
      }
      const [, yearText, monthText, dayText] = dateMatch;
      const year = Number(yearText);
      const month = Number(monthText);
      const day = Number(dayText);
      const parsedDate = new Date(Date.UTC(year, month - 1, day));
      const isValidDate =
        year >= 2024 &&
        year <= 2099 &&
        parsedDate.getUTCFullYear() === year &&
        parsedDate.getUTCMonth() === month - 1 &&
        parsedDate.getUTCDate() === day;
      if (!isValidDate) {
        return 'Please enter a valid race date.';
      }
      if (!isFirstTime) {
        return 'Please indicate if this is your first time doing this type of event.';
      }
      if (isFirstTime === 'No' && (!previousTime || !previousTime.trim())) {
        return 'Please enter your previous best time.';
      }
    }

    if (currentStep === 2) {
      if (!age || isNaN(parseInt(age, 10)) || parseInt(age, 10) < 14 || parseInt(age, 10) > 99) {
        return 'Please enter a valid age between 14 and 99.';
      }
      if (!fitnessLevel) {
        return 'Please select your current fitness level.';
      }
      if (!equipment || equipment.length === 0) {
        return 'Please select at least one equipment option (or "None of these regularly").';
      }
    }

    if (currentStep === 3) {
      if (!baselineNotSure) {
        if (isTriathlon) {
          if (!swimPace.trim() || !bikeFtp.trim() || !runPace.trim()) {
            return 'Please fill in your swim, bike, and run metrics (or tap "Not sure").';
          }
        } else if (isHyrox) {
          if (!runPace.trim() || !bikeFtp.trim()) {
            return 'Please fill in your run time and strength baseline (or tap "Not sure").';
          }
        } else {
          if (!runPace.trim()) {
            return 'Please enter your baseline numbers (or tap "Not sure").';
          }
        }
      }
    }

    if (currentStep === 4) {
      if (!sleepHours) {
        return 'Please select your average hours of sleep.';
      }
      if (!stressLevel) {
        return 'Please select your overall life stress level.';
      }
    }

    return null;
  };

  const handleNext = async () => {
    const error = validateCurrentStep();
    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError('');
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Step 4 Complete: Save to TimescaleDB
      setIsSaving(true);
      const payload = {
        username: currentUser?.username || currentUser?.name,
        user_id: currentUser?.id,
        race_type: raceType,
        race_date: raceDate,
        age: age,
        is_first_time: isFirstTime,
        previous_time: previousTime || null,
        fitness_level: fitnessLevel,
        training_days: trainingDays,
        equipment: equipment,
        baseline_metrics: baselineNotSure
          ? { not_sure: true }
          : { swim_pace: swimPace, bike_ftp: bikeFtp, run_pace: runPace },
        sleep_hours: sleepHours,
        stress_level: stressLevel,
        injuries: injuries || 'None',
      };

      try {
        await fetch(`${API_BASE_URL}/onboarding`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.log('Error saving onboarding data to database:', err);
      } finally {
        setIsSaving(false);
        onComplete(payload);
      }
    }
  };

  const handleBack = () => {
    setValidationError('');
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onBackToLogin();
    }
  };

  const renderProgressBar = () => {
    const progressPercent = (currentStep / totalSteps) * 100;
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>
        <Text style={styles.progressText}>Step {currentStep} of {totalSteps}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' && (
        <style>{`
          input, textarea {
            -webkit-user-select: text !important;
            user-select: text !important;
            touch-action: manipulation !important;
            pointer-events: auto !important;
            outline: none !important;
          }
          input:focus, textarea:focus {
            outline: none !important;
            box-shadow: none !important;
          }
        `}</style>
      )}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <View style={{ flex: 1 }}>
          <View style={styles.header}>
            {renderProgressBar()}
          </View>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {currentStep === 1 && (
              <QuestionnaireStep1
                raceType={raceType}
                setRaceType={setRaceType}
                raceDate={raceDate}
                setRaceDate={setRaceDate}
                isFirstTime={isFirstTime}
                setIsFirstTime={setIsFirstTime}
                previousTime={previousTime}
                setPreviousTime={setPreviousTime}
                setValidationError={setValidationError}
              />
            )}
            {currentStep === 2 && (
              <QuestionnaireStep2
                isHyrox={isHyrox}
                isTriathlon={isTriathlon}
                age={age}
                setAge={setAge}
                fitnessLevel={fitnessLevel}
                setFitnessLevel={setFitnessLevel}
                trainingDays={trainingDays}
                setTrainingDays={setTrainingDays}
                equipment={equipment}
                toggleEquipment={toggleEquipment}
                setValidationError={setValidationError}
              />
            )}
            {currentStep === 3 && (
              <QuestionnaireStep3
                baselineNotSure={baselineNotSure}
                setBaselineNotSure={setBaselineNotSure}
                isTriathlon={isTriathlon}
                isHyrox={isHyrox}
                swimPace={swimPace}
                setSwimPace={setSwimPace}
                bikeFtp={bikeFtp}
                setBikeFtp={setBikeFtp}
                runPace={runPace}
                setRunPace={setRunPace}
                setValidationError={setValidationError}
              />
            )}
            {currentStep === 4 && (
              <QuestionnaireStep4
                sleepHours={sleepHours}
                setSleepHours={setSleepHours}
                stressLevel={stressLevel}
                setStressLevel={setStressLevel}
                injuries={injuries}
                setInjuries={setInjuries}
                setValidationError={setValidationError}
              />
            )}
          </ScrollView>

          {validationError ? (
            <View style={styles.validationErrorBanner}>
              <Ionicons name="alert-circle" size={18} color="#dc2626" />
              <Text style={styles.validationErrorText}>{validationError}</Text>
            </View>
          ) : null}

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.navBtn}
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <Text style={styles.navBtnText}>
                {currentStep === 1 ? '← Back to Login' : '← Back'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.nextBtn}
              onPress={handleNext}
              activeOpacity={0.85}
              disabled={isSaving}
            >
              <LinearGradient
                colors={['#0d9488', '#0f766e']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.nextGradient}
              >
                <Text style={styles.nextBtnText}>
                  {isSaving
                    ? 'Saving Profile...'
                    : currentStep === totalSteps
                      ? 'Complete Setup'
                      : 'Next Step →'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
