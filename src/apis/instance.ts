import axios from "axios";

const isDev = import.meta.env.MODE === "development";

const instanceAuth = axios.create({
  baseURL: isDev ? "http://localhost:3005/" : import.meta.env.VITE_BASE_URL,
  timeout: 10000,
  headers: {
    Accept: "application/json",
    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
  },
});

const instanceBooking = axios.create({
  withCredentials: true,
  baseURL: import.meta.env.VITE_BASE_URL || 'https://api.aunyapoolvilla.com/',
  timeout: 10000,
  headers: {
    Accept: "application/json",
  },
});

const instancePrices = axios.create({
  withCredentials: true,
  baseURL: import.meta.env.VITE_BASE_URL || 'https://api.aunyapoolvilla.com/',
  timeout: 10000,
  headers: {
    Accept: "application/json",
  },
});

const instanceUpload = axios.create({
  baseURL: "http://localhost:3005/",
  timeout: 10000,
  // No need to set Content-Type header - Axios will automatically set it to multipart/form-data with boundary when sending FormData
});

const instanceBookingManage = axios.create({
  baseURL: "http://localhost:3005/",
  timeout: 10000,
  headers: {
    Accept: "application/json",
  },
});

export class InstanceAuthAPI {
  static api = instanceAuth;
}
export class InstanceBookingAPI {
  static api = instanceBooking;
}
export class InstancePricesAPI {
  static api = instancePrices;
}
export class InstanceUploadAPI {
  static api = instanceUpload;
}
export class InstanceBookingManageAPI {
  static api = instanceBookingManage;
}
