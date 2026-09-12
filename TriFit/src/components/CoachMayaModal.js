import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme';

export default function CoachMayaModal({ visible, onClose, onLogout, currentUser }) {
  const athleteName = currentUser?.name || currentUser?.username || 'there';
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'maya',
      text: `Hey ${athleteName}! 🏃‍♀️ I'm Coach Maya, your AI endurance & longevity coach. What questions can I answer about your training, pacing, or recovery today?`,
      time: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickPrompts = [
    'Why swap to Zone 2?',
    'Legs feel great!',
    'Pacing tips for Hyrox',
    'How is my Fitness Age?',
  ];

  const handleSend = (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      time: 'Now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = "I'm monitoring your heart rate drift & tendon load. Keep it steady!";
      if (query.toLowerCase().includes('zone 2') || query.toLowerCase().includes('why')) {
        reply =
          "Zone 2 builds capillary density & mitochondrial efficiency without burning neural reserves. It keeps your tendons happy for race day! 🫀⚡";
      } else if (query.toLowerCase().includes('hyrox') || query.toLowerCase().includes('pacing')) {
        reply =
          'For Hyrox, maintain 80% effort on the run segments so you have explosive power left for the Sled Push & Wall Balls! 🏋️‍♂️💨';
      } else if (query.toLowerCase().includes('legs') || query.toLowerCase().includes('great')) {
        reply =
          "Awesome! Enjoy today's 35-min aero run. I've enabled real-time audio cues for your 128-142 BPM zone!";
      } else if (query.toLowerCase().includes('fitness age')) {
        reply =
          "Your current Fitness Age is 27 (7 years younger than your 34 chronological age)! Keep banking easy aerobic miles to stay in the top 8%! 🧬✨";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'maya',
          text: reply,
          time: 'Just now',
        },
      ]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <LinearGradient
            colors={['#ecfdf5', '#f0fdfa', '#fefce8']}
            style={styles.headerGradient}
          >
            <View style={styles.headerTop}>
              <View style={styles.mayaProfileRow}>
                <View style={styles.avatarWrap}>
                  <Image
                    source={{
                      uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkV_Kd98o6DF09QGU3Gv4u4RHrWKdogf2D9arDcGv7Q2Vk-EFcwI-DUvPk06TqN1p7jMDTnyDAtO9Eut9Gg0SuOHxBLr6fjQZf-jVpL8FXVtywrDY7hIXe-MtvSbm4lJxvH33wjLyLAYHWJF0xAcl7H5IDxuWt2gTWNvt4MrnZiPmCs41s4CuDkgUULkPUD6Kba0pSdzqTetGtAlJdKyark3WqzqdqaCxkkRcLLGwn6YCYWjgbgx1-',
                    }}
                    style={styles.mayaAvatar}
                  />
                  <View style={styles.boltBadge}>
                    <Ionicons name="flash" size={10} color="#ffffff" />
                  </View>
                </View>
                <View>
                  <View style={styles.titleRow}>
                    <Text style={styles.mayaName}>Coach Maya</Text>
                    <View style={styles.tunedPill}>
                      <Text style={styles.tunedText}>TUNED</Text>
                    </View>
                  </View>
                  <Text style={styles.mayaSub}>
                    <Ionicons name="heart" size={12} color="#0d9488" /> HR & Tendon Shield AI
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                {onLogout && (
                  <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={() => {
                      onClose();
                      onLogout();
                    }}
                    title="Log Out"
                  >
                    <Ionicons name="log-out-outline" size={18} color="#94a3b8" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                  <Ionicons name="close" size={22} color={COLORS.onSurfaceVariant} />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>

          {/* Quick Prompt Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsScroll}
            contentContainerStyle={styles.chipsContent}
          >
            {quickPrompts.map((prompt, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.chip}
                onPress={() => handleSend(prompt)}
                activeOpacity={0.7}
              >
                <Text style={styles.chipText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Chat Messages List */}
          <ScrollView style={styles.chatArea} contentContainerStyle={styles.chatAreaContent}>
            {messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.msgBubble,
                  msg.sender === 'user' ? styles.userMsgBubble : styles.mayaMsgBubble,
                ]}
              >
                <Text
                  style={[
                    styles.msgText,
                    msg.sender === 'user' ? styles.userMsgText : styles.mayaMsgText,
                  ]}
                >
                  {msg.text}
                </Text>
              </View>
            ))}
            {isTyping && (
              <View style={[styles.msgBubble, styles.mayaMsgBubble]}>
                <Text style={styles.typingText}>Coach Maya is thinking...</Text>
              </View>
            )}
          </ScrollView>

          {/* Input Bar */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask Maya anything about your training..."
              placeholderTextColor="#94a3b8"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => handleSend()}
            />
            <TouchableOpacity
              style={styles.sendBtn}
              onPress={() => handleSend()}
              activeOpacity={0.8}
            >
              <Ionicons name="send" size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '80%',
    backgroundColor: '#faf8ff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  headerGradient: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#a7f3d0',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mayaProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrap: {
    position: 'relative',
  },
  mayaAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: '#10b981',
  },
  boltBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mayaName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#131b2e',
  },
  tunedPill: {
    backgroundColor: '#06b6d4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  tunedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
  },
  mayaSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0d9488',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsScroll: {
    maxHeight: 50,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  chipsContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    backgroundColor: '#ccfbf1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#99f6e4',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f766e',
  },
  chatArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  chatAreaContent: {
    paddingVertical: 16,
    gap: 12,
  },
  msgBubble: {
    maxWidth: '82%',
    padding: 12,
    borderRadius: 18,
  },
  mayaMsgBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  userMsgBubble: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
  },
  msgText: {
    fontSize: 14,
    lineHeight: 20,
  },
  mayaMsgText: {
    color: '#131b2e',
    fontWeight: '500',
  },
  userMsgText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  typingText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#0d9488',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingBottom: 24,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 8,
  },
  textInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#f1f5f9',
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#131b2e',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
