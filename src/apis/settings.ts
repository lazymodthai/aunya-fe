import { RawAxiosResponseHeaders } from "axios";
import { InstanceSettingsAPI } from "./instance";

const path = "settings";

export default class SettingsAPI extends InstanceSettingsAPI {
  // static getSetting(): Promise<{ data: any; headers: RawAxiosResponseHeaders; }> {
  //   return this.api.get(`${path}/get-setting`);
  // }

  // static updateSetting(payload: UpdateSettingPayload): Promise<{ data: any; headers: RawAxiosResponseHeaders; }> {
  //   return this.api.patch(`${path}/update-setting`, payload);
  // }
}