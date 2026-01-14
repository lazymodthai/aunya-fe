import { RawAxiosResponseHeaders } from "axios";
import { InstanceAuthAPI } from "./instance";

const path = "auth";
const user = "users"



export default class AuthAPI extends InstanceAuthAPI {
  static login(payload: { email: string, password: string }): Promise<{ data: any; headers: RawAxiosResponseHeaders; }> {
    return this.api.post(`${path}/login`, payload);
  }

  static register(payload:RegisterPayload): Promise<{ data: any; headers: RawAxiosResponseHeaders; }> {
    return this.api.post(`${user}/register`, payload);
  }

  static getProfile(): Promise<{ data: any; headers: RawAxiosResponseHeaders; }> {
    return this.api.get(`${path}/profile`);
  }

  static logout(): Promise<{ data: any; headers: RawAxiosResponseHeaders; }> {
    return this.api.post(`${path}/logout`);
  }
}

interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}
