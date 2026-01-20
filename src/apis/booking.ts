import { RawAxiosResponseHeaders } from "axios";
import { InstanceBookingAPI } from "./instance";

const path = "booking";

export interface BookingPayload {
  checkinDate: Date | string | null;
  checkoutDate: Date | string | null;
  guestNumber: number | null;
  additionGuestNumber: number | null;
  name: string;
  phoneNumber: string;
  totalPrice: number | null;
  roomId: string;
  customerId?: string;
}

export default class BookingAPI extends InstanceBookingAPI {
  static book(payload: BookingPayload): Promise<{ data: any; headers: RawAxiosResponseHeaders; }> {
    return this.api.post(`${path}/book/`, payload);
  }

  static getBookedDate(): Promise<{ data: any; headers: RawAxiosResponseHeaders; }> {
    return this.api.get(`${path}/dates`);
  }

  static getMyBookings(): Promise<{ data: MyBookingResponse; headers: RawAxiosResponseHeaders; }> {
    return this.api.get(`${path}/my-bookings`);
  }

}

interface MyBookingResponse {
  success: boolean;
  data: MyBookingData[];
  message: string;
}

interface MyBookingData {
  id: string;
  refCode: string;
  checkinDate: string;
  checkoutDate: string;
  guestNumber: number;
  additionGuestNumber: number | null;
  name: string;
  phoneNumber: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  roomId: string;
}

export type { MyBookingResponse, MyBookingData };