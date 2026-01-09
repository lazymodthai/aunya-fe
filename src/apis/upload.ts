import { InstanceUploadAPI } from "./instance";

export class UploadfileAPI extends InstanceUploadAPI {
  static uploadFile(payload: FormData) {
    return this.api.post(`/files/upload`, payload);
  }
}