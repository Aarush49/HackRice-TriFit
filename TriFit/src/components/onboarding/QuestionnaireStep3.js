import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import styles from '../../screens/styles/OnboardingQuestionnaireScreen.styles';

export default function QuestionnaireStep3({
  baselineNotSure,
  setBaselineNotSure,
  isTriathlon,
  isHyrox,
  swimPace,
  setSwimPace,
  bikeFtp,
  setBikeFtp,
  runPace,
  setRunPace,
  setValidationError,
}) {
  return (
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
          <Text style={styles.questionLabel}>Current 400m Swim Time (min:sec) *</Text>
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
              value={bikeFtp}
              onChangeText={(val) => {
                setValidationError('');
                setBikeFtp(val);
              }}
            />
          </View>

          <Text style={styles.questionLabel}>Current 5k or 10k Run Pace (min:sec) *</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="walk" size={18} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={styles.inputField}
              placeholder="e.g. 5:00"
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
          <Text style={styles.questionLabel}>Current 5k Run Time (min:sec) *</Text>
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
}
