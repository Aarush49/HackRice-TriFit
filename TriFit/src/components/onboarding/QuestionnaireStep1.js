import React from 'react';
import { View, Text, TouchableOpacity, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../../screens/styles/OnboardingQuestionnaireScreen.styles';

const formatRaceDateInput = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 8);

  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
};

export default function QuestionnaireStep1({
  raceType,
  setRaceType,
  raceDate,
  setRaceDate,
  isFirstTime,
  setIsFirstTime,
  previousTime,
  setPreviousTime,
  setValidationError,
}) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>Section 1: Race Details</Text>
      <Text style={styles.stepSubtitle}>Tell us about the event you want to crush.</Text>

      <Text style={styles.questionLabel}>What event are you training for? *</Text>
      <View style={styles.optionsGrid}>
        {[
          'Sprint Triathlon',
          'Olympic Triathlon',
          '70.3 Half Ironman',
          '140.6 Full Ironman',
          'Hyrox',
          'Marathon / Half Marathon',
        ].map((type) => (
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
        ))}
      </View>

      <Text style={styles.questionLabel}>When is race day? *</Text>
      <View style={styles.inputWrapper}>
        <Ionicons name="calendar-outline" size={18} color="#94a3b8" style={styles.inputIcon} />
        {Platform.OS === 'web' ? (
          <input
            type="date"
            min="2024-01-01"
            max="2099-12-31"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: 16,
              color: '#0f172a',
              backgroundColor: 'transparent',
              fontFamily: 'inherit',
            }}
            value={raceDate}
            onChange={(e) => {
              setValidationError('');
              let val = e.target.value;
              if (val) {
                const parts = val.split('-');
                if (parts[0] && parts[0].length > 4) {
                  parts[0] = parts[0].slice(0, 4);
                  val = parts.join('-');
                }
              }
              setRaceDate(val);
            }}
          />
        ) : (
          <TextInput
            style={styles.inputField}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#94a3b8"
            keyboardType="number-pad"
            maxLength={10}
            value={raceDate}
            onChangeText={(val) => {
              setValidationError('');
              setRaceDate(formatRaceDateInput(val));
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
}
