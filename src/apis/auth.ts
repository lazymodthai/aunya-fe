import { RawAxiosResponseHeaders } from "axios";
import { InstanceAuthAPI } from "./instance";

const path = "auth";

export default class AuthAPI extends InstanceAuthAPI {
  static login(payload:{email: string, password: string}): Promise<{ data: any; headers: RawAxiosResponseHeaders; }> {
    return this.api.post(`${path}/login/`, payload);
  }

  static logout(): Promise<{ data: any; headers: RawAxiosResponseHeaders; }> {
    return this.api.post(`${path}/logout/`);
  }
}