require('dotenv').config();
const { createTrip, getTripById, updateTrip} = require('./services');
const { sendTripEmail } = require('./mailer');

const os = require('os');
const isDevelopment = (process.env.NODE_ENV === 'development');
const express = require('express');
const app = express();
const fs = require('fs');

const keyPath = process.env.SSL_KEY;
const certPath = process.env.SSL_CERT;
const options = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath)
};

const server = require('https').Server(options, app);

const port = process.env.PORT || 443;

app.use(express.static('public'));

const { Server } = require("socket.io");
const io = new Server(server);

server.listen(port, () => {
  const networkInterfaces = os.networkInterfaces();
  for (const interfaceName in networkInterfaces) {
    for (const iface of networkInterfaces[interfaceName]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        console.log(`cmd+click ↓`);
        console.log(`https://${iface.address}:${port}\n`);
      }
    }
  }
});

const clients = {}; // All clients ever seen

const liveClients = {}; // Only currently connected clients, keyed by socketId

io.on('connection', socket => {

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
    const tripObject = await createTrip(trip);
    socket.emit("tripCreated", tripObject);
  });

  socket.on('getTrip', async ({ tripId, playerId }) => {
    const tripObject = await getTripById(tripId);

    const voters = tripObject.voters || [];

    if (voters.includes(playerId)) {
      socket.emit("alreadyVoted", tripObject);
      return;
    }

    socket.emit("giveTrip", tripObject);
  });

  socket.on('playerVotes', async ({
    tripId,
    playerId,
    selectedDates,
    email = "",
    username = ""
  }) => {

    const trip = await getTripById(tripId);

    // init safety
    if (!trip.votes) trip.votes = {};
    if (!trip.voters) trip.voters = [];
    if (!trip.players) trip.players = [];
    if (!trip.status) trip.status = "open";

    if (trip.status === "closed") return;

    // add player
    const existingPlayer = trip.players.find(p => p.playerId === playerId);

    if (!existingPlayer) {
      trip.players.push({ playerId, email, username, score: 0 });
    }

    // add voter
    if (!trip.voters.includes(playerId)) {
      trip.voters.push(playerId);
    }

    // init votes
    trip.possibleDates.forEach(date => {
      if (!trip.votes[date]) trip.votes[date] = [];
    });

    // apply votes
    selectedDates.forEach(date => {
      if (!trip.votes[date].includes(playerId)) {
        trip.votes[date].push(playerId);
      }
    });

    const updatedTrip = await updateTrip(tripId, trip);

    socket.emit('voteSubmitted', updatedTrip);

    const everyoneVoted =
      updatedTrip.voters.length >= trip.expectedPlayers;

    if (everyoneVoted) {

      const finalDate = getFinalDate(updatedTrip);

      updatedTrip.players.forEach(player => {
        sendTripEmail(
          player.email || "test@example.com",
          {
            cafe: updatedTrip.cafe,
            finalDate
          }
        );
      });

      await updateTrip(tripId, updatedTrip);
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
