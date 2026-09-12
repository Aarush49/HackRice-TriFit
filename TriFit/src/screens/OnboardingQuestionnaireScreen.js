import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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

  const [fitnessLevel, setFitnessLevel] = useState(null);
  const [trainingDays, setTrainingDays] = useState(4);
  const [equipment, setEquipment] = useState([]);

  const [swimPace, setSwimPace] = useState('');
  const [bikeFtp, setBikeFtp] = useState('');
  const [runPace, setRunPace] = useState('');

  const [sleepHours, setSleepHours] = useState(null);
  const [stressLevel, setStressLevel] = useState(null);
  const [injuries, setInjuries] = useState('');

  const [coachStyle, setCoachStyle] = useState(null);
  const [baselineNotSure, setBaselineNotSure] = useState(false);

  const toggleEquipment = (item) => {
    setValidationError('');
    if (equipment.includes(item)) {
      setEquipment(equipment.filter((e) => e !== item));
    } else {
      setEquipment([...equipment, item]);
    }
  };

  const isTriathlon = raceType && raceType.toLowerCase().includes('triathlon');
  const isHyrox = raceType === 'Hyrox';

  const validateCurrentStep = () => {
    if (currentStep === 1) {
      if (!raceType) {
        return 'Please select what event or race you are training for.';
      }
      if (!raceDate || !raceDate.trim()) {
        return 'Please select or enter your target race date.';
      }
      if (!isFirstTime) {
        return 'Please indicate if this is your first time doing this type of event.';
      }
      if (isFirstTime === 'No' && (!previousTime || !previousTime.trim())) {
        return 'Please enter your previous best time.';
      }
    }

    if (currentStep === 2) {
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
        await fetch('http://localhost:8000/onboarding', {
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
        onComplete();
      }
    }
  };

  const handleBack = () => {
    setValidationError('');
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      // Step 1: Back returns to login page
      if (onBackToLogin) {
        onBackToLogin();
      }
    }
  };

  const renderProgressBar = () => {
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${(currentStep / totalSteps) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          Step {currentStep} of {totalSteps}
        </Text>
      </View>
    );
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>Section 1: Your Race</Text>

      <Text style={styles.questionLabel}>What are you training for? *</Text>
      <View style={styles.optionsGrid}>
        {['Hyrox', 'Sprint/Olympic Triathlon', 'Half-distance Triathlon', 'Full-distance Triathlon', 'Other'].map(
          (type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.optionCard,
                raceType === type && styles.optionCardSelected,
              ]}
              onPress={() => {
                setValidationError('');
                setRaceType(type);
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  raceType === type && styles.optionTextSelected,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>

      <Text style={styles.questionLabel}>When is race day? *</Text>
      <View style={styles.inputWrapper}>
        <Ionicons name="calendar-outline" size={18} color="#94a3b8" style={styles.inputIcon} />
        {Platform.OS === 'web' ? (
          <input
            type="date"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: 16,
              color: '#0f172a',
              backgroundColor: 'transparent',
            }}
            value={raceDate}
            onChange={(e) => {
              setValidationError('');
              setRaceDate(e.target.value);
            }}
          />
        ) : (
          <TextInput
            style={styles.inputField}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#94a3b8"
            value={raceDate}
            onChangeText={(val) => {
              setValidationError('');
              setRaceDate(val);
            }}
          />
        )}
      </View>

      <Text style={styles.questionLabel}>Is this your first time doing this type of event? *</Text>
      <View style={styles.optionsRow}>
        {['Yes', 'No'].map((ans) => (
          <TouchableOpacity
            key={ans}
            style={[
              styles.optionChip,
              isFirstTime === ans && styles.optionChipSelected,
            ]}
            onPress={() => {
              setValidationError('');
              setIsFirstTime(ans);
            }}
          >
            <Text
              style={[
                styles.optionText,
                isFirstTime === ans && styles.optionTextSelected,
              ]}
            >
              {ans}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isFirstTime === 'No' && (
        <>
          <Text style={styles.questionLabel}>What was your best previous time? *</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="timer-outline" size={18} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={styles.inputField}
              placeholder="e.g. 2:30:00"
              placeholderTextColor="#94a3b8"
              value={previousTime}
              onChangeText={(val) => {
                setValidationError('');
                setPreviousTime(val);
              }}
            />
          </View>
        </>
      )}
    </View>
  );

  const renderStep2 = () => {
    let equipOptions = ['None of these regularly'];
    if (isHyrox) equipOptions = ['Gym with sleds/kettlebells', 'Regular gym/weights only', 'Outdoor running routes', ...equipOptions];
    else if (isTriathlon) equipOptions = ['Pool', 'Bike', 'Gym/weights', 'Outdoor running routes', ...equipOptions];
    else equipOptions = ['Gym', 'Outdoor running routes', ...equipOptions];

    return (
      <View style={styles.stepContainer}>
        <Text style={styles.sectionTitle}>Section 2: Starting Point</Text>

        <Text style={styles.questionLabel}>How would you describe your current fitness level? *</Text>
        {[
          'New to structured training',
          'Train occasionally',
          'Train regularly, no race focus yet',
          'Already race-trained',
        ].map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.optionCardRow,
              fitnessLevel === level && styles.optionCardSelected,
            ]}
            onPress={() => {
              setValidationError('');
              setFitnessLevel(level);
            }}
          >
            <Text
              style={[
                styles.optionText,
                fitnessLevel === level && styles.optionTextSelected,
              ]}
            >
              {level}
            </Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.questionLabel}>How many days a week can you realistically train? ({trainingDays} days) *</Text>
        <View style={styles.daysRow}>
          {[2, 3, 4, 5, 6, 7].map((num) => (
            <TouchableOpacity
              key={num}
              style={[
                styles.dayCircle,
                trainingDays === num && styles.dayCircleSelected,
              ]}
              onPress={() => {
                setValidationError('');
                setTrainingDays(num);
              }}
            >
              <Text
                style={[
                  styles.dayText,
                  trainingDays === num && styles.dayTextSelected,
                ]}
              >
                {num}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.questionLabel}>Do you have access to: (Select all that apply) *</Text>
        {equipOptions.map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.optionCardRow,
              equipment.includes(item) && styles.optionCardSelected,
            ]}
            onPress={() => toggleEquipment(item)}
          >
            <View style={[
              styles.checkbox,
              equipment.includes(item) && styles.checkboxChecked,
            ]}>
              {equipment.includes(item) && <Ionicons name="checkmark" size={16} color="#ffffff" />}
            </View>
            <Text
              style={[
                styles.optionText,
                equipment.includes(item) && styles.optionTextSelected,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>Section 3: Baseline Numbers</Text>
      <Text style={styles.stepSubtitle}>Let's get an idea of where you are right now.</Text>

      {/* Not sure toggle */}
      <TouchableOpacity
        style={[styles.notSureBtn, baselineNotSure && styles.notSureBtnActive]}
        onPress={() => {
          setValidationError('');
          setBaselineNotSure(!baselineNotSure);
        }}
      >
        <Ionicons
          name={baselineNotSure ? 'checkmark-circle' : 'help-circle-outline'}
          size={20}
          color={baselineNotSure ? '#0d9488' : '#94a3b8'}
        />
        <Text style={[styles.notSureText, baselineNotSure && styles.notSureTextActive]}>
          Not sure / I'll figure it out later
        </Text>
      </TouchableOpacity>

      {baselineNotSure ? (
        <View style={styles.notSureCard}>
          <Text style={styles.notSureCardEmoji}>👍</Text>
          <Text style={styles.notSureCardTitle}>No problem!</Text>
          <Text style={styles.notSureCardText}>
            We'll start you off with a beginner-friendly baseline and adjust your plan as we learn more about you through your check-ins.
          </Text>
        </View>
      ) : isTriathlon ? (
        <>
          <Text style={styles.questionLabel}>Current 400m Swim Time (estimated) *</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="swim" size={18} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={styles.inputField}
              placeholder="e.g. 7:30"
              placeholderTextColor="#94a3b8"
              value={swimPace}
              onChangeText={(val) => {
                setValidationError('');
                setSwimPace(val);
              }}
            />
          </View>
          <Text style={styles.questionLabel}>Current Cycling FTP or 20min Power (watts) *</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="bicycle" size={18} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={styles.inputField}
              placeholder="e.g. 220"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              value={bikeFtp}
              onChangeText={(val) => {
                setValidationError('');
                setBikeFtp(val);
              }}
            />
          </View>
          <Text style={styles.questionLabel}>Current 5k or 10k Run Pace *</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="walk" size={18} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={styles.inputField}
              placeholder="e.g. 5:00 /km"
              placeholderTextColor="#94a3b8"
              value={runPace}
              onChangeText={(val) => {
                setValidationError('');
                setRunPace(val);
              }}
            />
          </View>
        </>
      ) : isHyrox ? (
        <>
          <Text style={styles.questionLabel}>Current 5k Run Time *</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="walk" size={18} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={styles.inputField}
              placeholder="e.g. 24:00"
              placeholderTextColor="#94a3b8"
              value={runPace}
              onChangeText={(val) => {
                setValidationError('');
                setRunPace(val);
              }}
            />
          </View>
          <Text style={styles.questionLabel}>Strength Baseline: Wall Balls / Sled Push (describe briefly) *</Text>
          <View style={[styles.inputWrapper, { height: 80, alignItems: 'flex-start', paddingTop: 10 }]}>
            <TextInput
              style={[styles.inputField, { textAlignVertical: 'top' }]}
              placeholder="e.g. comfortable with 20lb wall balls"
              placeholderTextColor="#94a3b8"
              multiline
              value={bikeFtp}
              onChangeText={(val) => {
                setValidationError('');
                setBikeFtp(val);
              }}
            />
          </View>
        </>
      ) : (
        <>
          <Text style={styles.questionLabel}>Any baseline metrics you want to track? (Pace, weight, etc.) *</Text>
          <View style={[styles.inputWrapper, { height: 80, alignItems: 'flex-start', paddingTop: 10 }]}>
            <TextInput
              style={[styles.inputField, { textAlignVertical: 'top' }]}
              placeholder="Enter your current baseline numbers here..."
              placeholderTextColor="#94a3b8"
              multiline
              value={runPace}
              onChangeText={(val) => {
                setValidationError('');
                setRunPace(val);
              }}
            />
          </View>
        </>
      )}
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>Section 4: Recovery & Lifestyle</Text>

      <Text style={styles.questionLabel}>Average hours of sleep per night *</Text>
      <View style={styles.optionsRow}>
        {['< 6', '6-7', '7-8', '8+'].map((hrs) => (
          <TouchableOpacity
            key={hrs}
            style={[
              styles.optionChip,
              sleepHours === hrs && styles.optionChipSelected,
            ]}
            onPress={() => {
              setValidationError('');
              setSleepHours(hrs);
            }}
          >
            <Text
              style={[
                styles.optionText,
                sleepHours === hrs && styles.optionTextSelected,
              ]}
            >
              {hrs}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.questionLabel}>Overall life stress level *</Text>
      {[
        'Low - Lots of time to recover',
        'Moderate - Standard work/life balance',
        'High - Demanding schedule/stress',
      ].map((lvl) => (
        <TouchableOpacity
          key={lvl}
          style={[
            styles.optionCardRow,
            stressLevel === lvl && styles.optionCardSelected,
          ]}
          onPress={() => {
            setValidationError('');
            setStressLevel(lvl);
          }}
        >
          <Text
            style={[
              styles.optionText,
              stressLevel === lvl && styles.optionTextSelected,
            ]}
          >
            {lvl}
          </Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.questionLabel}>Any ongoing injuries or niggles? (Optional)</Text>
      <View style={[styles.inputWrapper, { height: 80, alignItems: 'flex-start', paddingTop: 10 }]}>
        <TextInput
          style={[styles.inputField, { textAlignVertical: 'top' }]}
          placeholder="e.g. tight right calf, previous knee surgery, or none"
          placeholderTextColor="#94a3b8"
          multiline
          value={injuries}
          onChangeText={setInjuries}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          {renderProgressBar()}
        </View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
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
                  : 'Next'}
              </Text>
              <Ionicons
                name={currentStep === totalSteps ? 'checkmark-circle' : 'arrow-forward'}
                size={18}
                color="#ffffff"
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#FAF9F6',
  },
  progressContainer: {
    marginBottom: 10,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0d9488',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textAlign: 'right',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  stepContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 20,
  },
  questionLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334155',
    marginTop: 24,
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  optionCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  optionCardSelected: {
    borderColor: '#0d9488',
    backgroundColor: '#f0fdfa',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  optionTextSelected: {
    color: '#0f766e',
    fontWeight: '700',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionChip: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  optionChipSelected: {
    borderColor: '#0d9488',
    backgroundColor: '#f0fdfa',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 50,
  },
  inputIcon: {
    marginRight: 8,
  },
  inputField: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    paddingVertical: 0,
    outlineStyle: 'none',
    outlineWidth: 0,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleSelected: {
    borderColor: '#0d9488',
    backgroundColor: '#0d9488',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748b',
  },
  dayTextSelected: {
    color: '#ffffff',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#0d9488',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#0d9488',
    borderColor: '#0d9488',
  },
  summaryBox: {
    backgroundColor: '#f0fdfa',
    borderRadius: 20,
    padding: 20,
    marginTop: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccfbf1',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#134e4a',
    marginTop: 12,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#0f766e',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FAF9F6',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    alignItems: 'center',
  },
  navBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  navBtnDisabled: {
    opacity: 0.5,
  },
  navBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748b',
  },
  nextBtn: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    marginLeft: 10,
  },
  nextGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  notSureBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 10,
  },
  notSureBtnActive: {
    borderColor: '#0d9488',
    backgroundColor: '#f0fdfa',
  },
  notSureText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
  },
  notSureTextActive: {
    color: '#0f766e',
    fontWeight: '700',
  },
  notSureCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 24,
    marginTop: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  notSureCardEmoji: {
    fontSize: 32,
    marginBottom: 10,
  },
  notSureCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 8,
  },
  notSureCardText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
  nextBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  validationErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#fca5a5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 8,
  },
  validationErrorText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
});
