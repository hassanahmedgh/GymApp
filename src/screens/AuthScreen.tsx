import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../state/AuthContext';
import { colors, spacing, radius, font, tint } from '../theme';

type Mode = 'signin' | 'signup';

export function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { signIn, signUp, busy, error, clearError } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPass, setShowPass] = useState(false);

  const isSignup = mode === 'signup';

  function switchMode(m: Mode) {
    clearError();
    setMode(m);
  }

  async function submit() {
    try {
      if (isSignup) await signUp(name, email, password, remember);
      else await signIn(email, password, remember);
    } catch {
      // error surfaced via context
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + spacing.xxxl, paddingBottom: insets.bottom + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand */}
        <View style={styles.brand}>
          <View style={[styles.logo, { backgroundColor: tint(colors.primary, 0.16) }]}>
            <Ionicons name="flame" size={34} color={colors.primary} />
          </View>
          <Text style={styles.appName}>FastFit</Text>
          <Text style={styles.tagline}>Fasting · Workouts · Progress</Text>
        </View>

        {/* Mode switch */}
        <View style={styles.seg}>
          <Pressable
            onPress={() => switchMode('signin')}
            style={[styles.segBtn, !isSignup && styles.segBtnActive]}
          >
            <Text style={[styles.segText, !isSignup && styles.segTextActive]}>Sign in</Text>
          </Pressable>
          <Pressable
            onPress={() => switchMode('signup')}
            style={[styles.segBtn, isSignup && styles.segBtnActive]}
          >
            <Text style={[styles.segText, isSignup && styles.segTextActive]}>Sign up</Text>
          </Pressable>
        </View>

        {/* Fields */}
        <View style={styles.form}>
          {isSignup ? (
            <Field
              icon="person-outline"
              placeholder="Name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          ) : null}
          <Field
            icon="mail-outline"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Field
            icon="lock-closed-outline"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPass}
            autoCapitalize="none"
            right={
              <Pressable onPress={() => setShowPass((v) => !v)} hitSlop={8}>
                <Ionicons
                  name={showPass ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textMuted}
                />
              </Pressable>
            }
          />

          {/* Remember me */}
          <Pressable style={styles.remember} onPress={() => setRemember((v) => !v)}>
            <View
              style={[
                styles.rememberBox,
                remember
                  ? { backgroundColor: colors.primary, borderColor: colors.primary }
                  : { borderColor: colors.borderStrong },
              ]}
            >
              {remember ? <Ionicons name="checkmark" size={14} color={colors.white} /> : null}
            </View>
            <Text style={styles.rememberText}>Remember me</Text>
          </Pressable>

          {error ? (
            <View style={styles.error}>
              <Ionicons name="alert-circle" size={16} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Pressable
            onPress={submit}
            disabled={busy}
            style={({ pressed }) => [styles.submit, (pressed || busy) && { opacity: 0.8 }]}
          >
            {busy ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.submitText}>{isSignup ? 'Create account' : 'Sign in'}</Text>
            )}
          </Pressable>

          <Text style={styles.switchHint}>
            {isSignup ? 'Already have an account? ' : "Don't have an account? "}
            <Text style={styles.switchLink} onPress={() => switchMode(isSignup ? 'signin' : 'signup')}>
              {isSignup ? 'Sign in' : 'Sign up'}
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  icon,
  right,
  ...props
}: {
  icon: string;
  right?: React.ReactNode;
} & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.field}>
      <Ionicons name={icon as any} size={19} color={colors.textMuted} />
      <TextInput
        {...props}
        placeholderTextColor={colors.textFaint}
        style={styles.fieldInput}
      />
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing.xl, minHeight: '100%' },
  brand: { alignItems: 'center', marginBottom: spacing.xxl },
  logo: {
    width: 78,
    height: 78,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  appName: { color: colors.text, fontSize: 30, fontWeight: '900', letterSpacing: 0.5 },
  tagline: { color: colors.textMuted, fontSize: font.small, marginTop: 4 },

  seg: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
    marginBottom: spacing.xl,
  },
  segBtn: { flex: 1, paddingVertical: 11, borderRadius: radius.pill, alignItems: 'center' },
  segBtnActive: { backgroundColor: colors.primary },
  segText: { color: colors.textMuted, fontSize: font.body, fontWeight: '800' },
  segTextActive: { color: colors.white },

  form: {},
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  fieldInput: { flex: 1, color: colors.text, fontSize: font.body, fontWeight: '600', paddingVertical: 15 },
  remember: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  rememberBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rememberText: { color: colors.text, fontSize: font.small, fontWeight: '600' },
  error: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: tint(colors.danger, 0.1),
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  errorText: { color: colors.danger, fontSize: font.small, fontWeight: '600', flex: 1 },
  submit: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  submitText: { color: colors.white, fontSize: font.body, fontWeight: '800' },
  switchHint: { color: colors.textMuted, fontSize: font.small, textAlign: 'center', marginTop: spacing.lg },
  switchLink: { color: colors.primary, fontWeight: '800' },
});
