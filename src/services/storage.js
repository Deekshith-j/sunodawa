// IndexedDB helpers for offline cache
const DB_NAME = 'sunodawa-db'
const DB_VERSION = 1
const SCAN_STORE = 'scans'

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains(SCAN_STORE)) {
        const store = db.createObjectStore(SCAN_STORE, { keyPath: 'id' })
        store.createIndex('timestamp', 'timestamp', { unique: false })
      }
    }
  })
}

export async function saveScanToIDB(scan) {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(SCAN_STORE, 'readwrite')
      tx.objectStore(SCAN_STORE).put(scan)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } catch (e) {
    console.error('IDB save error:', e)
  }
}

export async function getRecentScansFromIDB(limit = 5) {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(SCAN_STORE, 'readonly')
      const store = tx.objectStore(SCAN_STORE)
      const request = store.getAll()
      request.onsuccess = () => {
        const results = request.result
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, limit)
        resolve(results)
      }
      request.onerror = () => reject(request.error)
    })
  } catch (e) {
    console.error('IDB read error:', e)
    return []
  }
}

export async function getScanFromIDB(id) {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(SCAN_STORE, 'readonly')
      const request = tx.objectStore(SCAN_STORE).get(id)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  } catch (e) {
    return null
  }
}

// Schedule web notification
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function scheduleNotification(title, body, time) {
  const delay = time - Date.now()
  if (delay < 0) return
  setTimeout(() => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: 'sunodawa-reminder',
      })
    }
  }, delay)
}
