/**
 * Get the initial theme setting based on user preference or time of day
 * @returns {boolean} - True for dark mode, false for light mode
 */
export function getInitialTheme() {
  try {
    // Check if user has explicitly set a theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    
    // If no saved preference, use time-based default
    const currentHour = new Date().getHours();
    const isDaytime = currentHour >= 9 && currentHour < 19; // 9am to 7pm
    
    return !isDaytime; // Return dark mode for nighttime, light mode for daytime
  } catch {
    return true; // Fallback to dark mode if there's an error
  }
}

/**
 * Apply theme to document (utility function)
 * @param {boolean} isDark - True for dark mode, false for light mode
 */
export function applyTheme(isDark) {
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  try {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  } catch (e) {
    console.error("Could not save theme preference:", e);
  }
}