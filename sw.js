// sw.js - Service Worker for Notification API (no push server needed)

// Install event
self.addEventListener('install', function(event) {
  console.log('Service Worker installed');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', function(event) {
  console.log('Service Worker activated');
  event.waitUntil(clients.claim());
});

// Notification click handler
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  const data = event.notification.data || {};
  const url = data.url || '/';
  
  event.waitUntil(
    clients.matchAll({ 
      type: 'window',
      includeUncontrolled: true 
    })
    .then(windowClients => {
      // Check if there's already a window/tab open
      for (let client of windowClients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window/tab
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
    .then(client => {
      // If action is 'reply', focus the input
      if (event.action === 'reply' && client) {
        client.postMessage({ type: 'FOCUS_INPUT' });
      }
    })
  );
});

// Message handler
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, sender, messageId } = event.data.payload || {};
    self.registration.showNotification(title || 'CLOUDUAT', {
      body: body || 'New message',
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: `msg-${messageId || Date.now()}`,
      renotify: true,
      vibrate: [200, 100, 200],
      data: {
        url: self.location.origin,
        sender: sender,
        messageId: messageId
      },
      actions: [
        {
          action: 'open',
          title: '💬 Open Chat'
        },
        {
          action: 'reply',
          title: '↩️ Reply'
        }
      ]
    });
  }
});
