const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

/**
 * Trips Service - Fetches data from external API server
 */

export const getTrips = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/trips`);
    if (!response.ok) throw new Error('Failed to fetch trips');
    return await response.json();
  } catch (error) {
    console.error('Error fetching trips:', error);
    throw error;
  }
};

export const getTripById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/trips/${id}`);
    if (!response.ok) throw new Error('Trip not found');
    return await response.json();
  } catch (error) {
    console.error('Error fetching trip:', error);
    throw error;
  }
};

export const createTrip = async (tripData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tripData)
    });
    if (!response.ok) throw new Error('Failed to create trip');
    return await response.json();
  } catch (error) {
    console.error('Error creating trip:', error);
    throw error;
  }
};

export const updateTrip = async (id, tripData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/trips/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tripData)
    });
    if (!response.ok) throw new Error('Failed to update trip');
    return await response.json();
  } catch (error) {
    console.error('Error updating trip:', error);
    throw error;
  }
};
