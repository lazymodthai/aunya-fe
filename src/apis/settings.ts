import { InstanceSettingsAPI } from "./instance";

const path = "settings";

export interface Setting {
  id: string;
  key: string;
  value: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface SettingsResponse {
  message: string;
  settings: Setting[];
}

export default class SettingsAPI extends InstanceSettingsAPI {
  static getAll() {
    return this.api.get<SettingsResponse>(`${path}`);
  }

  static getKeys() {
    return this.api.get<string[]>(`${path}/keys`);
  }

  static getByKey(key: string) {
    return this.api.get<Setting>(`${path}/${key}`);
  }

  static update(key: string, value: string) {
    return this.api.patch(`${path}/${key}`, { value });
  }

  static create(payload: { key: string; value: string; description: string }) {
    return this.api.post(`${path}`, payload);
  }

  static healthCheck() {
    return this.api.get(`/`, { timeout: 5000 });
  }
}
