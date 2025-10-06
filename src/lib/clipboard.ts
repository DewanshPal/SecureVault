/**
 * Copies text to clipboard and automatically clears it after a specified time
 */
export async function copyToClipboardWithClear(
  text: string, 
  clearAfterSeconds: number = 15
): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    
    // Set a timeout to clear the clipboard
    setTimeout(async () => {
      try {
        // Check if the clipboard still contains our text before clearing
        const currentClipboard = await navigator.clipboard.readText();
        if (currentClipboard === text) {
          await navigator.clipboard.writeText('');
        }
      } catch (error) {
        // Silently fail if we can't read/clear clipboard
        console.log('Could not clear clipboard:', error);
      }
    }, clearAfterSeconds * 1000);
    
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Shows a temporary notification
 */
export function showNotification(message: string, type: 'success' | 'error' | 'info' = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
    type === 'success' ? 'bg-green-500 text-white' :
    type === 'error' ? 'bg-red-500 text-white' :
    'bg-blue-500 text-white'
  }`;
  notification.textContent = message;
  
  // Add to page
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
    notification.style.opacity = '1';
  }, 10);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    notification.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}
