import { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/presentation/hooks/useTheme';
import { Text } from '@/presentation/components/ui/Text';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export const AuthLayout = ({ title, subtitle, children, footer }: AuthLayoutProps) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + theme.spacing['3xl'],
            paddingBottom: insets.bottom + theme.spacing.xl,
            paddingHorizontal: theme.spacing.xl,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={[styles.logo, { backgroundColor: theme.colors.primary }]}>
            <Text variant="h2" weight="bold" color="inverse">
              ₮
            </Text>
          </View>
          <Text variant="h1" weight="bold" style={styles.title}>
            {title}
          </Text>
          {subtitle && (
            <Text variant="body" color="secondary" style={styles.subtitle}>
              {subtitle}
            </Text>
          )}
        </View>

        <View style={styles.form}>{children}</View>
        {footer && <View style={styles.footer}>{footer}</View>}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 8,
  },
  form: {
    gap: 16,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
});
