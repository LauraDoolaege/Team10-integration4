export async function createTrip(data) {
  const res = await fetch(`${window.location.origin}/api/trips`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to create trip");
  }

  return await res.json();
}

export async function getTrip(tripId, playerId) {
  const res = await fetch(`${window.location.origin}/api/trips/${tripId}/${playerId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch trip");
  }

  return await res.json();
}

export async function createTripVote(data) {
  const res = await fetch(`${window.location.origin}/api/trips/vote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
   const errorText = await res.text(); // 👈 IMPORTANT
    console.error("Vote API failed:", errorText);
    throw new Error(errorText || "Failed to vote on trip");
  }

  return await res.json();
}
