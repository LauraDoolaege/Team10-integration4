import 'dotenv/config';
import express from 'express';
import http from 'http';
import https from 'https';
import fs from 'fs';
import { Server } from 'socket.io';
import os from 'os';
import { createTrip, getTripById, updateTrip } from './services/trips.js';
import { sendTripEmail } from './services/mailer.js';
import tripsRouter from './routes/trips.js';
import cafesRouter from './routes/cafes.js';

const app = express();
const port = process.env.PORT || 443;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// REST API Routes
app.use('/api/trips', tripsRouter);
app.use('/api/cafes', cafesRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// HTTPS Setup
const keyPath = process.env.SSL_KEY || './certs/key.pem';
const certPath = process.env.SSL_CERT || './certs/cert.pem';

let server;
try {
  const key = fs.readFileSync(keyPath);
  const cert = fs.readFileSync(certPath);
  const options = { key, cert };
  server = https.createServer(options, app);
  console.log('✓ HTTPS enabled');
} catch (err) {
  console.warn('⚠ SSL certs not found, falling back to HTTP');
  server = http.createServer(app);
}

// Socket.IO
const { Server: SocketIOServer } = await import('socket.io');
const io = new SocketIOServer(server);

// Socket.IO Connection Handler
const clients = {};
const liveClients = {};

io.on('connection', (socket) => {
  socket.on('disconnect', () => {
    delete liveClients[socket.id];
    io.emit('clients', { liveClients, clients });
  });

  socket.on('identify', (data) => {
    if (clients[data.playerId]) {
      clients[data.playerId].socketId = socket.id;
    } else {
      clients[data.playerId] = {
        playerId: data.playerId,
        socketId: socket.id
      };
    }

    liveClients[socket.id] = {
      playerId: data.playerId,
      socketId: socket.id
    };

    io.emit('clients', { liveClients, clients });
  });

  socket.on('newTrip', async (trip) => {
    try {
      const tripObject = await createTrip(trip);
      socket.emit('tripCreated', tripObject);
    } catch (err) {
      console.error('Error creating trip:', err);
      socket.emit('error', { message: err.message });
    }
  });

  socket.on('getTrip', async ({ tripId, playerId }) => {
    try {
      const tripObject = await getTripById(tripId);

      const voters = tripObject.voters || [];

      if (voters.includes(playerId)) {
        socket.emit('alreadyVoted', tripObject);
        return;
      }

      socket.emit('giveTrip', tripObject);
    } catch (err) {
      console.error('Error getting trip:', err);
      socket.emit('error', { message: err.message });
    }
  });

  socket.on('playerVotes', async ({
    tripId,
    playerId,
    selectedDates,
    email = '',
    username = ''
  }) => {
    try {
      const trip = await getTripById(tripId);

      // init safety
      if (!trip.votes) trip.votes = {};
      if (!trip.voters) trip.voters = [];
      if (!trip.players) trip.players = [];
      if (!trip.status) trip.status = 'open';

      if (trip.status === 'closed') return;

      // add player
      const existingPlayer = trip.players.find((p) => p.playerId === playerId);

      if (!existingPlayer) {
        trip.players.push({ playerId, email, username, score: 0 });
      }

      // add voter
      if (!trip.voters.includes(playerId)) {
        trip.voters.push(playerId);
      }

      // init votes
      trip.possibleDates.forEach((date) => {
        if (!trip.votes[date]) trip.votes[date] = [];
      });

      // apply votes
      selectedDates.forEach((date) => {
        if (!trip.votes[date].includes(playerId)) {
          trip.votes[date].push(playerId);
        }
      });

      const updatedTrip = await updateTrip(tripId, trip);

      socket.emit('voteSubmitted', updatedTrip);

      const everyoneVoted = updatedTrip.voters.length >= trip.expectedPlayers;

      if (everyoneVoted) {
        const finalDate = getFinalDate(updatedTrip);

        updatedTrip.players.forEach((player) => {
          sendTripEmail(player.email || 'test@example.com', {
            cafe: updatedTrip.cafe,
            finalDate
          });
        });

        await updateTrip(tripId, updatedTrip);
      }
    } catch (err) {
      console.error('Error processing votes:', err);
      socket.emit('error', { message: err.message });
    }
  });
});

const getFinalDate = (trip) => {
  const { votes = {}, possibleDates = [] } = trip;

  let highestCount = -1;
  let candidates = [];

  possibleDates.forEach((date) => {
    const count = (votes[date] || []).length;

    if (count > highestCount) {
      highestCount = count;
      candidates = [date];
    } else if (count === highestCount) {
      candidates.push(date);
    }
  });

  if (candidates.length === 1) return candidates[0];

  const today = new Date();

  let closestDate = candidates[0];
  let smallestDiff = Infinity;

  candidates.forEach((date) => {
    const diff = Math.abs(new Date(date) - today);

    if (diff < smallestDiff) {
      smallestDiff = diff;
      closestDate = date;
    }
  });

  return closestDate;
};

// Start Server
const protocol = server instanceof https.Server ? 'https' : 'http';
server.listen(port, () => {
  const networkInterfaces = os.networkInterfaces();
  for (const interfaceName in networkInterfaces) {
    for (const iface of networkInterfaces[interfaceName]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        console.log(`cmd+click ↓`);
        console.log(`${protocol}://${iface.address}:${port}\n`);
      }
    }
  }
});
