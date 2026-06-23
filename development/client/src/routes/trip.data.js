import { getTrip, createTripVote } from "../services/services.js";
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

  // If trip is closed, redirect to error/closed
  if (receivedTrip?.closed) {
    return redirect(`/error/closed`);
  }

  // If already voted, redirect to leaderboard immediately
  if (receivedTrip?.alreadyVoted) {
    return redirect(`/leaderboard/${tripId}`);
  }

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
  const joining = formData.get("joining") !== "false"; // Default to true unless explicitly "false"

  const trip = {
    tripId,
    playerId,
    selectedDates,
    email,
    username,
    score,
    image,
    joining
  };

  try{
  const vote = await createTripVote(trip)
  console.log("Vote response:", vote);
  }
   catch (error) { //when error is trown inside createTrip

    if (error.errors) {
      // error /: error
    return redirect(`/error/form`);
      // errors: error.errors 
      //field validation errors  status(400+)
  }
   return error;
}

  sessionStorage.removeItem("attempts");
 
  if(!joining){
    return redirect(`/notJoining`)
  }

  return redirect(`/leaderboard/${tripId}`);

}
