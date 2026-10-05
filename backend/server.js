import dns from 'dns';
if (dns && typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}
import http from 'http';
import { Server } from 'socket.io';
import app from './src/app.js';
import { env } from './src/config/env.js';
import { setupChatSocket } from './src/sockets/chatSocket.js';
import { ExpiryAlertJob } from './src/jobs/expiryAlertJob.js';

const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Setup Real-time Chat Sockets
setupChatSocket(io);

// Expose io instance to app if needed
app.set('io', io);

// Periodic Expiry Alert Scan (Runs every 12 hours, plus once on startup)
const TWELVE_HOURS = 12 * 60 * 60 * 1000;
setTimeout(() => {
  ExpiryAlertJob.scanAndTriggerAlerts().catch((err) =>
    console.error('[Startup Job] Expiry scan error:', err.message)
  );
}, 5000);

setInterval(() => {
  ExpiryAlertJob.scanAndTriggerAlerts().catch((err) =>
    console.error('[Cron Job] Expiry scan error:', err.message)
  );
}, TWELVE_HOURS);

const PORT = env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🏥 PharmaConnect B2B API Server Running`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🛡️ CDSCO Regulatory Node: IND-MH-40194`);
  console.log(`⚙️ Environment: ${env.NODE_ENV}`);
  console.log(`====================================================`);
});

export { server, io };
