import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/presentation/hooks/useTheme';

export const AppTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, Platform.OS === 'web' ? 8 : 0);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.tabBar,
          borderTopColor: theme.colors.tabBarBorder,
          paddingBottom: bottomPad + 6,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          typeof options.tabBarLabel === 'string'
            ? options.tabBarLabel
            : options.title ?? route.name;
        const isFocused = state.index === index;
        const inactiveColor = Platform.OS === 'web' ? '#B4BCC8' : theme.colors.textSecondary;
        const color = isFocused ? theme.colors.primary : inactiveColor;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const icon = options.tabBarIcon?.({
          focused: isFocused,
          color,
          size: 22,
        });

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            style={({ pressed }) => [
              styles.tab,
              pressed ? styles.tabPressed : null,
            ]}
          >
            <View style={styles.iconWrap}>{icon}</View>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
              style={[
                styles.label,
                { color, fontWeight: isFocused ? '600' : '500' },
              ]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
    ...(Platform.OS === 'web'
      ? ({
          overflow: 'visible',
        } as object)
      : null),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 2,
    minHeight: 52,
    gap: 3,
  },
  tabPressed: {
    opacity: 0.75,
  },
  iconWrap: {
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center',
    width: '100%',
    ...(Platform.OS === 'web'
      ? ({
          userSelect: 'none',
        } as object)
      : null),
  },
});
