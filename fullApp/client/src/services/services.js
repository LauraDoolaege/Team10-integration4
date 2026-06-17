export async function getLeaderboard(tripId){
  const res = await fetch(`${window.location.origin}/api/leaderboards/${tripId}`);
  if (!res.ok) {
    throw new Error("Failed to fetch leaderboard");
  } 
  return await res.json();
}

export async function createTrip(data) {
  const res = await fetch(`${window.location.origin}/api/trip`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    let errorMessage = "Failed to create trip";
    let fieldErrors;
    
    const errorData = await res.json();
    errorMessage = errorData.error || errorMessage;//server error
    fieldErrors = errorData.errors || [];//validation errors
    
    const error = new Error(errorMessage);
    error.errors = fieldErrors;//add validation errors.
    throw error;//send to action handler
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

    let errorMessage = "Failed to vote for this trip";
    let fieldErrors;

    const errorData = await res.json();
    errorMessage = errorData.error || errorMessage;//server error
    fieldErrors = errorData.errors || [];//validation errors

    const error = new Error(errorMessage);
    error.errors = fieldErrors;//add validation errors.
    throw error;//send to action handler
  }


  return await res.json();
}
