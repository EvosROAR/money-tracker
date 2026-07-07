const MIN_PIN_LENGTH = 4;
const MAX_PIN_LENGTH = 6;

export const isValidPin = (pin: string): boolean =>
  /^\d+$/.test(pin) && pin.length >= MIN_PIN_LENGTH && pin.length <= MAX_PIN_LENGTH;

export const hashPin = (pin: string): string => {
  let hash = 5381;
  for (let i = 0; i < pin.length; i += 1) {
    hash = (hash * 33) ^ pin.charCodeAt(i);
  }
  return `pin_${(hash >>> 0).toString(16)}`;
};

export const verifyPin = (pin: string, storedHash: string | null): boolean =>
  Boolean(storedHash) && hashPin(pin) === storedHash;
