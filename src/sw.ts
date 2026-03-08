/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'

declare const self: ServiceWorkerGlobalScope

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

// ─── Notification scheduling ──────────────────────────────────────────────────

const NOTIF_KEY = 'habitual_notif_time'

let notifTimer: ReturnType<typeof setTimeout> | null = null

function scheduleNotification(time: string) {
  if (notifTimer) clearTimeout(notifTimer)

  const [hh, mm] = time.split(':').map(Number)
  const now = new Date()
  const target = new Date()
  target.setHours(hh, mm, 0, 0)
  if (target <= now) target.setDate(target.getDate() + 1)

  const delay = target.getTime() - now.getTime()

  notifTimer = setTimeout(async () => {
    await self.registration.showNotification('Habitual 🌿', {
      body: 'Time to check in on your habits! Small steps, big change.',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'habitual-daily',
    })
    // Reschedule for tomorrow
    scheduleNotification(time)
  }, delay)
}

// Re-read stored time when SW starts (e.g. after browser restart)
async function restoreSchedule() {
  try {
    const cache = await caches.open('habitual-notif-v1')
    const resp = await cache.match(NOTIF_KEY)
    if (resp) {
      const time = await resp.text()
      if (time) scheduleNotification(time)
    }
  } catch {
    // Ignore
  }
}

self.addEventListener('activate', () => {
  restoreSchedule()
})

self.addEventListener('message', async (event) => {
  if (!event.data) return

  if (event.data.type === 'SCHEDULE_NOTIFICATION') {
    const time: string = event.data.time
    scheduleNotification(time)
    // Persist time so SW can restore after restart
    const cache = await caches.open('habitual-notif-v1')
    await cache.put(NOTIF_KEY, new Response(time))
  }

  if (event.data.type === 'CANCEL_NOTIFICATION') {
    if (notifTimer) {
      clearTimeout(notifTimer)
      notifTimer = null
    }
    const cache = await caches.open('habitual-notif-v1')
    await cache.delete(NOTIF_KEY)
  }
})

// Handle notification click — open / focus the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) return client.focus()
      }
      return self.clients.openWindow('/')
    }),
  )
})
