import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme';

export default function AthleteProfileModal({ visible, onClose, onLogout, userProfile = {}, xp = 0, streakDays = 0 }) {
  const name = userProfile?.name || 'Athlete';
  const email = userProfile?.email || 'Logged In Athlete';
  const targetRace = userProfile?.race_type ? userProfile.race_type.toUpperCase() : 'London Hyrox Open';

  let daysLeftText = '68D LEFT';
  if (userProfile?.race_date) {
    const parsed = new Date(userProfile.race_date);
    if (!isNaN(parsed.getTime())) {
      const diffDays = Math.ceil((parsed - new Date()) / (1000 * 60 * 60 * 24));
      daysLeftText = diffDays > 0 ? `${diffDays}D LEFT` : 'RACE DAY!';
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Athlete Profile</Text>
          <TouchableOpacity style={styles.logoutTopBtn} onPress={onLogout} activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={22} color="#e11d48" />
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
                    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCNF6DrCWxMm5Lv1YkzwT2KVsurMoDrkDXgPAkoqmIC1Hcawc03Tu0S4b5z4t8OxsjsvqazCQkgNUKUOPKGxly21xtC-gahcc4q0ouhxWImTdz35f8wcCPy33ybK6REvfjcZkTPtS-r0yOcaRp1m6dt7AfXcD3D_RYh4JqLpuD0NRX4Jl0NKoPHuUkL8fTyeFOi6PSebBb2Ipdg5QMjLrHtCuiA_P2bFXg5n9nXK_yZ3L8lkwLSiWrj',
                  }}
                  style={styles.avatarImage}
                />
                <View style={styles.proBadge}>
                  <Text style={styles.proBadgeText}>PRO</Text>
                </View>
              </View>

              <View style={styles.athleteDetails}>
                <Text style={styles.athleteName}>{name}</Text>
                <Text style={styles.athleteEmail}>{email}</Text>
                <View style={styles.tierPill}>
                  <Ionicons name="shield-checkmark" size={12} color="#89f5e7" />
                  <Text style={styles.tierText}>TriFit Athlete</Text>
                </View>
              </View>
            </View>

            {/* Target Event Banner */}
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
          </LinearGradient>

          {/* Biometrics & Healthspan Grid */}
          <Text style={styles.sectionTitle}>Biology & Performance Baselines</Text>
          <View style={styles.gridContainer}>
            {/* Card 1: HRV */}
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <View style={[styles.iconBox, { backgroundColor: '#ccfbf1' }]}>
                  <Ionicons name="heart-pulse" size={18} color="#0d9488" />
                </View>
                <Text style={styles.metricLabel}>HRV Baseline</Text>
              </View>
              <Text style={styles.metricValue}>68 <Text style={styles.metricUnit}>ms</Text></Text>
              <View style={styles.statusPillTeal}>
                <Text style={styles.statusPillTealText}>Optimal Recovery</Text>
              </View>
            </View>

            {/* Card 2: VO2 Max */}
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <View style={[styles.iconBox, { backgroundColor: '#e0f2fe' }]}>
                  <MaterialCommunityIcons name="lightning-bolt" size={18} color="#0284c7" />
                </View>
                <Text style={styles.metricLabel}>VO2 Max</Text>
              </View>
              <Text style={styles.metricValue}>54.2 <Text style={styles.metricUnit}>ml/kg</Text></Text>
              <View style={styles.statusPillBlue}>
                <Text style={styles.statusPillBlueText}>Top 5% for Age</Text>
              </View>
            </View>

            {/* Card 3: Fitness Age */}
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <View style={[styles.iconBox, { backgroundColor: '#fef3c7' }]}>
                  <FontAwesome5 name="dna" size={16} color="#b45309" />
                </View>
                <Text style={styles.metricLabel}>Biological Age</Text>
              </View>
              <Text style={styles.metricValue}>26 <Text style={styles.metricUnit}>yrs</Text></Text>
              <View style={styles.statusPillAmber}>
                <Text style={styles.statusPillAmberText}>-4 yrs younger</Text>
              </View>
            </View>

            {/* Card 4: Streak & XP */}
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <View style={[styles.iconBox, { backgroundColor: '#ffdbca' }]}>
                  <MaterialCommunityIcons name="fire" size={18} color="#ea580c" />
                </View>
                <Text style={styles.metricLabel}>Streak & XP</Text>
              </View>
              <Text style={styles.metricValue}>{streakDays}D <Text style={styles.metricUnit}>• {xp} XP</Text></Text>
              <View style={styles.statusPillOrange}>
                <Text style={styles.statusPillOrangeText}>Consistent 🔥</Text>
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
                <Text style={styles.pbSub}>Pace: 3:57 / km • Zone 2</Text>
              </View>
              <Text style={styles.pbValue}>19:45</Text>
            </View>
            <View style={styles.dividerLine} />

            <View style={styles.pbItem}>
              <View style={styles.pbIconBox}>
                <FontAwesome5 name="dumbbell" size={16} color="#0284c7" />
              </View>
              <View style={styles.pbInfo}>
                <Text style={styles.pbTitle}>Hyrox Sled Push (50m)</Text>
                <Text style={styles.pbSub}>Pro weight standard</Text>
              </View>
              <Text style={styles.pbValue}>175 kg</Text>
            </View>
            <View style={styles.dividerLine} />

            <View style={styles.pbItem}>
              <View style={styles.pbIconBox}>
                <Ionicons name="water" size={20} color="#0ea5e9" />
              </View>
              <View style={styles.pbInfo}>
                <Text style={styles.pbTitle}>750m Open Water Swim</Text>
                <Text style={styles.pbSub}>Low-impact joint conditioning</Text>
              </View>
              <Text style={styles.pbValue}>12:30</Text>
            </View>
          </View>

          {/* Connected Gear & Apps */}
          <Text style={styles.sectionTitle}>Connected Gear & Integrations</Text>
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

          {/* Action Buttons */}
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
  logoutTopBtn: {
    padding: 6,
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
  proBadge: {
    position: 'absolute',
    bottom: -4,
    alignSelf: 'center',
    backgroundColor: '#f59e0b',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  proBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
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
  statusPillTeal: {
    backgroundColor: '#ccfbf1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  statusPillTealText: {
    color: '#0f766e',
    fontSize: 10,
    fontWeight: '800',
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
