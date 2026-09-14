import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const SOCKET_URL = BASE_URL.replace('/api', '');

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const createRoom = async (roomData) => {
  const response = await api.post('/rooms', roomData);
  return response.data;
};

export const getRooms = async () => {
  const response = await api.get('/rooms');
  return response.data;
};

export const getRoom = async (roomCode) => {
  const response = await api.get(`/rooms/${roomCode}`);
  return response.data;
};

export const joinRoom = async (roomCode, participantData) => {
  const response = await api.post(`/rooms/${roomCode}/join`, participantData);
  return response.data;
};

export default api;
