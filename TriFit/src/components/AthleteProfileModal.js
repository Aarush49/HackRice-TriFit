import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme';

const RACE_OPTIONS = [
  'Sprint Triathlon',
  'Olympic Triathlon',
  '70.3 Half Ironman',
  '140.6 Full Ironman',
  'Hyrox',
  'Marathon / Half Marathon',
];

export default function AthleteProfileModal({
  visible,
  onClose,
  onLogout,
  userProfile = {},
  onUpdateProfile,
  xp = 0,
  streakDays = 0,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(userProfile?.name || 'Athlete');
  const [editEmail, setEditEmail] = useState(userProfile?.email || '');
  const [editRaceType, setEditRaceType] = useState(userProfile?.race_type || 'Hyrox');
  const [editRaceDate, setEditRaceDate] = useState(userProfile?.race_date || '2026-11-20');
  const [editVo2Max, setEditVo2Max] = useState('54.2');
  const [editBioAge, setEditBioAge] = useState('26');

  // Sync state when modal opens
  React.useEffect(() => {
    if (visible) {
      setEditName(userProfile?.name || 'Athlete');
      setEditEmail(userProfile?.email || '');
      setEditRaceType(userProfile?.race_type || 'Hyrox');
      setEditRaceDate(userProfile?.race_date || '2026-11-20');
      setIsEditing(false);
    }
  }, [visible, userProfile]);

  const handleSave = () => {
    if (onUpdateProfile) {
      onUpdateProfile({
        name: editName.trim() || 'Athlete',
        email: editEmail.trim(),
        race_type: editRaceType,
        race_date: editRaceDate,
      });
    }
    setIsEditing(false);
  };

  const name = userProfile?.name || editName || 'Athlete';
  const email = userProfile?.email || editEmail || 'Logged In Athlete';
  const targetRace = (userProfile?.race_type || editRaceType || 'Hyrox').toUpperCase();

  let daysLeftText = '68D LEFT';
  const activeRaceDate = userProfile?.race_date || editRaceDate;
  if (activeRaceDate) {
    const parsed = new Date(activeRaceDate);
    if (!isNaN(parsed.getTime())) {
      const diffDays = Math.ceil((parsed - new Date()) / (1000 * 60 * 60 * 24));
      daysLeftText = diffDays > 0 ? `${diffDays}D LEFT` : 'RACE DAY!';
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Navigation Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Athlete Profile</Text>
          <TouchableOpacity
            style={styles.editToggleBtn}
            onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isEditing ? 'checkmark' : 'pencil'}
              size={18}
              color={COLORS.primary}
            />
            <Text style={styles.editToggleText}>{isEditing ? 'Save' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Profile Header Card */}
          <LinearGradient
            colors={['#00685f', '#004d46']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileHeaderCard}
          >
            <View style={styles.avatarRow}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{
                    uri: 'https://cdn-icons-png.flaticon.com/512/847/847969.png',
                  }}
                  style={styles.avatarImage}
                />
              </View>

              <View style={styles.athleteDetails}>
                {isEditing ? (
                  <View style={styles.editInputGroup}>
                    <Text style={styles.editInputLabel}>ATHLETE NAME</Text>
                    <TextInput
                      style={styles.editTextInput}
                      value={editName}
                      onChangeText={setEditName}
                      placeholder="Your Name"
                      placeholderTextColor="rgba(255,255,255,0.6)"
                    />
                  </View>
                ) : (
                  <>
                    <Text style={styles.athleteName}>{name}</Text>
                    <Text style={styles.athleteEmail}>{email}</Text>
                    <View style={styles.tierPill}>
                      <Ionicons name="shield-checkmark" size={12} color="#89f5e7" />
                      <Text style={styles.tierText}>TriFit Athlete</Text>
                    </View>
                  </>
                )}
              </View>
            </View>

            {/* Target Event Banner / Edit Target Event */}
            {isEditing ? (
              <View style={styles.editEventSection}>
                <Text style={styles.editInputLabel}>TARGET EVENT / SPORT</Text>
                <View style={styles.raceOptionsGrid}>
                  {RACE_OPTIONS.map((race) => (
                    <TouchableOpacity
                      key={race}
                      style={[
                        styles.raceOptionChip,
                        editRaceType.toLowerCase() === race.toLowerCase() &&
                          styles.raceOptionChipSelected,
                      ]}
                      onPress={() => setEditRaceType(race)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.raceOptionText,
                          editRaceType.toLowerCase() === race.toLowerCase() &&
                            styles.raceOptionTextSelected,
                        ]}
                      >
                        {race}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.editInputLabel, { marginTop: 10 }]}>TARGET RACE DATE (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.editTextInput}
                  value={editRaceDate}
                  onChangeText={setEditRaceDate}
                  placeholder="2026-11-20"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                />
              </View>
            ) : (
              <View style={styles.eventBanner}>
                <View style={styles.eventBannerLeft}>
                  <MaterialCommunityIcons name="trophy-outline" size={18} color="#f59e0b" />
                  <View>
                    <Text style={styles.eventLabel}>NEXT TARGET RACE</Text>
                    <Text style={styles.eventName}>{targetRace}</Text>
                  </View>
                </View>
                <View style={styles.countdownBadge}>
                  <Text style={styles.countdownText}>{daysLeftText}</Text>
                </View>
              </View>
            )}

            {isEditing && (
              <View style={styles.editActionRow}>
                <TouchableOpacity
                  style={styles.saveProfileBtn}
                  onPress={handleSave}
                  activeOpacity={0.85}
                >
                  <Ionicons name="checkmark-circle" size={16} color="#004d46" />
                  <Text style={styles.saveProfileBtnText}>Save Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelEditBtn}
                  onPress={() => setIsEditing(false)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.cancelEditBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </LinearGradient>

          {/* Biometrics & Healthspan Grid (HRV Baseline removed) */}
          <Text style={styles.sectionTitle}>Biology &amp; Performance Baselines</Text>
          <View style={styles.gridContainer}>
            {/* Card 1: VO2 Max */}
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <View style={[styles.iconBox, { backgroundColor: '#e0f2fe' }]}>
                  <MaterialCommunityIcons name="lightning-bolt" size={18} color="#0284c7" />
                </View>
                <Text style={styles.metricLabel}>VO2 Max</Text>
              </View>
              <Text style={styles.metricValue}>
                {editVo2Max} <Text style={styles.metricUnit}>ml/kg</Text>
              </Text>
              <View style={styles.statusPillBlue}>
                <Text style={styles.statusPillBlueText}>Top 5% for Age</Text>
              </View>
            </View>

            {/* Card 2: Fitness / Biological Age */}
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <View style={[styles.iconBox, { backgroundColor: '#fef3c7' }]}>
                  <FontAwesome5 name="dna" size={16} color="#b45309" />
                </View>
                <Text style={styles.metricLabel}>Biological Age</Text>
              </View>
              <Text style={styles.metricValue}>
                {editBioAge} <Text style={styles.metricUnit}>yrs</Text>
              </Text>
              <View style={styles.statusPillAmber}>
                <Text style={styles.statusPillAmberText}>-4 yrs younger</Text>
              </View>
            </View>

            {/* Card 3: Streak & Consistency */}
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <View style={[styles.iconBox, { backgroundColor: '#ffdbca' }]}>
                  <MaterialCommunityIcons name="fire" size={18} color="#ea580c" />
                </View>
                <Text style={styles.metricLabel}>Streak &amp; XP</Text>
              </View>
              <Text style={styles.metricValue}>
                {streakDays}D <Text style={styles.metricUnit}>• {xp} XP</Text>
              </Text>
              <View style={styles.statusPillOrange}>
                <Text style={styles.statusPillOrangeText}>Consistent 🔥</Text>
              </View>
            </View>

            {/* Card 4: Resting Heart Rate */}
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <View style={[styles.iconBox, { backgroundColor: '#f0fdf4' }]}>
                  <Ionicons name="heart" size={18} color="#15803d" />
                </View>
                <Text style={styles.metricLabel}>Resting HR</Text>
              </View>
              <Text style={styles.metricValue}>
                48 <Text style={styles.metricUnit}>bpm</Text>
              </Text>
              <View style={styles.statusPillGreen}>
                <Text style={styles.statusPillGreenText}>Elite Athlete</Text>
              </View>
            </View>
          </View>

          {/* Personal Bests */}
          <Text style={styles.sectionTitle}>Personal Bests</Text>
          <View style={styles.pbListCard}>
            <View style={styles.pbItem}>
              <View style={styles.pbIconBox}>
                <MaterialCommunityIcons name="run" size={20} color="#0d9488" />
              </View>
              <View style={styles.pbInfo}>
                <Text style={styles.pbTitle}>5k Zone 2 Tempo Run</Text>
                <Text style={styles.pbSub}>Pace: -- / km • Log workout to set</Text>
              </View>
              <Text style={styles.pbValue}>--:--</Text>
            </View>
            <View style={styles.dividerLine} />

            <View style={styles.pbItem}>
              <View style={styles.pbIconBox}>
                <FontAwesome5 name="dumbbell" size={16} color="#0284c7" />
              </View>
              <View style={styles.pbInfo}>
                <Text style={styles.pbTitle}>Hyrox Sled Push (50m)</Text>
                <Text style={styles.pbSub}>Log workout to set PR</Text>
              </View>
              <Text style={styles.pbValue}>-- kg</Text>
            </View>
            <View style={styles.dividerLine} />

            <View style={styles.pbItem}>
              <View style={styles.pbIconBox}>
                <Ionicons name="water" size={20} color="#0ea5e9" />
              </View>
              <View style={styles.pbInfo}>
                <Text style={styles.pbTitle}>750m Open Water Swim</Text>
                <Text style={styles.pbSub}>Log workout to set PR</Text>
              </View>
              <Text style={styles.pbValue}>--:--</Text>
            </View>
          </View>

          {/* Connected Gear & Apps */}
          <Text style={styles.sectionTitle}>Connected Gear &amp; Integrations</Text>
          <View style={styles.gearCard}>
            <View style={styles.gearItem}>
              <Ionicons name="watch-outline" size={22} color="#0f172a" />
              <View style={styles.gearInfo}>
                <Text style={styles.gearName}>Garmin Forerunner 965</Text>
                <Text style={styles.gearStatus}>Connected • Auto Sync</Text>
              </View>
              <View style={styles.activeDot} />
            </View>
            <View style={styles.dividerLine} />

            <View style={styles.gearItem}>
              <Ionicons name="heart-outline" size={22} color="#e11d48" />
              <View style={styles.gearInfo}>
                <Text style={styles.gearName}>Apple HealthKit</Text>
                <Text style={styles.gearStatus}>Synced 5 mins ago</Text>
              </View>
              <View style={styles.activeDot} />
            </View>
          </View>

          {/* Bottom Action Button */}
          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.85}>
            <Ionicons name="log-out" size={18} color="#ffffff" />
            <Text style={styles.logoutBtnText}>Log Out / Switch Account</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  closeBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  editToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0fdfa',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#99f6e4',
  },
  editToggleText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  profileHeaderCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#00685f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarImage: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    borderColor: '#89f5e7',
  },
  athleteDetails: {
    flex: 1,
  },
  athleteName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
  },
  athleteEmail: {
    fontSize: 13,
    fontWeight: '500',
    color: '#89f5e7',
    marginTop: 2,
  },
  tierPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  tierText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  eventBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 16,
    padding: 12,
    marginTop: 16,
  },
  eventBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  eventLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#89f5e7',
    letterSpacing: 0.8,
  },
  eventName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  countdownBadge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countdownText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
  },

  /* Edit Mode Styles */
  editInputGroup: {
    width: '100%',
    gap: 4,
  },
  editInputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#89f5e7',
    letterSpacing: 0.5,
  },
  editTextInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(137, 245, 231, 0.4)',
  },
  editEventSection: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    gap: 6,
  },
  raceOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  raceOptionChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  raceOptionChipSelected: {
    backgroundColor: '#89f5e7',
    borderColor: '#ffffff',
  },
  raceOptionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  raceOptionTextSelected: {
    color: '#004d46',
    fontWeight: '800',
  },
  editActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
  },
  saveProfileBtn: {
    flex: 1,
    backgroundColor: '#89f5e7',
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  saveProfileBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#004d46',
  },
  cancelEditBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  cancelEditBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },

  /* Metric Cards */
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 10,
    marginTop: 6,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 6,
  },
  metricUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  statusPillBlue: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  statusPillBlueText: {
    color: '#0369a1',
    fontSize: 10,
    fontWeight: '800',
  },
  statusPillAmber: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  statusPillAmberText: {
    color: '#b45309',
    fontSize: 10,
    fontWeight: '800',
  },
  statusPillOrange: {
    backgroundColor: '#ffdbca',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  statusPillOrangeText: {
    color: '#9d4300',
    fontSize: 10,
    fontWeight: '800',
  },
  statusPillGreen: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  statusPillGreenText: {
    color: '#15803d',
    fontSize: 10,
    fontWeight: '800',
  },
  pbListCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  pbItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  pbIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  pbInfo: {
    flex: 1,
  },
  pbTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  pbSub: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748b',
    marginTop: 2,
  },
  pbValue: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0d9488',
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 4,
  },
  gearCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 24,
  },
  gearItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  gearInfo: {
    flex: 1,
  },
  gearName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  gearStatus: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748b',
    marginTop: 2,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e11d48',
    paddingVertical: 14,
    borderRadius: 18,
    gap: 8,
  },
  logoutBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
});
