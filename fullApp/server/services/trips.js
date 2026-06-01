 const API_BASE_URL = 'http://localhost:3001 //process.env.API_BASE_URL;

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

module.exports = {
    // Trips
    getAllTrips,
    getTripById,
    createTrip,
    updateTrip,
    deleteTrip,
    getLeaderboard
};
