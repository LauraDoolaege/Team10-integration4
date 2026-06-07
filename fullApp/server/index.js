require("dotenv").config();

const fs = require("fs");
const path = require("path");
const https = require("https");
const express = require("express");
const os = require("os");

const { Server } = require("socket.io");

const {
  redeemCoupon,
  getAllTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  getLeaderboard,
  getFinalDate,
  addPlayerToTrip,
  getCoupon,
  createCoupon,
  checkVoted,
  placeVote,
  setAsVoter,
  getVoterAmount,
  closeTrip,
  getPlayersDetailsByTripId,
  getDateVotesByTripId,
  getHighestTripScore, } = require("./services/trips");

const { sendTripDetails, sendTripCoupon } = require("./services/mailer");

const app = express();

// CORE MIDDLEWARE (FIRST)
// Increase payload limit to handle base64 face images
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// LOGGING (DEBUG)
app.use((req, res, next) => {
  console.log("->", req.method, req.url);
  next();
});

// API ROUTES 
app.post("/api/trip", async (req, res) => {
  try {
    console.log("🔥 HIT /api/trip");
    console.log("BODY:", req.body);

    const trip = await createTrip(req.body);

    res.json(trip);
  } catch (error) {
    console.error(" Error creating trip:", error);

    res.status(500).json({
      error: "Failed to create trip",
      details: error.message,
    });
  }
});

// const res = await fetch(`${window.location.origin}/api/trips/${couponId}`);
app.get("/api/coupon/redeem/:couponId", async (req, res) => {
  try {
    console.log("🔥 HIT /api/coupon/redeem/:couponId");
    await redeemCoupon(req.params.couponId);
    res.json({ success: true });
  } catch (error) {
    console.error("Error fetching coupon:", error);
    res.status(500).json({ error: error.message || "Failed to fetch coupon" });
  }
});

app.get("/api/coupon/:couponId", async (req, res) => {
  try {
    console.log("🔥 HIT /api/coupon/:couponId");
    const couponData = await getCoupon(req.params.couponId);
    res.json(couponData);
  } catch (error) {
    console.error("Error fetching coupon:", error);
    res.status(500).json({ error: error.message || "Failed to fetch coupon" });
  }
});


app.get("/api/trips", async (req, res) => {
  console.log("🔥 HIT /api/trips");
  const trips = await getAllTrips();
  res.json(trips);
});

app.post("/api/trips/vote", async (req, res) => {
  const {
    tripId,
    playerId,
    selectedDates = [],
    email = "",
    username = "",
    score,
    image,
  } = req.body;

  const trip = await getTripById(tripId);

  if (trip.trip.status !== "open") {
    return res.json({ error: "closed" });
  }

  await addPlayerToTrip(playerId, tripId, email, username, score, image);

  const alreadyVoted = await checkVoted(playerId, tripId);

  if (!alreadyVoted) {
    await placeVote(playerId, tripId, selectedDates);
    await setAsVoter(playerId, tripId);

    const voterCount = await getVoterAmount(tripId);

    if (voterCount >= trip.trip.expected_players) {
      await closeTrip(tripId);
      const couponId = crypto.randomUUID();
      await createCoupon(couponId,tripId);

      const players = await getPlayersDetailsByTripId(tripId);
      const votes = await getDateVotesByTripId(tripId);

      const finalDate = getFinalDate({
        votes,
        possibleDates: trip.trip.possibleDates
      });

      for (const player of players) {
        sendTripDetails(player.email, {
          cafe: trip.trip.cafe_name,
          finalDate
        });
      }

      const highestScorer = await getHighestTripScore(tripId);
      if (highestScorer && highestScorer.email) {
        sendTripCoupon(highestScorer.email, couponId, trip.trip.cafe_name, finalDate);
      }
    }
  }

  res.json({ success: true, alreadyVoted });
});

// app.post("/api/trips/vote", async (req, res) => {
//   const {
//     tripId,
//     playerId,
//     selectedDates = [],
//     email = "",
//     username = ""
//   } = req.body; //grab data from body 

//   const trip = await getTripById(tripId);

//   if (!trip.votes) trip.votes = {};
//   if (!trip.voters) trip.voters = [];
//   if (!trip.players) trip.players = [];
//   if (!trip.status) trip.status = "open";

//   if (trip.status === "closed") return;

//   const alreadyVoted = trip.voters.includes(playerId);

//   const existingPlayer = trip.players.find(p => p.playerId === playerId);

//   if (!existingPlayer) {
//     trip.players.push({ playerId, email, username, score: 0 });
//   }

//   // add voter
//   if (!trip.voters.includes(playerId)) {
//     trip.voters.push(playerId);
//   }

//   // init votes
//   trip.possibleDates.forEach(date => {
//     if (!trip.votes[date]) trip.votes[date] = [];
//   });

//   // apply votes
//   selectedDates.forEach(date => {
//     if (!trip.votes[date].includes(playerId)) {
//       trip.votes[date].push(playerId);
//     }
//   });

//   console.log("Updated trip after vote:", trip);

//   const updatedTrip = await updateTrip(tripId, trip);

//   const everyoneVoted = updatedTrip.voters.length >= trip.expectedPlayers;

//   if (everyoneVoted) {
//     updatedTrip.status = "closed";
//     const finalDate = getFinalDate(updatedTrip);

//     updatedTrip.players.forEach(player => {
//       sendTripEmail(
//         player.email || "test@example.com",
//         {
//           cafe: updatedTrip.cafe,
//           finalDate
//         }
//       );
//     });

//     await updateTrip(tripId, updatedTrip);
//   }

//   res.json({
//     alreadyVoted,
//     updatedTrip
//   });
// });


app.get("/api/trips/:id/:playerId", async (req, res) => {
  const trip = await getTripById(req.params.id, req.params.playerId);

  console.log(trip);

  res.json({
    alreadyVoted: trip.alreadyVoted,
    trip: trip.trip,
  });
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});


 //HTTPS SERVER

const server = https.createServer(
  {
    key: fs.readFileSync(process.env.SSL_KEY),
    cert: fs.readFileSync(process.env.SSL_CERT),
  },
  app
);


 //SOCKET.IO


const io = new Server(server, {
  cors: { origin: true },
});


 //SOCKET LOGIC (UNCHANGED)
 
io.on("connection", (socket) => {
  socket.on("newTrip", async (trip) => {
    const tripObject = await createTrip(trip);
    socket.emit("tripCreated", tripObject);
  });

})



 //VITE Middleware for dev.
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

  
   //START SERVER
   

  server.listen(process.env.PORT, () => {
    const networkInterfaces = os.networkInterfaces();

    console.log("cmd+click ↓");

    for (const interfaceName in networkInterfaces) {
      for (const iface of networkInterfaces[interfaceName] || []) {
        if (iface.family === "IPv4" && !iface.internal) {
          console.log(`https://${iface.address}:${process.env.PORT}\n`);
        }
      }
    }
  });
}

start();