import { RawAxiosResponseHeaders } from "axios";
import { InstanceBookingAPI } from "./instance";

const path = "booking";

export default class BookingAPI extends InstanceBookingAPI {
  static book(payload: any): Promise<{ data: any; headers: RawAxiosResponseHeaders; }> {
    return this.api.post(`${path}/book/`, payload);
  }

  static getBookedDate(): Promise<{ data: any; headers: RawAxiosResponseHeaders; }> {
    return this.api.get(`${path}/dates`);
  }

}