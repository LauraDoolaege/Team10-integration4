import { useEffect, useState } from "react";
import { Form, useLoaderData, useActionData } from "react-router-dom";
import { io } from "socket.io-client";
import "../styles/government.css";

let socket;

// ✅ Loader: only route-related data (tripId)
export async function loader({ params }) {
  return {
    tripId: params.tripId,
  };
}

// ✅ Action: handles vote submission
export async function action({ request }) {
  const formData = await request.formData();

  const selectedDates = formData.getAll("dates");
  const tripId = formData.get("tripId");
  const playerId = formData.get("playerId");

  socket?.emit("playerVotes", {
    tripId,
    playerId,
    selectedDates,
    email: formData.get("email"),
    username: formData.get("username"),
  });

  return { success: true };
}

export default function Trip() {
  const { tripId } = useLoaderData();
  const actionData = useActionData();

  const [trip, setTrip] = useState(null);
  const [message, setMessage] = useState("");

  // ✅ playerId handled in component (not loader)
  const [playerId] = useState(() => {
    let id = localStorage.getItem("playerId");

    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("playerId", id);
    }

    return id;
  });

  // ✅ socket lifecycle
  useEffect(() => {
    socket = io("/");

    socket.on("connect", () => {
      socket.emit("identify", { playerId });
      socket.emit("getTrip", { tripId, playerId });

    });

    socket.on("giveTrip", (tripData) => {
    console.log("Received trip data:", tripData);
      setTrip(tripData);
    });

    socket.on("alreadyVoted", () => {
      setMessage("You already voted for this trip.");
    });

    socket.on("voteSubmitted", () => {
      setMessage("Your selected dates have been submitted!");
    });

    return () => {
      socket.disconnect();
      socket = null;
    };
  }, [tripId, playerId]);

  return (
    <main>
      <h1>Official Trip Competition Portal</h1>
      <h2>Friend Invite Page</h2>

      <h3>{trip ? trip.cafe : "Loading trip..."}</h3>

      {message && <p>{message}</p>}

      {trip && !message && (
        <Form method="post">
          {/* hidden fields for action */}
          <input type="hidden" name="tripId" value={tripId} />
          <input type="hidden" name="playerId" value={playerId} />

          <p>Select your available dates:</p>

          {trip.possibleDates.map((date) => (
            <label key={date}>
              <input type="checkbox" name="dates" value={date} />
              {date}
              <br />
            </label>
          ))}

          <label>
            username:
            <input type="text" name="username" required />
          </label>

          <label>
            email:
            <input type="email" name="email" required />
          </label>

          <button type="submit">Submit Vote</button>
        </Form>
      )}
    </main>
  );
}