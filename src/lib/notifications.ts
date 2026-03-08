export function scheduleViaServiceWorker(time: string) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((reg) => {
      reg.active?.postMessage({ type: 'SCHEDULE_NOTIFICATION', time })
    })
  }
}

export function cancelScheduledNotification() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((reg) => {
      reg.active?.postMessage({ type: 'CANCEL_NOTIFICATION' })
    })
  }
}

export async function requestAndScheduleNotification(time: string): Promise<boolean> {
  if (!('Notification' in window)) return false
  let permission = Notification.permission
  if (permission === 'default') {
    permission = await Notification.requestPermission()
  }
  if (permission !== 'granted') return false
  scheduleViaServiceWorker(time)
  return true
}
