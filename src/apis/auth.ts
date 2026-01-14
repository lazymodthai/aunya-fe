import { RawAxiosResponseHeaders } from "axios";
import { InstanceAuthAPI } from "./instance";

const path = "auth";

export default class AuthAPI extends InstanceAuthAPI {
  static login(payload: { email: string, password: string }): Promise<{ data: any; headers: RawAxiosResponseHeaders; }> {
    return this.api.post(`${path}/login`, payload);
  }

  static logout(): Promise<{ data: any; headers: RawAxiosResponseHeaders; }> {
    return this.api.post(`${path}/logout`);
  }

  static register(payload: RegisterPayload): Promise<{ data: any; headers: RawAxiosResponseHeaders; }> {
    return this.api.post(`${path}/register`, payload);
  }
}

interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}