const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

/**
 * Cafes Service - Fetches data from external API server
 */

export const getCafes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/cafes`);
    if (!response.ok) throw new Error('Failed to fetch cafes');
    return await response.json();
  } catch (error) {
    console.error('Error fetching cafes:', error);
    throw error;
  }
};

export const getCafeById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/cafes/${id}`);
    if (!response.ok) throw new Error('Cafe not found');
    return await response.json();
  } catch (error) {
    console.error('Error fetching cafe:', error);
    throw error;
  }
};

