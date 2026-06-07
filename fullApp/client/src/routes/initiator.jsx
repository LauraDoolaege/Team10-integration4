import { useActionData } from "react-router";
import { useState, useEffect } from "react";
import { createTrip } from "../services/services";
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

  // Load attempts from localStorage
  const [attempts, setAttempts] = useState(() => {
    return Number(localStorage.getItem("attempts") || 0);
  });

  // Load score from localStorage
  const [score, setScore] = useState(() => {
    return Number(localStorage.getItem("score") || 0);
  });

  // Load image from localStorage
  const [image, setImage] = useState(() => {
    return localStorage.getItem("capturedImage") || null;
  });

  // Derive initial state based on attempts: 
  // If 3 or more attempts, go to score summary (2). 
  // Otherwise, start with camera (0).
  const [initiatorState, setInitiatorState] = useState(() => {
    const savedAttempts = Number(localStorage.getItem("attempts") || 0);
    return savedAttempts >= 3 ? 2 : 0;
  });

  // Persist attempts to localStorage
  useEffect(() => {
    localStorage.setItem("attempts", String(attempts));
  }, [attempts]);

  // Persist score to localStorage
  useEffect(() => {
    localStorage.setItem("score", String(score));
  }, [score]);

  // Persist image to localStorage
  useEffect(() => {
    if (image) {
      localStorage.setItem("capturedImage", image);
    }
  }, [image]);

  // Handle the transition to state 2 if attempts are maxed out while in the game state
  useEffect(() => {
    if (initiatorState === 1 && attempts >= 3) {
      setInitiatorState(2);
    }
  }, [initiatorState, attempts]);

  return (
    <>
      {/* State 0: Camera - Skip if attempts are already used up */}
      {initiatorState === 0 && (
        <Camera image={image} setImage={setImage} setState={() => setInitiatorState(1)} />
      )}

      {/* State 1: Game - Only accessible if attempts are under 3 */}
      {initiatorState === 1 && attempts < 3 && (
        <Game
          image={image}
          attempt={attempts + 1}
          onGameOver={(gameScore) => {
            setScore((prev) => Math.max(prev, gameScore));
            setAttempts((prev) => Math.min(prev + 1, 3));
          }}
        />
      )}

      {/* 
          State 2: Score Summary / Game Over 
          Shown when attempts are maxed out (either on mount or during play)
      */}
      {initiatorState === 2 && (
        <div style={{ textAlign: "center", marginTop: "2rem", marginBottom: "2rem" }}>
          <h2>All attempts completed!</h2>
          <p>Your final score: {score}</p>
          <button className="button-primary" onClick={() => setInitiatorState(3)}>
            Continue to planning
          </button>
        </div>
      )}

      {/* State 3: Final Form */}
      {initiatorState === 3 && (
        <InitiatorForm image={image} score={score} actionData={actionData} />
      )}
    </>
  );
}