import { AppProviders } from '@/bootstrap/providers/AppProviders';
import { NavigationProvider } from '@/bootstrap/providers/NavigationProvider';
import { AuthBootstrap } from '@/bootstrap/AuthBootstrap';
import { RecurringBootstrap } from '@/bootstrap/RecurringBootstrap';
import { ReminderBootstrap } from '@/bootstrap/ReminderBootstrap';
import { RootNavigator } from '@/presentation/navigation/RootNavigator';
import { BiometricLockGate } from '@/presentation/components/security/BiometricLockGate';
import { PinLockGate } from '@/presentation/components/security/PinLockGate';

export default function App() {
  return (
    <AppProviders>
      <AuthBootstrap />
      <RecurringBootstrap />
      <ReminderBootstrap />
      <NavigationProvider>
        <RootNavigator />
      </NavigationProvider>
      <BiometricLockGate />
      <PinLockGate />
    </AppProviders>
  );
}
