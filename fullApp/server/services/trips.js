 const API_BASE_URL = process.env.API_BASE_URL;

/** 
 * TRIPS CRUD Operations
 */

// Get all trips
const getAllTrips = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/trips`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching trips:', error);
        throw error;
    }
};

// Get a single trip by ID
const getTripById = async (tripId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/trips/${tripId}`);
        if (!response.ok) throw new Error('Trip not found');
        return await response.json();
    } catch (error) {
        console.error('Error fetching trip:', error);
        throw error;
    }
};

// Create a new trip
const createTrip = async (tripData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/trips`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tripData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error creating trip:', error);
        throw error;
    }
};

// Update a trip
const updateTrip = async (tripId, tripData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/trips/${tripId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tripData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error updating trip:', error);
        throw error;
    }
};

// Delete a trip
const deleteTrip = async (tripId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/trips/${tripId}`, {
            method: 'DELETE'
        });
        return response.ok;
    } catch (error) {
        console.error('Error deleting trip:', error);
        throw error;
    }
};

// Get leaderboard for a trip (sorted by score)
const getLeaderboard = async (tripId) => {
    try {
        const players = await getPlayersByTripId(tripId);
        return players.sort((a, b) => b.score - a.score);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        throw error;
    }
};



//AI generated function to determine finale date based on votes and tie breaking rules
const getFinalDate = (trip) => {
  const { votes = {}, possibleDates = [] } = trip;

  let highestCount = -1;
  let candidates = [];

  possibleDates.forEach((date) => {
    const count = (votes[date] || []).length;

    if (count > highestCount) {
      highestCount = count;
      candidates = [date];
    } else if (count === highestCount) {
      candidates.push(date);
    }
  });

  if (candidates.length === 1) return candidates[0];

  const today = new Date();

  let closestDate = candidates[0];
  let smallestDiff = Infinity;

  candidates.forEach((date) => {
    const diff = Math.abs(new Date(date) - today);

    if (diff < smallestDiff) {
      smallestDiff = diff;
      closestDate = date;
    }
  });

  return closestDate;
};


module.exports = {
    // Trips
    getFinalDate,
    getAllTrips,
    getTripById,
    createTrip,
    updateTrip,
    deleteTrip,
    getLeaderboard
};
