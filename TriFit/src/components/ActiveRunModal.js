import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme';

export default function ActiveRunModal({ visible, onClose, onFinishRun }) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [heartRate, setHeartRate] = useState(134);

  useEffect(() => {
    let timer;
    if (visible && isRunning) {
      timer = setInterval(() => {
        setSeconds((prev) => prev + 1);
        // Simulate minor HR flux in Zone 2
        setHeartRate(132 + Math.floor(Math.random() * 8));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [visible, isRunning]);

  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleComplete = () => {
    onFinishRun();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <LinearGradient colors={['#003833', '#00685f', '#131b2e']} style={styles.container}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconBtn} onPress={onClose}>
            <Ionicons name="close" size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.zoneTag}>
            <MaterialCommunityIcons name="heart-pulse" size={16} color="#10b981" />
            <Text style={styles.zoneTagText}>ZONE 2 AERO</Text>
          </View>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="volume-high" size={22} color="#89f5e7" />
          </TouchableOpacity>
        </View>

        {/* Hero Workout Graphic */}
        <View style={styles.imageCard}>
          <Image
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBY1wWjlUnEJjbhQpJnG1F1eoDvkRqkBV2gf_3fClppSTCxYDutB1IoWuWV458J4AC8CZjFApFQv3Jvdakn7vb0BdgOl4M6ubTOLi6ulaEyzti69wX9OP-DhOKJoyBL10ZNC6QpQqHDksQ-Xa4k46i47ozQMYRGE5TfP810V5xGNelBFn3tWDEhzEB2zR5PpZjDytstgVIiyXysKlrMHQXxk6I5GHVR6BXI0eBtgC3EbETQYTaSon-A',
            }}
            style={styles.runImage}
          />
          <View style={styles.hrOverlay}>
            <Ionicons name="heart" size={16} color="#f43f5e" />
            <Text style={styles.hrOverlayText}>{heartRate} BPM</Text>
          </View>
        </View>

        {/* Timer Display */}
        <View style={styles.timerBox}>
          <Text style={styles.timerLabel}>QUEST TIME</Text>
          <Text style={styles.timerText}>{formatTime(seconds)}</Text>
          <Text style={styles.targetSub}>Target Pace: 5:45 / km • Easy Aerobic</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>1.85</Text>
            <Text style={styles.statLabel}>Distance (km)</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>142</Text>
            <Text style={styles.statLabel}>Active Cal</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#ffc107' }]}>+120</Text>
            <Text style={styles.statLabel}>XP Reward</Text>
          </View>
        </View>

        {/* Coach Jim Live Audio Feedback Callout */}
        <View style={styles.mayaBanner}>
          <Image
            source={require('../../assets/coach_jim.png')}
            style={styles.mayaAvatarMini}
            resizeMode="contain"
          />
          <Text style={styles.mayaText}>
            “Coach Jim: Form looking smooth! 🦫 Rhythm over speed. Breathe through the nose.”
          </Text>
        </View>

        {/* Action Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.pauseBtn, !isRunning && styles.resumeBtn]}
            onPress={() => setIsRunning(!isRunning)}
            activeOpacity={0.8}
          >
            <Ionicons name={isRunning ? 'pause' : 'play'} size={28} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.finishBtn}
            onPress={handleComplete}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-done" size={24} color="#ffffff" />
            <Text style={styles.finishText}>Complete Quest</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 30,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoneTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16,185,129,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  zoneTagText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#89f5e7',
    letterSpacing: 0.5,
  },
  imageCard: {
    position: 'relative',
    height: 180,
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  runImage: {
    width: '100%',
    height: '100%',
  },
  hrOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hrOverlayText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  timerBox: {
    alignItems: 'center',
    marginVertical: 10,
  },
  timerLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#89f5e7',
    letterSpacing: 1,
  },
  timerText: {
    fontSize: 58,
    fontWeight: '900',
    color: '#ffffff',
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
  targetSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    marginTop: 2,
  },
  mayaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    gap: 10,
  },
  mayaAvatarMini: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#10b981',
    backgroundColor: '#e6fffa',
  },
  mayaText: {
    flex: 1,
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  pauseBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumeBtn: {
    backgroundColor: '#06b6d4',
  },
  finishBtn: {
    flex: 1,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 4,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  finishText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  },
});
