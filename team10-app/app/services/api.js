import axios from 'axios';
import { API_BASE_URL } from '../../shared/constants.js';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Trips
export const tripsAPI = {
  getAll: () => client.get('/trips'),
  getById: (id) => client.get(`/trips/${id}`),
  create: (data) => client.post('/trips', data),
  update: (id, data) => client.put(`/trips/${id}`, data)
};

// Cafes
export const cafesAPI = {
  getAll: () => client.get('/cafes'),
  getById: (id) => client.get(`/cafes/${id}`)
};

// Health
export const health = () => client.get('/health');
