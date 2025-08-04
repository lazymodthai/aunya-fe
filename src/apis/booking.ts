import { RawAxiosResponseHeaders } from "axios";
import { InstanceBookingAPI } from "./instance";

const path = "booking";

export interface BookingInterface {
  checkinDate: Date | string | null;
  checkoutDate: Date | string | null;
  guestNumber: number | null;
  additionGuestNumber: number | null;
  name: string;
  phoneNumber: string;
  totalPrice: number | null;
  roomId: string;
}

export default class BookingAPI extends InstanceBookingAPI {
  static book(payload: BookingInterface): Promise<{ data: any; headers: RawAxiosResponseHeaders; }> {
    return this.api.post(`${path}/book/`, payload);
  }

  static getBookedDate(): Promise<{ data: any; headers: RawAxiosResponseHeaders; }> {
    return this.api.get(`${path}/dates`);
  }

}