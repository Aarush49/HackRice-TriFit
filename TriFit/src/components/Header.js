import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';

export default function Header({ onOpenCoach, onOpenAuth, currentUser, streakDays = 14, xpPoints = 420 }) {
  return (
    <View style={styles.container}>
      {/* Brand Title */}
      <View style={styles.brandRow}>
        <View style={styles.logoBadge}>
          <MaterialCommunityIcons name="lightning-bolt" size={20} color="#ffffff" />
        </View>
        <Text style={styles.brandText}>TriFit</Text>
      </View>

      {/* Right Stats & Profile */}
      <View style={styles.rightStats}>
        {/* Streak Badge */}
        <View style={styles.streakBadge}>
          <MaterialCommunityIcons name="fire" size={18} color="#ea580c" />
          <Text style={styles.streakText}>{streakDays}D</Text>
        </View>

        {/* XP Badge */}
        <View style={styles.xpBadge}>
          <Ionicons name="flash" size={16} color={COLORS.primary} />
          <Text style={styles.xpText}>{xpPoints}</Text>
        </View>

        {/* Profile Avatar / Auth Button */}
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={currentUser ? onOpenCoach : onOpenAuth}
          activeOpacity={0.8}
        >
          <Image
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCNF6DrCWxMm5Lv1YkzwT2KVsurMoDrkDXgPAkoqmIC1Hcawc03Tu0S4b5z4t8OxsjsvqazCQkgNUKUOPKGxly21xtC-gahcc4q0ouhxWImTdz35f8wcCPy33ybK6REvfjcZkTPtS-r0yOcaRp1m6dt7AfXcD3D_RYh4JqLpuD0NRX4Jl0NKoPHuUkL8fTyeFOi6PSebBb2Ipdg5QMjLrHtCuiA_P2bFXg5n9nXK_yZ3L8lkwLSiWrj',
            }}
            style={styles.avatarImg}
          />
          <View style={[styles.dotIndicator, currentUser && { backgroundColor: '#10b981' }]} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: 'rgba(250, 248, 255, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 104, 95, 0.08)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  rightStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffdbca',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#ffb690',
  },
  streakText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#341100',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#89f5e7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#6bd8cb',
  },
  xpText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00201d',
  },
  profileBtn: {
    position: 'relative',
    padding: 2,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: 'rgba(0, 104, 95, 0.2)',
  },
  avatarImg: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  dotIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#f97316',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
});
