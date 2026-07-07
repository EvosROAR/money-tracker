import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useTheme } from '@/presentation/hooks/useTheme';
import { AppTabBar } from '@/presentation/navigation/AppTabBar';
import { DashboardScreen } from '@/presentation/screens/dashboard/DashboardScreen';
import { SettingsScreen } from '@/presentation/screens/settings/SettingsScreen';
import { ProfileScreen } from '@/presentation/screens/settings/ProfileScreen';
import { CategoryListScreen } from '@/presentation/screens/categories/CategoryListScreen';
import { CategoryFormScreen } from '@/presentation/screens/categories/CategoryFormScreen';
import { TransactionListScreen } from '@/presentation/screens/transactions/TransactionListScreen';
import { TransactionFormScreen } from '@/presentation/screens/transactions/TransactionFormScreen';
import { RecurringListScreen } from '@/presentation/screens/recurring/RecurringListScreen';
import { RecurringFormScreen } from '@/presentation/screens/recurring/RecurringFormScreen';
import { BudgetListScreen } from '@/presentation/screens/budget/BudgetListScreen';
import { BudgetFormScreen } from '@/presentation/screens/budget/BudgetFormScreen';
import { ReportsScreen } from '@/presentation/screens/reports/ReportsScreen';
import {
  BudgetStackParamList,
  MainTabParamList,
  ReportsStackParamList,
  SettingsStackParamList,
  TransactionsStackParamList,
} from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();
const TransactionsStack = createNativeStackNavigator<TransactionsStackParamList>();
const BudgetStack = createNativeStackNavigator<BudgetStackParamList>();
const ReportsStack = createNativeStackNavigator<ReportsStackParamList>();

const SettingsNavigator = () => (
  <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
    <SettingsStack.Screen name="SettingsMain" component={SettingsScreen} />
    <SettingsStack.Screen name="Profile" component={ProfileScreen} />
    <SettingsStack.Screen name="CategoryList" component={CategoryListScreen} />
    <SettingsStack.Screen name="CategoryForm" component={CategoryFormScreen} />
  </SettingsStack.Navigator>
);

const TransactionsNavigator = () => (
  <TransactionsStack.Navigator screenOptions={{ headerShown: false }}>
    <TransactionsStack.Screen name="TransactionList" component={TransactionListScreen} />
    <TransactionsStack.Screen name="TransactionForm" component={TransactionFormScreen} />
    <TransactionsStack.Screen name="RecurringList" component={RecurringListScreen} />
    <TransactionsStack.Screen name="RecurringForm" component={RecurringFormScreen} />
  </TransactionsStack.Navigator>
);

const BudgetNavigator = () => (
  <BudgetStack.Navigator screenOptions={{ headerShown: false }}>
    <BudgetStack.Screen name="BudgetList" component={BudgetListScreen} />
    <BudgetStack.Screen name="BudgetForm" component={BudgetFormScreen} />
  </BudgetStack.Navigator>
);

const ReportsNavigator = () => (
  <ReportsStack.Navigator screenOptions={{ headerShown: false }}>
    <ReportsStack.Screen name="ReportsMain" component={ReportsScreen} />
  </ReportsStack.Navigator>
);

export const MainNavigator = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarIcon: ({ color, size }) => {
          const icons: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
            Home: 'home-outline',
            Transactions: 'list-outline',
            Budget: 'wallet-outline',
            Reports: 'bar-chart-outline',
            Settings: 'settings-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} options={{ tabBarLabel: t('tabs.home') }} />
      <Tab.Screen
        name="Transactions"
        component={TransactionsNavigator}
        options={{ tabBarLabel: t('tabs.transactions') }}
      />
      <Tab.Screen
        name="Budget"
        component={BudgetNavigator}
        options={{ tabBarLabel: t('tabs.budget') }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsNavigator}
        options={{ tabBarLabel: t('tabs.reports') }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsNavigator}
        options={{ tabBarLabel: t('tabs.settings') }}
      />
    </Tab.Navigator>
  );
};
