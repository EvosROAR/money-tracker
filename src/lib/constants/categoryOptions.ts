import type { ComponentProps } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';

export type CategoryIconName = ComponentProps<typeof Ionicons>['name'];

export const CATEGORY_ICONS: CategoryIconName[] = [
  'restaurant',
  'car',
  'cart',
  'receipt',
  'game-controller',
  'medical',
  'school',
  'wallet',
  'laptop',
  'trending-up',
  'gift',
  'home',
  'fitness',
  'airplane',
  'cafe',
  'bus',
  'card',
  'cash',
  'pizza',
  'shirt',
  'phone-portrait',
  'book',
  'heart',
  'paw',
  'ellipsis-horizontal',
];

export const CATEGORY_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
  '#74B9FF',
  '#2ECC71',
  '#27AE60',
  '#1ABC9C',
  '#F39C12',
  '#E74C3C',
  '#9B59B6',
  '#3498DB',
  '#1A1D26',
  '#A0A0A0',
];
