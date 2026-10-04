/**
 * Input sanitization, formatting, and validation utilities
 * Enforces strict US phone numbering (NANP), alphabetic name fields, and numeric constraints.
 */

/**
 * Format raw input as a standard US phone number: (XXX) XXX-XXXX
 * Strips all non-digit characters and truncates to 10 digits.
 * Automatically handles leading US country code '1' if pasted.
 */
export function formatUsPhone(input: string): string {
  if (!input) return "";

  // Extract only digits
  let digits = input.replace(/\D/g, "");

  // If user included leading US country code '1' with 11 digits, strip it
  if (digits.length === 11 && digits.startsWith("1")) {
    digits = digits.slice(1);
  }

  // Cap at 10 digits (Standard US phone length)
  digits = digits.slice(0, 10);

  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

/**
 * Validate US Phone Number (NANP standard: 10 digits, Area code & Central Office cannot start with 0 or 1)
 */
export function isValidUsPhone(phoneStr: string): boolean {
  const digits = phoneStr.replace(/\D/g, "");
  const cleanDigits = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;

  if (cleanDigits.length !== 10) return false;

  // NANP: Area code [2-9]XX and Exchange [2-9]XX
  const nanpRegex = /^[2-9]\d{2}[2-9]\d{6}$/;
  return nanpRegex.test(cleanDigits);
}

/**
 * Sanitize Full Name: Allow only letters (including accented letters), spaces, apostrophes, and hyphens.
 * Completely blocks digits, brackets, and random symbols.
 */
export function sanitizeName(nameStr: string): string {
  if (!nameStr) return "";
  // Keep only unicode letters, spaces, apostrophes, and hyphens
  return nameStr.replace(/[^a-zA-Z\s'\-]/g, "");
}

/**
 * Validate Full Name: Must be at least 2 characters and contain at least one letter
 */
export function isValidName(nameStr: string): boolean {
  const trimmed = nameStr.trim();
  if (trimmed.length < 2) return false;
  return /^[a-zA-Z\s'\-]+$/.test(trimmed) && /[a-zA-Z]/.test(trimmed);
}

/**
 * Sanitize ZIP Code: Strictly digits only, max 5 characters for US standard ZIP.
 */
export function sanitizeZipCode(zipStr: string): string {
  if (!zipStr) return "";
  return zipStr.replace(/\D/g, "").slice(0, 5);
}

/**
 * Sanitize generic numeric input with optional length limit.
 */
export function sanitizeDigits(input: string, maxLen?: number): string {
  if (!input) return "";
  const digits = input.replace(/\D/g, "");
  return maxLen ? digits.slice(0, maxLen) : digits;
}

/**
 * Format Credit Card Number with spaces: XXXX XXXX XXXX XXXX (16 digits)
 */
export function formatCardNumber(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 16);
  const parts = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.slice(i, i + 4));
  }
  return parts.join(" ");
}

/**
 * Format Card Expiry: MM/YY (4 digits)
 */
export function formatCardExpiry(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
}
