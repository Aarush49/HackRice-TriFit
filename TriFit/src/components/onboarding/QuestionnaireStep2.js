import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import styles from '../../screens/styles/OnboardingQuestionnaireScreen.styles';

export default function QuestionnaireStep2({
  isHyrox,
  isTriathlon,
  age,
  setAge,
  fitnessLevel,
  setFitnessLevel,
  trainingDays,
  setTrainingDays,
  equipment,
  toggleEquipment,
  setValidationError,
}) {
  let equipOptions = ['None of these regularly'];
  if (isHyrox) {
    equipOptions = ['Gym with sleds/kettlebells', 'Regular gym/weights only', 'Outdoor running routes', ...equipOptions];
  } else if (isTriathlon) {
    equipOptions = ['Pool', 'Bike', 'Gym/weights', 'Outdoor running routes', ...equipOptions];
  } else {
    equipOptions = ['Gym', 'Outdoor running routes', ...equipOptions];
  }

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>Section 2: Starting Point</Text>

      <Text style={styles.questionLabel}>How old are you? *</Text>
      <View style={styles.inputWrapper}>
        <MaterialCommunityIcons name="cake-variant" size={18} color="#94a3b8" style={styles.inputIcon} />
        <TextInput
          style={styles.inputField}
          placeholder="e.g. 28"
          placeholderTextColor="#94a3b8"
          keyboardType="number-pad"
          maxLength={3}
          value={age}
          onChangeText={(val) => {
            setValidationError('');
            setAge(val.replace(/[^0-9]/g, ''));
          }}
        />
        <Text style={{ fontSize: 14, color: '#64748b', paddingRight: 8 }}>years old</Text>
      </View>

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
          <View
            style={[
              styles.checkbox,
              equipment.includes(item) && styles.checkboxChecked,
            ]}
          >
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
}
