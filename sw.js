

const CACHE_NAME = 'dockflow-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/constants.tsx',
  '/utils.ts',
  '/services/geminiService.ts',
  '/components/AIAssistantModal.tsx',
  '/components/ActivityFeed.tsx',
  '/components/AppointmentList.tsx',
  '/components/AppointmentModal.tsx',
  '/components/CustomerPanel.tsx',
  '/components/Customers.tsx',
  '/components/CheckInOutLog.tsx',
  '/components/ConfirmationModal.tsx',
  '/components/Dashboard.tsx',
  '/components/DetailPanel.tsx',
  '/components/DockModal.tsx',
  '/components/DockScheduler.tsx',
  '/components/GateManagement.tsx',
  '/components/GatePassModal.tsx',
  '/components/Header.tsx',
  '/components/Help.tsx',
  '/components/AddRolePanel.tsx',
  '/components/MaintenanceModal.tsx',
  '/components/Operations.tsx',
  '/components/ReportDelayModal.tsx',
  '/components/Reports.tsx',
  '/components/Settings.tsx',
  '/components/Sidebar.tsx',
  '/components/SpotAppointmentModal.tsx',
  '/components/StartOperationModal.tsx',
  '/components/WarehouseModal.tsx',
  '/components/Configurations.tsx',
  '/components/TimeSlotsConfig.tsx',
  '/components/icons/Icons.tsx',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap',
  'https://esm.sh/react@18.3.1',
  'https://esm.sh/react-dom@18.3.1/client',
  'https://esm.sh/react@18.3.1/jsx-runtime',
  'https://esm.sh/@google/genai@^1.8.0',
  'https://esm.sh/recharts@2.12.7'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache).catch(err => {
            console.error('Failed to cache all URLs:', err);
        });
      })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }

      try {
        const networkResponse = await fetch(event.request);
        if (networkResponse.ok) {
          await cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      } catch (error) {
        console.error('Fetch failed; returning offline fallback if available.', error);
        // Optional: return a fallback page
        // const cachedPage = await cache.match('/offline.html');
        // if (cachedPage) return cachedPage;
        return new Response('Network error trying to fetch resource.', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' },
        });
      }
    })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});