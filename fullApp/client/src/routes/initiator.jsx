import { Form, useActionData } from "react-router";
import { createTrip } from "../services/services";
import { io } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import "../styles/government.css";

let socket;

export async function clientAction({ request }) {
  const formData = await request.formData();

  const rawDates = formData
    .get("possibleDates")
    .split(",")
    .map((d) => d.trim());

  const votes = {};

  rawDates.forEach((date) => {
    votes[date] = [];
  });

  let playerId = localStorage.getItem("playerId");

  if (!playerId) {
    playerId = crypto.randomUUID();
    localStorage.setItem("playerId", playerId);
  }

  const trip = {
    initiatorId: playerId,
    cafe: formData.get("cafe"),
    possibleDates: rawDates,
    votes,
    expectedPlayers: Number(formData.get("expectedPlayers")),
    createdAt: new Date().toISOString().slice(0, 10),
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
    cafe: createdTrip.cafe,
    tripId: createdTrip.id,
  };
}

export default function Initiator() {
  const actionData = useActionData();
  console.log("Action data:", actionData);

  const [shareLink, setShareLink] = useState("");

  const dateInputRef = useRef(null);

  useEffect(() => {
  if (actionData?.tripId) {
    setShareLink(
      `${window.location.origin}/friend/${actionData.tripId}`
    );
  }
}, [actionData]);

  useEffect(() => {
    let playerId = localStorage.getItem("playerId");
    
    if (!playerId) {
      playerId = crypto.randomUUID();
      localStorage.setItem("playerId", playerId);
    }

    socket = io();

    socket.on("connect", () => {
      console.log("Connected to server with ID:", socket.id);
      socket.emit("identify", { playerId });
    });

      socket.on("clients", ({ liveClients, clients }) => {
      console.log("Live clients:", liveClients);
      console.log("All clients:", clients);
    });

    socket.on("tripCreated", (trip) => {
      const link =
        `${window.location.origin}/friend/${trip.id}`;

      setShareLink(link);
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    flatpickr(dateInputRef.current, {
      mode: "multiple",
      dateFormat: "Y-m-d",
    });
  }, []);

  async function handleShare() {
    if (!shareLink) return;

    await navigator.share({
      title: "Hey, come and compete for a drink!",
      text: "Let's all meet up and compete for a drink.",
      url: shareLink,
    });
  }

  return (
    <>
      <h1>Official Trip Competition Portal</h1>

      <h2>Create a New Trip</h2>

      <Form method="post"> 

        <label>
          Café
          <input
            type="text"
            name="cafe"
            required
          />
        </label>

        <label>
          Possible Dates
          <input
            ref={dateInputRef}
            name="possibleDates"
            required
          />
        </label>

        <label>
          Expected Players
          <input
            type="number"
            name="expectedPlayers"
            defaultValue={4}
            min={1}
          />
        </label>

        <label>
          Username
          <input
            type="text"
            name="username"
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            name="email"
            required
          />
        </label>

        <button type="submit">
          Create Trip
        </button>

      </Form>

      {actionData?.success && (
        <p>
          Trip created for {actionData.cafe}
        </p>
      )}

      {shareLink && (
        <>
          <a href={shareLink}>
            {shareLink}
          </a>

          <button onClick={handleShare}>
            Share
          </button>
        </>
      )}
    </>
  );
}