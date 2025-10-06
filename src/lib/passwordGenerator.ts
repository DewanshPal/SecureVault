export interface PasswordOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilar: boolean;
}

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

// Characters that look similar and might be confusing
const SIMILAR_CHARS = 'il1Lo0O';

/**
 * Generates a secure password based on the provided options
 */
export function generatePassword(options: PasswordOptions): string {
  let charset = '';
  
  if (options.includeUppercase) {
    charset += options.excludeSimilar ? 
      UPPERCASE.replace(/[OIL]/g, '') : 
      UPPERCASE;
  }
  
  if (options.includeLowercase) {
    charset += options.excludeSimilar ? 
      LOWERCASE.replace(/[oil]/g, '') : 
      LOWERCASE;
  }
  
  if (options.includeNumbers) {
    charset += options.excludeSimilar ? 
      NUMBERS.replace(/[01]/g, '') : 
      NUMBERS;
  }
  
  if (options.includeSymbols) {
    charset += SYMBOLS;
  }
  
  if (charset === '') {
    throw new Error('At least one character type must be selected');
  }
  
  // Ensure at least one character from each selected type
  let password = '';
  const requiredChars: string[] = [];
  
  if (options.includeUppercase) {
    const chars = options.excludeSimilar ? 
      UPPERCASE.replace(/[OIL]/g, '') : 
      UPPERCASE;
    requiredChars.push(chars[Math.floor(Math.random() * chars.length)]);
  }
  
  if (options.includeLowercase) {
    const chars = options.excludeSimilar ? 
      LOWERCASE.replace(/[oil]/g, '') : 
      LOWERCASE;
    requiredChars.push(chars[Math.floor(Math.random() * chars.length)]);
  }
  
  if (options.includeNumbers) {
    const chars = options.excludeSimilar ? 
      NUMBERS.replace(/[01]/g, '') : 
      NUMBERS;
    requiredChars.push(chars[Math.floor(Math.random() * chars.length)]);
  }
  
  if (options.includeSymbols) {
    requiredChars.push(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
  }
  
  // Add required characters
  password += requiredChars.join('');
  
  // Fill the rest with random characters
  for (let i = password.length; i < options.length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password to avoid predictable patterns
  return shuffleString(password);
}

/**
 * Shuffles a string randomly
 */
function shuffleString(str: string): string {
  const array = str.split('');
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array.join('');
}

/**
 * Calculates password strength score (0-100)
 */
export function calculatePasswordStrength(password: string): {
  score: number;
  feedback: string[];
} {
  let score = 0;
  const feedback: string[] = [];
  
  // Length score
  if (password.length >= 12) {
    score += 25;
  } else if (password.length >= 8) {
    score += 15;
    feedback.push('Consider using at least 12 characters');
  } else {
    feedback.push('Password should be at least 8 characters');
  }
  
  // Character variety
  if (/[a-z]/.test(password)) score += 15;
  else feedback.push('Add lowercase letters');
  
  if (/[A-Z]/.test(password)) score += 15;
  else feedback.push('Add uppercase letters');
  
  if (/[0-9]/.test(password)) score += 15;
  else feedback.push('Add numbers');
  
  if (/[^a-zA-Z0-9]/.test(password)) score += 20;
  else feedback.push('Add special characters');
  
  // Avoid common patterns
  if (!/(.)\1{2,}/.test(password)) score += 10;
  else feedback.push('Avoid repeating characters');
  
  return { score, feedback };
}
