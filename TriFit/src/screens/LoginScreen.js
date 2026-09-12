import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen({ onLoginSuccess }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null); // 'name' | 'email' | 'password' | null
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleEmailChange = (val) => {
    setEmail(val);
    if (errorMessage) setErrorMessage('');
  };

  const handlePasswordChange = (val) => {
    setPassword(val);
    if (errorMessage) setErrorMessage('');
  };

  const handleNameChange = (val) => {
    setName(val);
    if (errorMessage) setErrorMessage('');
  };

  const API_BASE_URL = 'http://localhost:8000';

  const handleSubmit = async (method = 'Email Form') => {
    if (method === 'Email Form') {
      if (authMode === 'signup' && !name.trim()) {
        setErrorMessage('Please enter your athlete name.');
        return;
      }
      if (!email.trim()) {
        setErrorMessage('Please enter your email or username.');
        return;
      }
      if (!password.trim()) {
        setErrorMessage('Please enter your password.');
        return;
      }
    }

    setErrorMessage('');
    setIsLoading(true);

    const endpoint = authMode === 'signup' ? '/signup' : '/login';
    const payload = authMode === 'signup'
      ? { username: name.trim() || email.split('@')[0], email: email.trim(), password: password.trim(), name: name.trim() }
      : { email: email.trim(), username: email.trim(), password: password.trim() };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Authentication failed. Please try again.');
      }

      setIsLoading(false);
      onLoginSuccess({
        email: data.user?.email || email.trim(),
        name: data.user?.username || name.trim() || 'Athlete',
        token: data.access_token,
        user: data.user,
        isSignup: authMode === 'signup',
        method,
      });
    } catch (err) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Could not connect to database server.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
          {Platform.OS === 'web' && (
            <style>{`
              input,
              input:focus,
              input:active,
              input:hover,
              input:-webkit-autofill,
              input:-webkit-autofill:hover,
              input:-webkit-autofill:focus,
              input:-webkit-autofill:active,
              textarea:focus,
              select:focus,
              button:focus,
              *:focus {
                outline: none !important;
                outline-width: 0 !important;
                outline-style: none !important;
                outline-color: transparent !important;
                box-shadow: none !important;
                -webkit-tap-highlight-color: transparent !important;
              }
              input, textarea {
                -webkit-user-select: text !important;
                user-select: text !important;
                touch-action: manipulation !important;
                pointer-events: auto !important;
              }
              input:-webkit-autofill,
              input:-webkit-autofill:hover,
              input:-webkit-autofill:focus,
              input:-webkit-autofill:active {
                -webkit-box-shadow: 0 0 0px 1000px #ffffff inset !important;
                box-shadow: 0 0 0px 1000px #ffffff inset !important;
                -webkit-text-fill-color: #0f172a !important;
                transition: background-color 50000s ease-in-out 0s;
              }
            `}</style>
          )}

          {/* Top Header */}
          <View style={styles.topHeader}>
            <View style={styles.brandRow}>
              <View style={styles.logoBadge}>
                <MaterialCommunityIcons name="lightning-bolt" size={22} color="#ffffff" />
              </View>
              <View>
                <Text style={styles.brandTitle}>
                  Tri<Text style={styles.brandTitleTeal}>Fit</Text>
                </Text>
                <Text style={styles.brandSubtitle}>ENDURANCE & LONGEVITY</Text>
              </View>
            </View>
          </View>

          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>
              Train Fast.{'\n'}
              <Text style={styles.heroTitleGradient}>Live Longer.</Text>
            </Text>
            <Text style={styles.heroSubtitle}>
              Smart endurance training optimized for your biology.
            </Text>
          </View>

          {/* Auth Mode Toggle Tabs (Log In vs Sign Up) */}
          <View style={styles.tabSelector}>
            <TouchableOpacity
              style={[styles.tabBtn, authMode === 'login' && styles.tabBtnActive]}
              onPress={() => setAuthMode('login')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  authMode === 'login' && styles.tabBtnTextActive,
                ]}
              >
                Log In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, authMode === 'signup' && styles.tabBtnActive]}
              onPress={() => setAuthMode('signup')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  authMode === 'signup' && styles.tabBtnTextActive,
                ]}
              >
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

        {/* Input Form */}
        <View style={styles.formSection}>
          {authMode === 'signup' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Athlete Name</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedField === 'name' && styles.inputWrapperFocused,
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={18}
                  color={focusedField === 'name' ? '#0d9488' : '#94a3b8'}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.inputField}
                  placeholder="Alex Rivers"
                  placeholderTextColor="#94a3b8"
                  value={name}
                  onChangeText={handleNameChange}
                  autoCapitalize="words"
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  underlineColorAndroid="transparent"
                />
              </View>
            </View>
          )}

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Athlete Email</Text>
            <View
              style={[
                styles.inputWrapper,
                focusedField === 'email' && styles.inputWrapperFocused,
              ]}
            >
              <Ionicons
                name="mail-outline"
                size={18}
                color={focusedField === 'email' ? '#0d9488' : '#94a3b8'}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.inputField}
                placeholder="alex@endurance.io"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                underlineColorAndroid="transparent"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <View style={styles.passwordHeaderRow}>
              <Text style={styles.inputLabel}>Password</Text>
              {authMode === 'login' && (
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                </TouchableOpacity>
              )}
            </View>
            <View
              style={[
                styles.inputWrapper,
                focusedField === 'password' && styles.inputWrapperFocused,
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={focusedField === 'password' ? '#0d9488' : '#94a3b8'}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.inputField}
                placeholder="••••••••••••"
                placeholderTextColor="#94a3b8"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={handlePasswordChange}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                underlineColorAndroid="transparent"
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#94a3b8"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Error Banner */}
          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color="#dc2626" />
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={() => handleSubmit('Email Form')}
            activeOpacity={0.88}
            disabled={isLoading}
          >
            <LinearGradient
              colors={['#0d9488', '#0f766e']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitGradient}
            >
              <Text style={styles.submitBtnText}>
                {authMode === 'signup' ? 'Create Athlete Account' : 'Jump In'}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#ffffff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Trust Pillars Footer */}
        <View style={styles.footerSection}>
          <View style={styles.trustChipsRow}>
            <View style={styles.trustChip}>
              <Text style={styles.trustChipEmoji}>🛡️</Text>
              <Text style={styles.trustChipText}>Privacy First</Text>
            </View>
            <View style={styles.trustChip}>
              <Text style={styles.trustChipEmoji}>🧬</Text>
              <Text style={styles.trustChipText}>HRV-Guided</Text>
            </View>
            <View style={styles.trustChip}>
              <Text style={styles.trustChipEmoji}>👟</Text>
              <Text style={styles.trustChipText}>All Levels</Text>
            </View>
          </View>

          <Text style={styles.legalText}>
            By joining TriFit, you agree to our{' '}
            <Text style={styles.legalLink}>Terms of Service</Text> &{' '}
            <Text style={styles.legalLink}>Longevity Health Policy</Text>.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#0d9488',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0d9488',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  brandTitleTeal: {
    color: '#0d9488',
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.8,
    marginTop: 1,
  },
  heroSection: {
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0f172a',
    lineHeight: 34,
    letterSpacing: -0.6,
  },
  heroTitleGradient: {
    color: '#0d9488',
  },
  heroSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    marginTop: 4,
    lineHeight: 20,
  },
  coachBubbleCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0fdfa',
    borderWidth: 1,
    borderColor: '#ccfbf1',
    borderRadius: 24,
    padding: 12,
    gap: 12,
    marginBottom: 20,
    shadowColor: '#0d9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  avatarWrapper: {
    position: 'relative',
  },
  coachAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: '#2dd4bf',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  bubbleContent: {
    flex: 1,
  },
  bubbleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  coachNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  coachNameText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#134e4a',
  },
  physioBadge: {
    backgroundColor: '#ccfbf1',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  physioText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0f766e',
  },
  bubbleMessage: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    lineHeight: 17,
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 18,
    padding: 4,
    marginBottom: 18,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
  },
  tabBtnTextActive: {
    color: '#0f172a',
    fontWeight: '800',
  },
  xpBonusBadge: {
    backgroundColor: '#0d9488',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  xpBonusText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
  },
  formSection: {
    gap: 14,
  },
  inputGroup: {
    gap: 6,
  },
  passwordHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
    marginLeft: 2,
  },
  forgotPasswordText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0d9488',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 50,
  },
  inputWrapperFocused: {
    borderColor: '#0d9488',
    backgroundColor: '#ffffff',
  },
  inputIcon: {
    marginRight: 8,
  },
  inputField: {
    flex: 1,
    height: 48,
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    paddingVertical: 0,
  },
  passwordToggle: {
    padding: 4,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    marginTop: 2,
  },
  errorBannerText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '700',
  },
  submitBtn: {
    marginTop: 6,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#0d9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  demoEnterBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  demoEnterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  demoBold: {
    fontWeight: '800',
    color: '#0d9488',
  },
  footerSection: {
    marginTop: 20,
    gap: 14,
  },
  trustChipsRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  trustChip: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
  },
  trustChipEmoji: {
    fontSize: 15,
  },
  trustChipText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
    marginTop: 3,
  },
  legalText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 12,
  },
  legalLink: {
    color: '#64748b',
    textDecorationLine: 'underline',
  },
});
