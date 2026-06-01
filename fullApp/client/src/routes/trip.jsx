import { useEffect, useState } from "react";
import { Form, useLoaderData, useActionData } from "react-router-dom";
import { getTrip, createTripVote } from "../services/services.js";
import { io } from "socket.io-client";
import "../styles/government.css";

let socket;


export async function loader({ params }) {
   const tripId = params.tripId;
   const playerId = localStorage.getItem("playerId");
    if (!playerId) {
        const playerId = crypto.randomUUID();
        localStorage.setItem("playerId", newPlayerId);
    }

  const receivedTrip = await getTrip(tripId, playerId);

  return {receivedTrip, playerId};
}

// ✅ Action: handles vote submission
export async function action({ request }) {
  const formData = await request.formData();
  const selectedDates = formData.getAll("dates"); // Get all selected dates as an array
  const tripId = formData.get("tripId");
  const playerId = formData.get("playerId");
  const email = formData.get("email");
  const username = formData.get("username");
  
    const trip = {
    tripId,
    playerId,
    selectedDates,
    email,
    username
  };


  const vote = await createTripVote(trip)
  console.log("Vote response:", vote);

  return { success: true };
}

export default function Trip() {
  const { receivedTrip, playerId } = useLoaderData();
  console.log("Loader data:", { receivedTrip});
  const actionData = useActionData();

  const [message, setMessage] = useState("");

  const alreadyVoted = receivedTrip?.alreadyVoted;
  const trip = receivedTrip?.trip;

  const tripId = trip?.id;

  useEffect(() => {
    if (alreadyVoted) {
      setMessage("You already voted for this trip.");
    }
  }, [alreadyVoted]);

//   // ✅ socket lifecycle
//   useEffect(() => {
//     socket = io("/");

//     socket.on("connect", () => {
//       socket.emit("identify", { playerId });
//       socket.emit("getTrip", { tripId, playerId });

//     });

//     socket.on("giveTrip", (tripData) => {
//     console.log("Received trip data:", tripData);
//       setTrip(tripData);
//     });

//     socket.on("alreadyVoted", () => {
//       setMessage("You already voted for this trip.");
//     });

//     socket.on("voteSubmitted", () => {
//       setMessage("Your selected dates have been submitted!");
//     });

//     return () => {
//       socket.disconnect();
//       socket = null;
//     };
//   }, [tripId, playerId]);

  return (
    <main>
      <h1>Official Trip Competition Portal</h1>
      <h2>Friend Invite Page</h2>

      <h3>{trip ? trip.cafe : "Loading trip..."}</h3>

      {message && <p>{message}</p>}
      
      
      {trip && !message &&  (
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