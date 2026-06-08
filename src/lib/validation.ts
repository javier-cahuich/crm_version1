const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

const PHONE_CHARS_REGEX = /^[\d\s().+-]+$/;
const PHONE_LOCAL_DIGITS_REGEX = /^[1-9]\d{9}$/;

export function isValidPhone(phone: string): boolean {
  const trimmed = phone.trim();
  if (!trimmed || !PHONE_CHARS_REGEX.test(trimmed)) return false;

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) return PHONE_LOCAL_DIGITS_REGEX.test(digits);
  if (digits.length === 12 && digits.startsWith("52")) {
    return PHONE_LOCAL_DIGITS_REGEX.test(digits.slice(2));
  }
  return false;
}
