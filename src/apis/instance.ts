import axios from "axios";


const instanceAuth = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || 'http://localhost:3005/',
  timeout: 10000,
  headers: {
    Accept: "application/json",
  }
});

const instanceBooking = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || 'http://localhost:3005/',
  timeout: 10000,
  headers: {
    Accept: "application/json",
  }
});

export class InstanceAuthAPI { static api = instanceAuth }
export class InstanceBookingAPI { static api = instanceBooking }