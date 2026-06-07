import { useLoaderData, useActionData } from "react-router-dom";
import { useState, useEffect } from "react";
import { getTrip, createTripVote } from "../services/services.js";
import TripForm from "../components/tripForm";
import { redirect } from 'react-router';


export async function tripLoader({ params }) {
  const tripId = params.tripId;
  console.log(tripId);
  let playerId = localStorage.getItem("playerId");
  if (!playerId) {
    playerId = crypto.randomUUID();
    localStorage.setItem("playerId", playerId);
  }

  const receivedTrip = await getTrip(tripId, playerId);



  return { receivedTrip, playerId };
}

// ✅ Action: handles vote submission
export async function tripAction({ request }) {
  const formData = await request.formData();
  const selectedDates = formData.getAll("dates"); // Get all selected dates as an array
  const tripId = formData.get("tripId");
  const playerId = formData.get("playerId");
  const email = formData.get("email");
  const username = formData.get("username");
  const score = formData.get("score");
  const image = formData.get("image");

  const trip = {
    tripId,
    playerId,
    selectedDates,
    email,
    username,
    score,
    image
  };

  const vote = await createTripVote(trip)
  console.log("Vote response:", vote);

  sessionStorage.removeItem("attempts");

  return redirect(`/leaderboard/${tripId}`);
  // return { success: true };
}

export default function Trip() {
  const { receivedTrip, playerId, allTrips } = useLoaderData();
  console.log("all trips:", { allTrips });
  console.log("Loader data:", { receivedTrip });
  const actionData = useActionData();


  return (
    <>
        <TripForm  receivedTrip={receivedTrip} playerId={playerId} actionData={actionData} />
    </>

  );
}