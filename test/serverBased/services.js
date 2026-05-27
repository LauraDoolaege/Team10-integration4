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

/**
 * PLAYERS CRUD Operations
 */

// Get all players
const getAllPlayers = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/players`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching players:', error);
        throw error;
    }
};

// Get players for a specific trip
const getPlayersByTripId = async (tripId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/players?tripId=${tripId}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching players for trip:', error);
        throw error;
    }
};

// Get a single player by ID
const getPlayerById = async (playerId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/players/${playerId}`);
        if (!response.ok) throw new Error('Player not found');
        return await response.json();
    } catch (error) {
        console.error('Error fetching player:', error);
        throw error;
    }
};

// Create a new player
const createPlayer = async (playerData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/players`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(playerData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error creating player:', error);
        throw error;
    }
};

// Update a player (e.g., update score)
const updatePlayer = async (playerId, playerData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/players/${playerId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(playerData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error updating player:', error);
        throw error;
    }
};

// Delete a player
const deletePlayer = async (playerId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/players/${playerId}`, {
            method: 'DELETE'
        });
        return response.ok;
    } catch (error) {
        console.error('Error deleting player:', error);
        throw error;
    }
};

/**
 * Helper functions
 */

// Update player score
const updatePlayerScore = async (playerId, score) => {
    try {
        const player = await getPlayerById(playerId);
        return await updatePlayer(playerId, { ...player, score, completed: true });
    } catch (error) {
        console.error('Error updating player score:', error);
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
    // Players
    getAllPlayers,
    getPlayersByTripId,
    getPlayerById,
    createPlayer,
    updatePlayer,
    deletePlayer,
    // Helpers
    updatePlayerScore,
    getLeaderboard
};
