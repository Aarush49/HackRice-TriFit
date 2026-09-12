import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import styles from '../../screens/styles/OnboardingQuestionnaireScreen.styles';

export default function QuestionnaireStep4({
  sleepHours,
  setSleepHours,
  stressLevel,
  setStressLevel,
  injuries,
  setInjuries,
  setValidationError,
}) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>Section 4: Recovery &amp; Lifestyle</Text>

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

      <Text style={styles.questionLabel}>Any ongoing injuries? (Optional)</Text>
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
}
