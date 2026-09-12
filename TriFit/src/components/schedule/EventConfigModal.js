import React from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, StyleSheet, Platform } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../theme';
import { toISODate } from '../../utils/trainingPlanGenerator';
import styles from '../../screens/styles/TrainingScheduleScreen.styles';

export default function EventConfigModal({
  isAdjustModalOpen,
  setIsAdjustModalOpen,
  eventOptions,
  editEventText,
  setEditEventText,
  editDateText,
  setEditDateText,
  handleSaveAdjust,
}) {
  return (
    <Modal visible={isAdjustModalOpen} transparent animationType="fade" onRequestClose={() => setIsAdjustModalOpen(false)}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          activeOpacity={1}
          onPress={() => setIsAdjustModalOpen(false)}
        />
        <View
          style={styles.adjustModalCard}
          onStartShouldSetResponder={() => true}
          {...(Platform.OS === 'web' ? { onClick: (e) => e.stopPropagation() } : {})}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Adjust Target Event &amp; Date</Text>
            <TouchableOpacity onPress={() => setIsAdjustModalOpen(false)}>
              <Ionicons name="close-circle" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalSub}>
            Select a preset event or enter custom details to recalculate periodization.
          </Text>

          {/* Quick Presets */}
          <Text style={styles.modalInputLabel}>Quick Event Presets</Text>
          <View style={styles.eventOptionsList}>
            {eventOptions.map((opt, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.eventOptionCard,
                  editEventText === opt.title && styles.eventOptionCardSelected,
                ]}
                onPress={() => {
                  setEditEventText(opt.title);
                  setEditDateText(opt.date);
                }}
              >
                <View style={styles.eventOptionLeft}>
                  <View style={styles.eventOptionIconBox}>
                    <FontAwesome5 name={opt.icon} size={14} color={COLORS.primary} />
                  </View>
                  <View>
                    <Text style={styles.eventOptionTitle}>{opt.title}</Text>
                    <Text style={styles.eventOptionDate}>{opt.date} • {opt.weeks}</Text>
                  </View>
                </View>
                {editEventText === opt.title && (
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Inputs */}
          <Text style={[styles.modalInputLabel, { marginTop: 8 }]}>Or Custom Event Name</Text>
          <TextInput
            style={styles.modalInput}
            value={editEventText}
            onChangeText={setEditEventText}
            placeholder="e.g. Hyrox Open, Sprint Triathlon"
            placeholderTextColor="#94a3b8"
          />

          <Text style={styles.modalInputLabel}>Target Race Date</Text>
          {Platform.OS === 'web' ? (
            <input
              type="date"
              style={{
                width: '100%',
                height: 44,
                padding: '0 12px',
                borderRadius: 12,
                border: '1px solid #cbd5e1',
                backgroundColor: '#f8fafc',
                fontSize: 15,
                color: '#0f172a',
                marginBottom: 16,
                outline: 'none',
                boxSizing: 'border-box',
              }}
              value={toISODate(editDateText)}
              onChange={(e) => setEditDateText(e.target.value)}
            />
          ) : (
            <TextInput
              style={styles.modalInput}
              value={editDateText}
              onChangeText={setEditDateText}
              placeholder="e.g. 2026-11-15 or Nov 15, 2026"
              placeholderTextColor="#94a3b8"
            />
          )}

          <View style={styles.modalBtnRow}>
            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setIsAdjustModalOpen(false)}
            >
              <Text style={styles.modalCancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalSaveBtn}
              onPress={handleSaveAdjust}
            >
              <Text style={styles.modalSaveBtnText}>Save &amp; Adapt Plan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
