import { precacheAndRoute } from 'workbox-precaching';

// Precaching injected by vite-plugin-pwa during build
precacheAndRoute(self.__WB_MANIFEST || []);

self.addEventListener('push', function (e) {
    if (e.data) {
        try {
            const pushData = e.data.json();
            const options = {
                body: pushData.body || pushData.message || 'New update from RepairDesk',
                icon: '/icons/icon-192.png',
                badge: '/icons/icon-192.png',
                vibrate: [100, 50, 100],
                data: {
                    dateOfArrival: Date.now(),
                    primaryKey: pushData.taskId || pushData.id || '1',
                    url: pushData.url || '/'
                }
            };
            e.waitUntil(
                self.registration.showNotification(pushData.title || 'RepairDesk', options)
            );
        } catch (err) {
            // Backup text message
            e.waitUntil(
                self.registration.showNotification('RepairDesk Update', {
                    body: e.data.text(),
                    icon: '/icons/icon-192.png'
                })
            );
        }
    }
});

self.addEventListener('notificationclick', function (e) {
    e.notification.close();
    const urlToOpen = e.notification.data?.url || '/';

    e.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
            if (clientList.length > 0) {
                let client = clientList[0];
                for (let i = 0; i < clientList.length; i++) {
                    if (clientList[i].focused) {
                        client = clientList[i];
                    }
                }
                return client.focus();
            }
            return clients.openWindow(urlToOpen);
        })
    );
});
