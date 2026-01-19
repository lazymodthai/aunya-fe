import { RawAxiosResponseHeaders } from "axios";
import { InstanceAuthAPI } from "./instance";

const path = "auth";
const user = "users"



export default class AuthAPI extends InstanceAuthAPI {
  static login(payload: { email: string, password: string }): Promise<{ data: any; headers: RawAxiosResponseHeaders; }> {
    return this.api.post(`${path}/login`, payload);
  }

  static register(payload: RegisterPayload): Promise<{ data: any; headers: RawAxiosResponseHeaders; }> {
    return this.api.post(`${user}/register`, payload);
  }

  static getProfile(): Promise<{ data: ProfileResponse; headers: RawAxiosResponseHeaders; }> {
    return this.api.get(`${path}/profile`);
  }

  static logout(): Promise<{ data: any; headers: RawAxiosResponseHeaders; }> {
    return this.api.post(`${path}/logout`);
  }

  static verify(): Promise<{ data: { isActive: boolean, isAdmin: boolean }; headers: RawAxiosResponseHeaders; }> {
    return this.api.get(`${path}/verify`);
  }
}

interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

interface ProfileResponse {
  message: string,
  user: {
    id: string,
    email: string,
    firstName: string,
    lastName: string,
    phoneNumber: string,
    isActive: boolean,
    isAdmin: boolean,
    createdAt: string,
    updatedAt: string
  }
}

export type { RegisterPayload, ProfileResponse }
