import { InstanceGalleryAPI } from "./instance";

export interface GalleryImage {
  id: string;
  fileUrl: string;
  alt: string;
  sortOrder: number;
  createdAt: string;
}

export default class GalleryAPI extends InstanceGalleryAPI {
  static getAll() {
    return this.api.get<GalleryImage[]>(`gallery`);
  }

  static upload(payload: FormData) {
    return this.api.post(`gallery/upload`, payload);
  }

  static updateSortOrder(id: string, sortOrder: number) {
    return this.api.patch(`gallery/${id}/sort`, { sortOrder });
  }

  static updateAlt(id: string, alt: string) {
    return this.api.patch(`gallery/${id}/alt`, { alt });
  }

  static delete(id: string) {
    return this.api.delete(`gallery/${id}`);
  }
}
