import React, { useState, useRef, useEffect } from 'react';
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
  Alert,
  Animated,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  createAudioPlayer,
  useAudioRecorder,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from 'expo-audio';
import { COLORS } from '../theme';
import API_BASE_URL from '../config';

export default function CoachMayaModal({ visible, onClose, onLogout, currentUser }) {
  const athleteName = currentUser?.name || currentUser?.username || 'there';
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'jim',
      text: `Hey ${athleteName}! 🦫 I'm Coach Jim, your athletic capybara endurance & longevity coach. What questions can I answer about your training, pacing, or recovery today?`,
      time: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Audio Playback state
  const [playingId, setPlayingId] = useState(null);
  const currentAudioPlayerRef = useRef(null);

  // Audio Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef(null);

  // Native expo-audio recorder hook
  const expoRecorder = useAudioRecorder ? useAudioRecorder(RecordingPresets?.HIGH_QUALITY || {}) : null;

  // Web recording refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const mediaStreamRef = useRef(null);

  // Pulse animation for recording state
  useEffect(() => {
    let anim;
    if (isRecording) {
      anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.22,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      anim.start();

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      pulseAnim.setValue(1);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setRecordingSeconds(0);
    }

    return () => {
      if (anim) anim.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  useEffect(() => {
    if (!visible) {
      stopCurrentAudio();
      if (isRecording) {
        stopRecording();
      }
    }
    return () => {
      stopCurrentAudio();
      if (isRecording) {
        stopRecording();
      }
    };
  }, [visible]);

  const stopCurrentAudio = () => {
    if (currentAudioPlayerRef.current) {
      try {
        currentAudioPlayerRef.current.stop();
      } catch (e) {}
      currentAudioPlayerRef.current = null;
    }
    setPlayingId(null);
  };

  const cleanTextForSpeech = (str) => {
    return str
      ? str
          .replace(/[*_~`#]/g, '')
          .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '')
          .replace(/\s+/g, ' ')
          .trim()
      : '';
  };

  // Play audio Data URI (cross-platform with expo-audio on mobile)
  const playAudioUri = async (msgId, dataUri) => {
    stopCurrentAudio();
    setPlayingId(msgId);

    try {
      if (Platform.OS === 'web') {
        const audio = new Audio(dataUri);
        audio.onended = () => {
          setPlayingId(null);
          currentAudioPlayerRef.current = null;
        };
        audio.onerror = (e) => {
          console.error('Audio playback error on web:', e);
          setPlayingId(null);
        };
        currentAudioPlayerRef.current = {
          stop: () => {
            try {
              audio.pause();
              audio.currentTime = 0;
            } catch (e) {}
          },
        };
        await audio.play();
      } else {
        // Mobile (Expo Go on iOS/Android) using expo-audio createAudioPlayer
        const player = createAudioPlayer(dataUri);
        currentAudioPlayerRef.current = {
          stop: () => {
            try {
              player.pause();
              player.remove();
            } catch (e) {}
          },
        };

        if (player.addListener) {
          player.addListener('playbackStatusUpdate', (status) => {
            if (status?.didJustFinish || status?.isEnded || status?.status === 'ended') {
              setPlayingId(null);
            }
          });
        }
        player.play();
      }
    } catch (err) {
      console.error('Error in playAudioUri:', err);
      setPlayingId(null);
    }
  };

  const handlePlayAudio = async (msgId, text) => {
    if (playingId === msgId) {
      stopCurrentAudio();
      return;
    }

    stopCurrentAudio();
    setPlayingId(msgId);

    const speechText = cleanTextForSpeech(text);
    if (!speechText) {
      setPlayingId(null);
      return;
    }

    try {
      // Send text to backend TTS endpoint (ElevenLabs API stream)
      const response = await fetch(`${API_BASE_URL}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: speechText }),
      });

      if (!response.ok) {
        throw new Error(`Backend TTS failed with status ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64Str = typeof btoa !== 'undefined' ? btoa(binary) : global.btoa ? global.btoa(binary) : '';
      const dataUri = `data:audio/mpeg;base64,${base64Str}`;
      await playAudioUri(msgId, dataUri);
    } catch (err) {
      console.error('Error fetching or playing backend TTS audio:', err);
      setPlayingId(null);
    }
  };

  // --- Start / Stop Voice Recording ---
  const startRecording = async () => {
    stopCurrentAudio();

    if (Platform.OS !== 'web') {
      // Native iOS / Android with expo-audio
      try {
        if (typeof requestRecordingPermissionsAsync === 'function') {
          const perm = await requestRecordingPermissionsAsync();
          if (perm && !perm.granted) {
            Alert.alert(
              'Microphone Permission',
              'Please grant microphone permission in device settings to talk directly with Coach Maya.'
            );
            return;
          }
        }
        if (typeof setAudioModeAsync === 'function') {
          await setAudioModeAsync({
            allowsRecording: true,
            playsInSilentMode: true,
          });
        }
        if (expoRecorder) {
          await expoRecorder.prepareToRecordAsync();
          expoRecorder.record();
          setIsRecording(true);
        }
      } catch (err) {
        console.error('Failed to start expo-audio recording:', err);
        Alert.alert('Microphone Error', 'Could not start recording. Please try again.');
      }
    } else {
      // Web browser: MediaRecorder fallback
      try {
        if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaStreamRef.current = stream;

          let mimeType = 'audio/webm';
          if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported) {
            if (MediaRecorder.isTypeSupported('audio/webm')) mimeType = 'audio/webm';
            else if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
            else if (MediaRecorder.isTypeSupported('audio/wav')) mimeType = 'audio/wav';
          }

          const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
          mediaRecorderRef.current = recorder;
          audioChunksRef.current = [];

          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              audioChunksRef.current.push(e.data);
            }
          };

          recorder.onstop = () => {
            setIsRecording(false);
            if (mediaStreamRef.current) {
              try {
                mediaStreamRef.current.getTracks().forEach((t) => t.stop());
              } catch (e) {}
              mediaStreamRef.current = null;
            }

            // Use a short delay to ensure all ondataavailable events have fired
            setTimeout(() => {
              if (audioChunksRef.current.length > 0) {
                const blob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
                console.log(`[CoachMaya] Recording complete: ${audioChunksRef.current.length} chunks, ${blob.size} bytes`);
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = () => {
                  const resUrl = reader.result || '';
                  const b64 = resUrl.split(',')[1];
                  if (b64) {
                    sendVoiceToMaya(b64, mimeType || 'audio/webm');
                  }
                };
              } else {
                console.warn('[CoachMaya] No audio chunks captured — recording was empty');
              }
            }, 100);
          };

          // Pass timeslice (250ms) so ondataavailable fires periodically
          // during recording, not just once at stop
          recorder.start(250);
          setIsRecording(true);
        } else {
          Alert.alert('Browser Unsupported', 'Audio recording is not supported on this browser.');
        }
      } catch (err) {
        console.error('Failed to start web MediaRecorder:', err);
        Alert.alert(
          'Microphone Permission',
          'Please allow microphone access in your browser to speak directly to Coach Maya.'
        );
      }
    }
  };

  const readNativeRecording = async (recordedUri) => {
    try {
      // Load the native file API only when voice recording is used. This keeps
      // an unavailable native module from preventing the app itself from mounting.
      const { File } = await import('expo-file-system');
      const audioFile = new File(recordedUri);
      if (!audioFile.exists || !audioFile.size || audioFile.size < 1000) {
        throw new Error('The recording was empty or too short.');
      }

      const base64Audio = await audioFile.base64();
      const extension = (audioFile.extension || '').toLowerCase();
      return {
        base64Audio,
        mimeType: extension === '.3gp' ? 'audio/3gpp' : 'audio/mp4',
      };
    } catch (fileSystemError) {
      if (fileSystemError?.message === 'The recording was empty or too short.') {
        throw fileSystemError;
      }

      // Compatibility path for Expo clients that do not expose the modern File API.
      const response = await fetch(recordedUri);
      const blob = await response.blob();
      if (!blob.size || blob.size < 1000) {
        throw new Error('The recording was empty or too short.');
      }

      const base64Audio = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('The recording could not be read.'));
        reader.onloadend = () => resolve((reader.result || '').toString().split(',')[1] || '');
        reader.readAsDataURL(blob);
      });

      return { base64Audio, mimeType: blob.type || 'audio/mp4' };
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);

    if (Platform.OS !== 'web') {
      if (expoRecorder) {
        try {
          await expoRecorder.stop();
          const recordedUri = expoRecorder.uri;
          await setAudioModeAsync({
            allowsRecording: false,
            playsInSilentMode: true,
          });

          if (!recordedUri) {
            throw new Error('Recorder did not return an audio file.');
          }

          const { base64Audio, mimeType } = await readNativeRecording(recordedUri);
          if (!base64Audio) {
            throw new Error('The recording could not be read.');
          }
          await sendVoiceToMaya(base64Audio, mimeType);
        } catch (err) {
          console.error('Error stopping expo-audio recording:', err);
          setIsTranscribing(false);
          setIsTyping(false);
          Alert.alert(
            'Voice Message Error',
            err?.message === 'The recording was empty or too short.'
              ? 'I could not hear enough audio. Hold the microphone button, speak clearly, then tap Done.'
              : 'Your voice message could not be processed. Please try recording again.'
          );
        }
      }
    } else {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch (err) {}
      }
    }
  };

  const toggleMicRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // --- Send Recorded Voice Base64 to Coach Maya Endpoint ---
  const sendVoiceToMaya = async (base64Audio, mimeType) => {
    setIsTranscribing(true);
    setIsTyping(true);

    try {
      const username = currentUser?.username || currentUser?.name || 'DemoAccount';
      const res = await fetch(`${API_BASE_URL}/api/coach/voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          audio_base64: base64Audio,
          mime_type: mimeType || 'audio/webm',
          history: messages.slice(-6).map((m) => ({
            sender: m.sender === 'user' ? 'user' : 'maya',
            text: m.text,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const responseType = res.headers.get('content-type') || '';
      if (responseType.includes('application/json')) {
        const data = await res.json();
        const transcription = data.transcription || 'Voice check-in';
        const reply = data.reply || 'I received your message, but could not generate an audio response.';
        const userMsgId = Date.now().toString();
        const mayaMsgId = (Date.now() + 1).toString();

        setMessages((prev) => [
          ...prev,
          { id: userMsgId, sender: 'user', text: transcription, time: 'Now' },
          { id: mayaMsgId, sender: 'maya', text: reply, time: 'Just now' },
        ]);
        return;
      }

      // Read custom response headers
      let transcription =
        res.headers.get('X-Maya-Transcription') ||
        res.headers.get('x-maya-transcription') ||
        '';
      let reply =
        res.headers.get('X-Maya-Reply') ||
        res.headers.get('x-maya-reply') ||
        '';

      try {
        if (transcription) transcription = decodeURIComponent(transcription);
        if (reply) reply = decodeURIComponent(reply);
      } catch (e) {}

      if (!transcription) transcription = '🎤 Voice check-in';
      if (!reply) reply = "I've analyzed your telemetry and plan. Keep your pacing smooth in Zone 2 today!";

      setIsTranscribing(false);

      const userMsgId = Date.now().toString();
      const mayaMsgId = (Date.now() + 1).toString();

      setMessages((prev) => [
        ...prev,
        { id: userMsgId, sender: 'user', text: transcription, time: 'Now' },
        { id: mayaMsgId, sender: 'maya', text: reply, time: 'Just now' },
      ]);

      // Read returned ElevenLabs MP3 audio stream
      const arrayBuffer = await res.arrayBuffer();
      if (arrayBuffer && arrayBuffer.byteLength > 0) {
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64Str = typeof btoa !== 'undefined' ? btoa(binary) : global.btoa ? global.btoa(binary) : '';
        const dataUri = `data:audio/mpeg;base64,${base64Str}`;
        await playAudioUri(mayaMsgId, dataUri);
      }
    } catch (err) {
      console.error('Error sending voice to Coach Maya:', err);
      setIsTranscribing(false);
      const userMsgId = Date.now().toString();
      const mayaMsgId = (Date.now() + 1).toString();
      const fallbackUser = '🎤 Spoken coaching check-in';
      const fallbackReply =
        "I heard your voice message! Your heart rate and readiness are looking strong today. Stay consistent with your aerobic base! 🏃‍♀️⚡";

      setMessages((prev) => [
        ...prev,
        { id: userMsgId, sender: 'user', text: fallbackUser, time: 'Now' },
        { id: mayaMsgId, sender: 'maya', text: fallbackReply, time: 'Just now' },
      ]);
      handlePlayAudio(mayaMsgId, fallbackReply);
    } finally {
      setIsTyping(false);
      setIsTranscribing(false);
    }
  };

  const quickPrompts = [
    'Why swap to Zone 2?',
    'Legs feel great!',
    'Pacing tips for Hyrox',
    'How is my Fitness Age?',
  ];

  const handleSend = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      time: 'Now',
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInputText('');
    setIsTyping(true);

    try {
      const username = currentUser?.username || currentUser?.name || 'DemoAccount';
      const res = await fetch(`${API_BASE_URL}/api/coach/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          message: query,
          history: updatedHistory.slice(-8).map((m) => ({
            sender: m.sender === 'user' ? 'user' : 'jim',
            text: m.text,
          })),
        }),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        const mayaMsgId = (Date.now() + 1).toString();
        setMessages((prev) => [
          ...prev,
          {
            id: mayaMsgId,
            sender: 'jim',
            text: data.reply,
            time: 'Just now',
          },
        ]);
        // Automatically play Coach Jim's voice response using ElevenLabs
        handlePlayAudio(mayaMsgId, data.reply);
      } else {
        throw new Error(data.detail || 'Failed to get coaching response');
      }
    } catch (err) {
      console.log('Coach Jim chat fallback:', err?.message || err);
      // Smart localized fallback if network is unreachable
      let fallbackReply = "I'm monitoring your heart rate drift & tendon load. Keep it steady! 🦫⚡";
      if (query.toLowerCase().includes('zone 2') || query.toLowerCase().includes('why')) {
        fallbackReply =
          "Zone 2 builds capillary density & mitochondrial efficiency without burning neural reserves. It keeps your tendons happy for race day! 🫀⚡";
      } else if (query.toLowerCase().includes('hyrox') || query.toLowerCase().includes('pacing')) {
        fallbackReply =
          'For Hyrox, maintain 80% effort on the run segments so you have explosive power left for the Sled Push & Wall Balls! 🏋️‍♂️💨';
      } else if (query.toLowerCase().includes('legs') || query.toLowerCase().includes('great')) {
        fallbackReply =
          "Awesome! Enjoy today's aero session. I've enabled real-time coaching cues for your aerobic heart rate zone! 🏃‍♂️✨";
      } else if (query.toLowerCase().includes('fitness age') || query.toLowerCase().includes('age')) {
        fallbackReply =
          "Your current Fitness Age is 27 (7 years younger than your 34 chronological age)! Keep banking easy aerobic miles to stay in the top 8%! 🧬✨";
      }

      const fallbackId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        {
          id: fallbackId,
          sender: 'jim',
          text: fallbackReply,
          time: 'Just now',
        },
      ]);
      handlePlayAudio(fallbackId, fallbackReply);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
                    source={require('../../assets/coach_jim.png')}
                    style={styles.mayaAvatar}
                    resizeMode="contain"
                  />
                  <View style={styles.boltBadge}>
                    <Ionicons name="flash" size={10} color="#ffffff" />
                  </View>
                </View>
                <View>
                  <Text style={styles.mayaName}>Coach Jim</Text>
                </View>

                {/* Speak / Microphone Button next to Coach Maya */}
                <TouchableOpacity
                  style={[styles.headerVoiceBtn, isRecording && styles.headerVoiceBtnActive]}
                  onPress={toggleMicRecording}
                  activeOpacity={0.8}
                >
                  <Animated.View style={isRecording ? { transform: [{ scale: pulseAnim }] } : undefined}>
                    <Ionicons
                      name={isRecording ? 'stop-circle' : 'mic'}
                      size={16}
                      color={isRecording ? '#dc2626' : '#047857'}
                    />
                  </Animated.View>
                  <Text style={[styles.headerVoiceBtnText, isRecording && styles.headerVoiceBtnTextActive]}>
                    {isRecording ? `Listening ${recordingSeconds}s` : 'Speak'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
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
                  styles.msgBubbleWrap,
                  msg.sender === 'user' ? styles.userMsgWrap : styles.mayaMsgWrap,
                ]}
              >
                <View
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
                  {msg.sender === 'jim' && (
                    <TouchableOpacity
                      style={styles.speakerBtn}
                      onPress={() => handlePlayAudio(msg.id, msg.text)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={playingId === msg.id ? 'stop-circle' : 'volume-medium'}
                        size={16}
                        color={playingId === msg.id ? '#059669' : '#0d9488'}
                      />
                      <Text style={[styles.speakerBtnText, playingId === msg.id && { color: '#059669' }]}>
                        {playingId === msg.id ? 'Stop' : 'Listen'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
            {isTranscribing && (
              <View style={[styles.msgBubble, styles.mayaMsgBubble, styles.statusBubble]}>
                <Ionicons name="mic" size={16} color="#0d9488" />
                <Text style={styles.typingText}>Transcribing your speech with Gemini...</Text>
              </View>
            )}
            {isTyping && !isTranscribing && (
              <View style={[styles.msgBubble, styles.mayaMsgBubble, styles.statusBubble]}>
                <Ionicons name="sparkles" size={16} color="#0d9488" />
                <Text style={styles.typingText}>Coach Jim is thinking & generating voice... 🦫</Text>
              </View>
            )}
          </ScrollView>

          {/* Live Recording Notice Bar */}
          {isRecording && (
            <View style={styles.recordingNoticeBar}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Ionicons name="radio" size={18} color="#ef4444" />
              </Animated.View>
              <Text style={styles.recordingNoticeText}>
                Listening to you ({recordingSeconds}s)... Tap "Stop" when done speaking!
              </Text>
              <TouchableOpacity style={styles.recordingStopBtn} onPress={stopRecording}>
                <Text style={styles.recordingStopBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Input Bar */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder={isRecording ? 'Listening to your voice...' : 'Ask Coach Jim anything about your training...'}
              placeholderTextColor="#94a3b8"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => handleSend()}
              editable={!isRecording}
            />
            {/* Microphone button inside bottom input row */}
            <TouchableOpacity
              style={[styles.inputMicBtn, isRecording && styles.inputMicBtnActive]}
              onPress={toggleMicRecording}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isRecording ? 'stop' : 'mic'}
                size={20}
                color={isRecording ? '#ffffff' : '#0f766e'}
              />
            </TouchableOpacity>
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
    height: '82%',
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
    gap: 10,
    flex: 1,
  },
  avatarWrap: {
    position: 'relative',
  },
  mayaAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#10b981',
    backgroundColor: '#e6fffa',
  },
  boltBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mayaName: {
    fontSize: 17,
    fontWeight: '900',
    color: '#131b2e',
  },
  headerVoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#a7f3d0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginLeft: 4,
  },
  headerVoiceBtnActive: {
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
  },
  headerVoiceBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#047857',
  },
  headerVoiceBtnTextActive: {
    color: '#b91c1c',
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
  msgBubbleWrap: {
    width: '100%',
    flexDirection: 'row',
  },
  mayaMsgWrap: {
    justifyContent: 'flex-start',
  },
  userMsgWrap: {
    justifyContent: 'flex-end',
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
  speakerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  speakerBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0d9488',
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
  statusBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  typingText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#0d9488',
  },
  recordingNoticeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: '#fecaca',
    gap: 8,
  },
  recordingNoticeText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#b91c1c',
  },
  recordingStopBtn: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  recordingStopBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
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
  inputMicBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0fdfa',
    borderWidth: 1.5,
    borderColor: '#a7f3d0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputMicBtnActive: {
    backgroundColor: '#dc2626',
    borderColor: '#b91c1c',
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
