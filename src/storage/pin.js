import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

const PIN_KEY = 'oopsy_pin';

export const setPin = (pin) => SecureStore.setItemAsync(PIN_KEY, pin);
export const clearPin = () => SecureStore.deleteItemAsync(PIN_KEY);
export const checkPin = async (pin) => (await SecureStore.getItemAsync(PIN_KEY)) === pin;

export const biometricAvailable = async () => {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && enrolled;
  } catch {
    return false;
  }
};

export const authenticateBiometric = async () => {
  try {
    const res = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock Oopsy',
      cancelLabel: 'Use PIN',
      disableDeviceFallback: true,
    });
    return res.success;
  } catch {
    return false;
  }
};
