import axios from "axios";


const instanceAuth = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || 'https://api.aunyapoolvilla.com/',
  timeout: 10000,
  headers: {
    Accept: "application/json",
  }
});

const instanceBooking = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || 'https://api.aunyapoolvilla.com/',
  timeout: 10000,
  headers: {
    Accept: "application/json",
  }
});

const instancePrices = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || 'https://api.aunyapoolvilla.com/',
  timeout: 10000,
  headers: {
    Accept: "application/json",
  }
});

export class InstanceAuthAPI { static api = instanceAuth }
export class InstanceBookingAPI { static api = instanceBooking }
export class InstancePricesAPI { static api = instancePrices }