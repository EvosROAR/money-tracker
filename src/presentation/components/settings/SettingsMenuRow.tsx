import { Pressable, StyleSheet, View, type ReactNode } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useTheme } from '@/presentation/hooks/useTheme';
import { Text } from '@/presentation/components/ui/Text';

interface SettingsMenuRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  valueContent?: ReactNode;
  subtitle?: string;
  onPress?: () => void;
  loading?: boolean;
  isFirst?: boolean;
  iconColor?: string;
  active?: boolean;
}

export const SettingsMenuRow = ({
  icon,
  label,
  value,
  valueContent,
  subtitle,
  onPress,
  loading,
  isFirst,
  iconColor,
  active = false,
}: SettingsMenuRowProps) => {
  const { theme } = useTheme();
  const accent = iconColor ?? theme.colors.primary;
  const activeColor = '#10B981';

  return (
    <Pressable
      onPress={loading ? undefined : onPress}
      style={({ pressed }) => [
        styles.row,
        !isFirst && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.colors.border },
        pressed && onPress ? { opacity: 0.85 } : null,
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${accent}18` }]}>
        <Ionicons name={icon} size={20} color={accent} />
      </View>

      <View style={styles.content}>
        <Text variant="body" weight="medium">
          {label}
        </Text>
        {subtitle ? (
          <Text variant="caption" color="secondary" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {valueContent ? (
        <View
          style={[
            styles.valuePill,
            styles.valuePillIcon,
            {
              backgroundColor: active ? `${activeColor}22` : theme.colors.inputBackground,
            },
          ]}
        >
          {valueContent}
        </View>
      ) : value ? (
        <View
          style={[
            styles.valuePill,
            {
              backgroundColor: active ? `${activeColor}22` : theme.colors.inputBackground,
            },
          ]}
        >
          <Text
            variant="caption"
            weight="semiBold"
            style={active ? { color: activeColor } : undefined}
            color={active ? undefined : 'secondary'}
          >
            {value}
          </Text>
        </View>
      ) : null}

      {loading ? (
        <Text variant="caption" color="secondary">
          ...
        </Text>
      ) : onPress ? (
        <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
      ) : null}
    </Pressable>
  );
};

export const SettingsSectionHeader = ({ title }: { title: string }) => {
  const { theme } = useTheme();

  return (
    <Text
      variant="caption"
      weight="semiBold"
      color="secondary"
      style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}
    >
      {title.toUpperCase()}
    </Text>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 2,
  },
  valuePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  valuePillIcon: {
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.8,
  },
});
