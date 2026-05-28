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
  socket.on('disconnect', () => {//update liveClients
    delete liveClients[socket.id];
    io.emit('clients', { liveClients, clients });
  });

  socket.on('identify', (data) => {
    // Update all-time clients
    if (clients[data.playerId]) {
      clients[data.playerId] = {
        ...clients[data.playerId],
        socketId: socket.id
      };
    } else {
      clients[data.playerId] = {
        playerId: data.playerId,
        socketId: socket.id
      };
    }

    // Add/update in liveClients with full player info
    liveClients[socket.id] = {
      playerId: data.playerId,
      socketId: socket.id
    };

    io.emit('clients', { liveClients, clients });
  });

  socket.on('newTrip', async (trip) => {
    const tripObject = await createTrip(trip);
    console.log("CREATED TRIP FROM JSON SERVER:", tripObject);
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

  socket.on('playerVotes', async ({ tripId, playerId, selectedDates }) => {
    const trip = await getTripById(tripId);

    if (!trip.votes) trip.votes = {};
    if (!trip.voters) trip.voters = [];

    trip.voters.push(playerId);
    // checkk f all dates exist
    trip.possibleDates.forEach(date => {
      if (!trip.votes[date]) {
        trip.votes[date] = [];
      }
    });

    //check f selected dates exist else create it
    selectedDates.forEach(date => {
      if (!trip.votes[date]) {
        trip.votes[date] = [];
      }

      //add player id if not in there yet
      if (!trip.votes[date].includes(playerId)) {
        trip.votes[date].push(playerId);
      }
    });

    await updateTrip(tripId, trip);

    socket.emit('voteSubmitted', trip);


    const everyoneVoted =
      trip.voters.length >= trip.expectedPlayers;

    if (everyoneVoted) {

     const finalDate = "tomorrow" //determineWinningDate(trip);

      trip.voters.forEach(voter => {

        sendTripEmail(
          'keanu.plysier@gmail.com',
          {
            cafe: "Test Café",
            finalDate: finalDate
          }
        );

      });

    }
  });

});