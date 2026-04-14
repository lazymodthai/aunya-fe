import { InstancePropertyInfoAPI } from './instance';

export interface PropertyInfoItem {
  id: string;
  category: 'general' | 'facilities' | 'policies';
  label: string;
  iconUrl: string | null;
  sortOrder: number;
}

export default class PropertyInfoAPI extends InstancePropertyInfoAPI {
  static getAll(category?: string) {
    return this.api.get<PropertyInfoItem[]>('property-info', {
      params: category ? { category } : undefined,
    });
  }

  static create(data: { category: string; label: string; sortOrder?: number }) {
    return this.api.post<{ message: string; data: PropertyInfoItem }>('property-info', data);
  }

  static updateLabel(id: string, label: string) {
    return this.api.patch<{ message: string; data: { id: string; label: string } }>(
      `property-info/${id}/label`,
      { label },
    );
  }

  static uploadIcon(id: string, file: File) {
    const form = new FormData();
    form.append('file', file);
    return this.api.post<{ message: string; data: { id: string; iconUrl: string } }>(
      `property-info/${id}/icon`,
      form,
    );
  }

  static remove(id: string) {
    return this.api.delete<{ message: string }>(`property-info/${id}`);
  }
}
