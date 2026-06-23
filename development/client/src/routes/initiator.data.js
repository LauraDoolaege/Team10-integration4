import { createTrip } from "../services/services";
import { redirect } from 'react-router';

export async function initiatorAction({ request }) {
  const formData = await request.formData();

  const rawDates = (formData.get("possibleDates") || "")
    .split(",")
    .map((d) => d.trim());
    
  const votes = {};
  rawDates.forEach((date) => {
    votes[date] = [];
  });

  const tripId = crypto.randomUUID();

  let playerId = localStorage.getItem("playerId");

  if (!playerId) {
    playerId = crypto.randomUUID();
    localStorage.setItem("playerId", playerId);
  }

  const trip = {
    id: tripId,
    initiatorId: playerId,
    cafe: formData.get("cafe"),
    possibleDates: rawDates,
    budget: Number(formData.get("budget")),
    mood: formData.get("mood"),
    votes,
    image: formData.get("image"),
    expectedPlayers: Number(formData.get("expectedPlayers")),
    createdAt: new Date().toISOString().slice(0, 10),
    status: "open",
    players: [
      {
        playerId,
        email: formData.get("email"),
        username: formData.get("username"),
        score: formData.get("score"),
      },
    ],
    voters: [playerId],
  };

  try {
    const createdTrip = await createTrip(trip);
    sessionStorage.removeItem("attempts");
    return redirect(`/leaderboard/${createdTrip.id}`);

  } catch (error) { //when error is trown inside createTrip

    if (error.errors) {
      return { errors: error.errors };//field validation errors  status(400+)
    }
    return { error: error.message }; // server failure status(500+)
  }
}
