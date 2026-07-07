import { View, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { CategoryIconName } from '@/lib/constants/categoryOptions';

interface CategoryIconProps {
  icon: string;
  color: string;
  size?: number;
}

export const CategoryIcon = ({ icon, color, size = 22 }: CategoryIconProps) => {
  return (
    <View style={[styles.wrapper, { backgroundColor: `${color}22` }]}>
      <Ionicons name={icon as CategoryIconName} size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
