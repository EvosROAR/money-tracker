import { hashPin, isValidPin, verifyPin } from '@/lib/utils/pin';

describe('pin utils', () => {
  it('validates pin length and digits', () => {
    expect(isValidPin('1234')).toBe(true);
    expect(isValidPin('123')).toBe(false);
    expect(isValidPin('12ab')).toBe(false);
  });

  it('hashes and verifies pin', () => {
    const hash = hashPin('4321');
    expect(verifyPin('4321', hash)).toBe(true);
    expect(verifyPin('0000', hash)).toBe(false);
  });
});
