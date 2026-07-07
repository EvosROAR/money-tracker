import { Pressable, ScrollView, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { CATEGORY_ICONS, CategoryIconName } from '@/lib/constants/categoryOptions';
import { useTheme } from '@/presentation/hooks/useTheme';

interface IconPickerProps {
  value: string;
  color: string;
  onChange: (icon: string) => void;
}

export const IconPicker = ({ value, color, onChange }: IconPickerProps) => {
  const { theme } = useTheme();

  return (
    <ScrollView contentContainerStyle={styles.grid}>
      {CATEGORY_ICONS.map((icon) => {
        const selected = value === icon;
        return (
          <Pressable
            key={icon}
            onPress={() => onChange(icon)}
            style={[
              styles.cell,
              {
                backgroundColor: selected ? `${color}33` : theme.colors.inputBackground,
                borderColor: selected ? color : theme.colors.border,
              },
            ]}
          >
            <Ionicons name={icon as CategoryIconName} size={24} color={selected ? color : theme.colors.textSecondary} />
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  cell: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
});
