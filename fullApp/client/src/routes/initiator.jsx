import { useActionData } from "react-router";
import { createTrip } from "../services/services";
import "../styles/government.css";
import InitiatorForm from "../components/initiatorForm";

export async function initiatorAction({ request }) {
  const formData = await request.formData();

  const rawDates = (formData.get("possibleDates") || "")
      .split(',')//devide large string into array devided by comma 
      .map(d => d.trim());//remove whitespace

  console.log("Raw dates:", rawDates);

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
    budget: Number(formData.get("expectedPlayers")),
    mood: formData.get("mood"),
    votes,
    expectedPlayers: Number(formData.get("expectedPlayers")),
    createdAt: new Date().toISOString().slice(0, 10),
    status: "open",
    players: [
      {
        playerId,
        email: formData.get("email"),
        username: formData.get("username"),
        score: 10,
      },
    ],
    voters: [playerId],
  };

  const createdTrip = await createTrip(trip);

  return {
    success: true,
    cafeId: createdTrip.cafeId,
    tripId: createdTrip.id,
  };
}

export default function Initiator() {
  const actionData = useActionData();

  return <InitiatorForm actionData={actionData} />;
}