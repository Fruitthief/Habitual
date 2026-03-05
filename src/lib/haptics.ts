/** Trigger haptic feedback if supported */
export function haptic(pattern: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'light') {
  if (!navigator.vibrate) return
  const patterns: Record<string, number | number[]> = {
    light: 10,
    medium: 25,
    heavy: 50,
    success: [10, 50, 10],
    error: [50, 30, 50],
  }
  navigator.vibrate(patterns[pattern])
}
