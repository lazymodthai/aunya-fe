import { InstanceVisitorAPI } from './instance';

export default class VisitorAPI extends InstanceVisitorAPI {
  static ping() {
    return this.api.post<{ count: number }>('visitor/ping');
  }

  static getCount() {
    return this.api.get<{ count: number }>('visitor/count');
  }
}
