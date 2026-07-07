import { Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/presentation/hooks/useTheme';
import { Text } from '@/presentation/components/ui/Text';

export interface PickerOption<T extends string> {
  value: T;
  label: string;
  subtitle?: string;
}

interface OptionPickerModalProps<T extends string> {
  visible: boolean;
  title: string;
  options: PickerOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
  onClose: () => void;
  footer?: string;
}

export const OptionPickerModal = <T extends string>({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
  footer,
}: OptionPickerModalProps<T>) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              paddingBottom: Math.max(insets.bottom, 16),
            },
            Platform.OS === 'web' ? styles.sheetWeb : null,
          ]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={[styles.handle, { backgroundColor: theme.colors.border }]} />
          <Text variant="h3" weight="bold" style={styles.title}>
            {title}
          </Text>

          <ScrollView style={styles.list} bounces={false}>
            {options.map((option) => {
              const isSelected = option.value === selected;

              return (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    onSelect(option.value);
                    onClose();
                  }}
                  style={[
                    styles.option,
                    {
                      backgroundColor: isSelected ? `${theme.colors.primary}14` : 'transparent',
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <View style={styles.optionText}>
                    <Text variant="body" weight={isSelected ? 'semiBold' : 'medium'}>
                      {option.label}
                    </Text>
                    {option.subtitle ? (
                      <Text variant="caption" color="secondary" style={styles.subtitle}>
                        {option.subtitle}
                      </Text>
                    ) : null}
                  </View>
                  {isSelected ? (
                    <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} />
                  ) : (
                    <View style={styles.optionSpacer} />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>

          {footer ? (
            <Text variant="caption" color="secondary" style={styles.footer}>
              {footer}
            </Text>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
    paddingHorizontal: 20,
    maxHeight: '80%',
  },
  sheetWeb: {
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
    marginBottom: 24,
    borderRadius: 24,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    marginBottom: 12,
  },
  list: {
    maxHeight: 360,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  subtitle: {
    marginTop: 2,
  },
  optionSpacer: {
    width: 22,
  },
  footer: {
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 18,
  },
});
