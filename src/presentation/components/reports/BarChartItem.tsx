import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/presentation/hooks/useTheme';
import { Text } from '@/presentation/components/ui/Text';

interface BarChartItemProps {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  valueLabel: string;
}

export const BarChartItem = ({
  label,
  value,
  maxValue,
  color,
  valueLabel,
}: BarChartItemProps) => {
  const { theme } = useTheme();
  const widthPercent = maxValue > 0 ? Math.max((value / maxValue) * 100, 2) : 0;

  return (
    <View style={styles.row}>
      <Text variant="caption" numberOfLines={1} style={styles.label}>
        {label}
      </Text>
      <View style={[styles.track, { backgroundColor: theme.colors.inputBackground }]}>
        <View style={[styles.fill, { width: `${widthPercent}%`, backgroundColor: color }]} />
      </View>
      <Text variant="caption" color="secondary" style={styles.value}>
        {valueLabel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    marginBottom: 12,
    gap: 6,
  },
  label: {
    maxWidth: '100%',
  },
  track: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 5,
  },
  value: {
    textAlign: 'right',
  },
});
