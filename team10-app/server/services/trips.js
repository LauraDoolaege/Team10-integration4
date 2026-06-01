import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dir, '../db/trips.json');

const readTrips = () => JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
const writeTrips = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

export const getTrips = () => readTrips();

export const getTripById = (id) => {
  const trips = readTrips();
  return trips.find((t) => t.id === id);
};

export const createTrip = (tripData) => {
  const trips = readTrips();
  const newTrip = {
    id: Date.now().toString(),
    cafe: tripData.cafe || '',
    possibleDates: tripData.possibleDates || [],
    expectedPlayers: tripData.expectedPlayers || 0,
    status: 'open',
    players: [],
    voters: [],
    votes: {},
    createdAt: new Date().toISOString()
  };
  trips.push(newTrip);
  writeTrips(trips);
  return newTrip;
};

export const updateTrip = (id, updates) => {
  const trips = readTrips();
  const index = trips.findIndex((t) => t.id === id);
  if (index === -1) throw new Error('Trip not found');
  trips[index] = { ...trips[index], ...updates };
  writeTrips(trips);
  return trips[index];
};
