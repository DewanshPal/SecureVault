import CryptoJS from 'crypto-js';

/**
 * Generates a random encryption key based on user password and email
 * This ensures the key is user-specific and deterministic
 */
export function generateEncryptionKey(password: string, email: string): string {
  return CryptoJS.PBKDF2(password + email, email, {
    keySize: 256 / 32,
    iterations: 10000
  }).toString();
}

/**
 * Encrypts data using AES encryption
 */
export function encryptData(data: string, key: string): string {
  if (!data) return '';
  try {
    return CryptoJS.AES.encrypt(data, key).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    return '';
  }
}

/**
 * Decrypts data using AES decryption
 */
export function decryptData(encryptedData: string, key: string): string {
  if (!encryptedData) return '';
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
}

/**
 * Encrypts a vault item for storage
 */
export function encryptVaultItem(item: any, encryptionKey: string) {
  return {
    ...item,
    title: encryptData(item.title || '', encryptionKey),
    username: encryptData(item.username || '', encryptionKey),
    password: encryptData(item.password || '', encryptionKey),
    url: encryptData(item.url || '', encryptionKey),
    notes: encryptData(item.notes || '', encryptionKey),
    tags: (item.tags || []).map((tag: string) => encryptData(tag, encryptionKey))
  };
}

/**
 * Decrypts a vault item for display
 */
export function decryptVaultItem(encryptedItem: any, encryptionKey: string) {
  return {
    ...encryptedItem,
    title: decryptData(encryptedItem.title || '', encryptionKey),
    username: decryptData(encryptedItem.username || '', encryptionKey),
    password: decryptData(encryptedItem.password || '', encryptionKey),
    url: decryptData(encryptedItem.url || '', encryptionKey),
    notes: decryptData(encryptedItem.notes || '', encryptionKey),
    tags: (encryptedItem.tags || []).map((tag: string) => decryptData(tag, encryptionKey))
  };
}
