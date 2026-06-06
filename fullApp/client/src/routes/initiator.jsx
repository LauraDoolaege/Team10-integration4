import { useActionData } from "react-router";
import { useState, useEffect } from "react";
import { createTrip } from "../services/services";
import "../styles/government.css";
import InitiatorForm from "../components/initiatorForm";
import Game from "../components/game";
import Camera from "../components/camera";

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
        score: formData.get("score"),
      },
    ],
    voters: [playerId],
  };

  const createdTrip = await createTrip(trip);


  localStorage.removeItem("attempts");

  return {
    success: true,
    cafeId: createdTrip.cafeId,
    tripId: createdTrip.id,
  };
}

export default function Initiator() {
  const actionData = useActionData();

  const [score, setScore] = useState(0);
  const [initiatorState, setInitiatorState] = useState(0);

  // load attempts from localStorage
  const [attempts, setAttempts] = useState(() => {
    return Number(localStorage.getItem("attempts") || 0);
  });

  // persist attempts
  useEffect(() => {
    localStorage.setItem("attempts", String(attempts));
  }, [attempts]);

  // advance to score overview when attempts are maxed out
  useEffect(() => {
    if (initiatorState === 1 && attempts >= 3) {
      setInitiatorState(2);
    }
  }, [initiatorState, attempts]);

  return (
    <>
      {initiatorState === 0 && (
        <Camera setState={() => setInitiatorState(1)} />
      )}

      {initiatorState === 1 && attempts < 3 && (
        <Game
          attempt={attempts + 1}
          onGameOver={(gameScore) => {
            setScore((prev) => Math.max(prev, gameScore));
            setAttempts((prev) => Math.min(prev + 1, 3));
          }}
        />
      )}

      {initiatorState === 2 && (
        <div style={{ textAlign: "center", marginTop: "2rem", marginBottom: "2rem" }}>
          <h2>All attempts completed!</h2>
          <p>Your final score: {score}</p>
          <button className="button-primary" onClick={() => setInitiatorState(3)}>
            Continue to planning
          </button>
        </div>
      )}

      {initiatorState === 3 && (
        <InitiatorForm score={score} actionData={actionData} />
      )}
    </>
  );
}