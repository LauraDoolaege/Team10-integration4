require("dotenv").config();

const fs = require("fs");
const path = require("path");
const https = require("https");
const express = require("express");
const os = require("os");

const { Server } = require("socket.io");

const { createTrip, getTripById, updateTrip } = require("./services");
const { sendTripEmail } = require("./mailer");

const app = express();
app.use(express.json());

/**
 * ----------------------------
 * HTTPS SETUP
 * ----------------------------
 */
const keyPath = process.env.SSL_KEY;
const certPath = process.env.SSL_CERT;

const options = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath)
};

const server = https.createServer(options, app);

/**
 * ----------------------------
 * SOCKET.IO
 * ----------------------------
 */
const io = new Server(server, {
  cors: {
    origin: true
  }
});

/**
 * ----------------------------
 * CLIENT STATE (UNCHANGED)
 * ----------------------------
 */
const clients = {};
const liveClients = {};

/**
 * ----------------------------
 * SOCKET LOGIC (UNCHANGED)
 * ----------------------------
 */
io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    delete liveClients[socket.id];
    io.emit("clients", { liveClients, clients });
  });

  socket.on("identify", (data) => {
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

    io.emit("clients", { liveClients, clients });
  });

  socket.on("newTrip", async (trip) => {
    const tripObject = await createTrip(trip);
    socket.emit("tripCreated", tripObject);
  });

  socket.on("getTrip", async ({ tripId, playerId }) => {
    const tripObject = await getTripById(tripId);

    const voters = tripObject.voters || [];

    if (voters.includes(playerId)) {
      socket.emit("alreadyVoted", tripObject);
      return;
    }

    socket.emit("giveTrip", tripObject);
  });

  socket.on("playerVotes", async ({
    tripId,
    playerId,
    selectedDates,
    email = "",
    username = ""
  }) => {
    const trip = await getTripById(tripId);

    if (!trip.votes) trip.votes = {};
    if (!trip.voters) trip.voters = [];
    if (!trip.players) trip.players = [];
    if (!trip.status) trip.status = "open";

    if (trip.status === "closed") return;

    const existingPlayer = trip.players.find(p => p.playerId === playerId);

    if (!existingPlayer) {
      trip.players.push({ playerId, email, username, score: 0 });
    }

    if (!trip.voters.includes(playerId)) {
      trip.voters.push(playerId);
    }

    trip.possibleDates.forEach(date => {
      if (!trip.votes[date]) trip.votes[date] = [];
    });

    selectedDates.forEach(date => {
      if (!trip.votes[date].includes(playerId)) {
        trip.votes[date].push(playerId);
      }
    });

    const updatedTrip = await updateTrip(tripId, trip);

    socket.emit("voteSubmitted", updatedTrip);

    const everyoneVoted =
      updatedTrip.voters.length >= trip.expectedPlayers;

    if (everyoneVoted) {
      const finalDate = getFinalDate(updatedTrip);

      updatedTrip.players.forEach(player => {
        sendTripEmail(player.email || "test@example.com", {
          cafe: updatedTrip.cafe,
          finalDate
        });
      });

      await updateTrip(tripId, updatedTrip);
    }
  });
});

/**
 * ----------------------------
 * FINAL DATE LOGIC (UNCHANGED)
 * ----------------------------
 */
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

/**
 * =========================================================
 *  VITE INTEGRATION (OPTION 2 — FRONTEND SERVING LAYER)
 * =========================================================
 */
async function start() {
  const { createServer: createViteServer } = await import("vite");

  const vite = await createViteServer({
    root: path.resolve(__dirname, "../app"),
    server: {
      middlewareMode: true
    },
    appType: "custom"
  });

  // 🔥 Vite handles React frontend requests
  app.use(vite.middlewares);

  /**
   * ----------------------------
   * API ROUTES (add above Vite if needed)
   * ----------------------------
   */
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  /**
   * ----------------------------
   * SPA FALLBACK (React Router support)
   * ----------------------------
   */
  app.use("*", async (req, res, next) => {
    try {
      const url = req.originalUrl;

      let template = fs.readFileSync(
        path.resolve(__dirname, "../app/index.html"),
        "utf-8"
      );

      template = await vite.transformIndexHtml(url, template);

      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });

  /**
   * ----------------------------
   * SERVER START (LAN READY)
   * ----------------------------
   */
  const port = process.env.PORT || 443;

  server.listen(port, () => {
    const networkInterfaces = os.networkInterfaces();

    console.log("\nAvailable on network:\n");

    for (const interfaceName in networkInterfaces) {
      for (const iface of networkInterfaces[interfaceName]) {
        if (iface.family === "IPv4" && !iface.internal) {
          console.log(`https://${iface.address}:${port}`);
        }
      }
    }
  });
}

start();