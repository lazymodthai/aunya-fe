import { RawAxiosResponseHeaders } from "axios";
import { InstanceBookingAPI } from "./instance";
import { BookingStatus } from "@constants/booking.enum";

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

  static getAllDisabledDate(): Promise<{ data: any; headers: RawAxiosResponseHeaders; }> {
    return this.api.get(`${path}/disabled-dates`);
  }

  // Admin APIs
  static getAllBookings(): Promise<{ data: MyBookingData[]; headers: RawAxiosResponseHeaders; }> {
    return this.api.get(`${path}/booked/all`);
  }

  static getBookingsByDate(payload: { date: string, status?: BookingStatus }): Promise<{ data: { success: boolean; data: MyBookingData[]; message: string }; headers: RawAxiosResponseHeaders; }> {
    return this.api.get(`${path}/find-by-date`, { params: payload });
  }

  static updateBookingStatus(id: string, payload: { status: BookingStatus }): Promise<{ data: any; headers: RawAxiosResponseHeaders; }> {
    return this.api.patch(`${path}/${id}/status`, payload);
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
  customerId: string;
  files: {
    qrCode: any[];
    slips: any[];
  }
}

export type { MyBookingResponse, MyBookingData };