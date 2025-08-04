import { RawAxiosResponseHeaders } from "axios";
import { InstancePricesAPI } from "./instance";

const path = "prices";

export default class PricesAPI extends InstancePricesAPI {
  static getPrices(payload: {month: number, year: number, roomId: string}): Promise<{ data: any; headers: RawAxiosResponseHeaders; }> {
    return this.api.post(`${path}/get-price-by-month`, payload);
  }
}