require("dotenv").config();

const fs = require("fs");
const path = require("path");
const https = require("https");
const express = require("express");

const { Server } = require("socket.io");

const { createTrip, getTripById, updateTrip, getFinalDate } = require("./services/trips");
const { sendTripEmail } = require("./services/mailer");

const app = express();

/**
 * ----------------------------
 * CORE MIDDLEWARE (FIRST)
 * ----------------------------
 */
app.use(express.json());

/**
 * LOGGING (DEBUG)
 */
app.use((req, res, next) => {
  console.log("->", req.method, req.url);
  next();
});

/**
 * ----------------------------
 * API ROUTES (MUST COME BEFORE VITE)
 * ----------------------------
 */
app.post("/api/trips", async (req, res) => {
  console.log("🔥 HIT /api/trips");

  const trip = await createTrip(req.body);
  res.json(trip);
});


app.post("/api/trips/vote", async (req, res) => {
  const {
    tripId,
    playerId,
    selectedDates = [],
    email = "",
    username = ""
  } = req.body; //grab data from body 

  const trip = await getTripById(tripId);
 
  if (!trip.votes) trip.votes = {};
  if (!trip.voters) trip.voters = [];
  if (!trip.players) trip.players = [];
  if (!trip.status) trip.status = "open";

  if (trip.status === "closed") return;
 
  const alreadyVoted = trip.voters.includes(playerId);

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

    console.log("Updated trip after vote:", trip);
    
   const updatedTrip = await updateTrip(tripId, trip);

    const everyoneVoted = updatedTrip.voters.length >= trip.expectedPlayers;

    if (everyoneVoted) {
      updatedTrip.status = "closed";
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

      res.json({
    alreadyVoted,
    updatedTrip
  });
  });


app.get("/api/trips/:id/:playerId", async (req, res) => {
  const trip = await getTripById(req.params.id);

  const alreadyVoted = (trip.voters || []).includes(req.params.playerId); //alreadyvoted is true or false

  res.json({
    alreadyVoted,
    trip
  });
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

/**
 * ----------------------------
 * HTTPS SERVER
 * ----------------------------
 */
const server = https.createServer(
  {
    key: fs.readFileSync(process.env.SSL_KEY),
    cert: fs.readFileSync(process.env.SSL_CERT),
  },
  app
);

/**
 * ----------------------------
 * SOCKET.IO
 * ----------------------------
 */
const io = new Server(server, {
  cors: { origin: true },
});

/**
 * SOCKET LOGIC (UNCHANGED)
 */
io.on("connection", (socket) => {
  socket.on("newTrip", async (trip) => {
    const tripObject = await createTrip(trip);
    socket.emit("tripCreated", tripObject);
  });

  socket.on("getTrip", async ({ tripId, playerId }) => {
    const tripObject = await getTripById(tripId);

    if ((tripObject.voters || []).includes(playerId)) {
      socket.emit("alreadyVoted", tripObject);
      return;
    }

    socket.emit("giveTrip", tripObject);
  });

  socket.on("playerVotes", async (data) => {
    const trip = await getTripById(data.tripId);

    const updatedTrip = await updateTrip(data.tripId, {
      ...trip,
    });

    socket.emit("voteSubmitted", updatedTrip);
  });
});

/**
 * ----------------------------
 * VITE (MUST BE LAST MIDDLEWARE)
 * ----------------------------
 */
async function start() {
  const { createServer: createViteServer } = require("vite");

  const vite = await createViteServer({
    root: path.resolve(__dirname, "../client"),
    appType: "custom",
    server: {
      middlewareMode: true,
      hmr: {
        server,
        protocol: "wss",
      },
    },
  });

  // Vite middleware LAST
  app.use(vite.middlewares);

  // fallback LAST OF ALL
app.use(async (req, res, next) => {
  // Let API routes pass through
  if (req.url.startsWith("/api")) return next();

  // Only handle page navigation (GET requests)
  if (req.method !== "GET") return next();

  try {
    const template = fs.readFileSync(
      path.resolve(__dirname, "../client/index.html"),
      "utf-8"
    );

    const html = await vite.transformIndexHtml(req.originalUrl, template);

    res.status(200).set({ "Content-Type": "text/html" }).end(html);
  } catch (e) {
    next(e);
  }
});

  /**
   * START SERVER
   */
  server.listen(443, "0.0.0.0", () => {
    console.log("Server running on https://192.168.0.96");
  });
}

start();