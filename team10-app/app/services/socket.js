import { io } from 'socket.io-client';
import { SOCKET_URL } from '../../shared/constants.js';

let socket = null;

export const initSocket = () => {
  if (socket) return socket;
  socket = io(SOCKET_URL);
  return socket;
};

export const getSocket = () => socket;

export const emit = (event, data) => {
  if (!socket) throw new Error('Socket not initialized');
  socket.emit(event, data);
};

export const on = (event, callback) => {
  if (!socket) throw new Error('Socket not initialized');
  socket.on(event, callback);
};
