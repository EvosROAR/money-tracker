import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { CATEGORY_COLORS } from '@/lib/constants/categoryOptions';
import { useTheme } from '@/presentation/hooks/useTheme';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export const ColorPicker = ({ value, onChange }: ColorPickerProps) => {
  const { theme } = useTheme();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {CATEGORY_COLORS.map((color) => (
        <Pressable
          key={color}
          onPress={() => onChange(color)}
          style={[
            styles.swatch,
            { backgroundColor: color },
            value === color && { borderColor: theme.colors.text, borderWidth: 3 },
          ]}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
});
