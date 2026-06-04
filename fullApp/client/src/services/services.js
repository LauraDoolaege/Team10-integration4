export async function createTrip(data) {
  const res = await fetch(`${window.location.origin}/api/trip`, {
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

export async function getAllTrips() {
  const res = await fetch(`${window.location.origin}/api/trips`);

  if (!res.ok) {
    throw new Error("Failed to fetch trips");
  }

  return await res.json();
}


export async function getCoupon(couponId) {
  const res = await fetch(`${window.location.origin}/api/coupon/${couponId}`);
  if (!res.ok) {
    throw new Error("Failed to fetch coupon");
  }

  return await res.json();
}


export async function redeemCoupon(couponId) {
  const res = await fetch(`${window.location.origin}/api/coupon/redeem/${couponId}`);
  if (!res.ok) {
    throw new Error("Failed to fetch coupon");
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
