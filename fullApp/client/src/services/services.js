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
  const res = await fetch(`${window.location.origin}/api/trips/${tripId}?playerId=${playerId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch trip");
  }

  return await res.json();
}