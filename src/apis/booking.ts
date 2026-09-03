import { RawAxiosResponseHeaders } from "axios";
import { InstanceBookingAPI } from "./instance";
import { BookingStatus } from "@constants/booking.enum";

const path = "booking";

export interface BookingPayload {
  checkinDate: Date | string | null;
  checkoutDate: Date | string | null;
  guestNumber: number | null;
  childrenNumber: number;
  additionGuestNumber: number;
  name: string;
  phoneNumber: string;
  totalPrice: number | null;
  roomId: string;
  customerId?: string;
  discount?: number;
  isOnlyDeposit?: boolean;
  depositAmount?: number;
  paidAmount?: number;
  remainingAmount?: number;
  additionTowel: number;
  remark?: string;
  status?: string;
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

  static updateBookingStatus(id: string, payload: { status: BookingStatus; additionalPayment?: number }): Promise<{ data: any; headers: RawAxiosResponseHeaders; }> {
    return this.api.patch(`${path}/${id}/status`, payload);
  }

  static updateBooking(id: string, payload: Partial<BookingPayload> & { status?: BookingStatus }): Promise<{ data: any; headers: RawAxiosResponseHeaders; }> {
    return this.api.patch(`${path}/${id}`, payload);
  }

  static getSummary(year: number): Promise<{ data: SummaryResponse; headers: RawAxiosResponseHeaders; }> {
    return this.api.get(`${path}/summary`, { params: { year } });
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
  childrenNumber: number;
  additionGuestNumber: number;
  name: string;
  phoneNumber: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  roomId: string;
  customerId: string;
  isOnlyDeposit: boolean;
  paidAmount: number;
  remainingAmount: number;
  discount: number;
  files: {
    qrCode: any[];
    slips: any[];
  }
  remark: string;
  additionTowel: number;
  depositAmount?: number;
}

export interface SummaryResponse {
  year: number;
  monthly: {
    month: number;
    revenue: number;
    rentRevenue: number;
    extraBedRevenue: number;
    extraTowelRevenue: number;
    discountUsed: number;
    guestCount: number;
    childrenCount: number;
    bookingCount: number;
    nightCount: number;
    potentialRevenue: number;
    }[];
  yearly: {
    revenue: number;
    rentRevenue: number;
    extraBedRevenue: number;
    extraTowelRevenue: number;
    discountUsed: number;
    guestCount: number;
    childrenCount: number;
    bookingCount: number;
    nightCount: number;
    potentialRevenue: number;
  };
  currentMonth: {
    month: number;
    revenue: number;
    rentRevenue: number;
    extraBedRevenue: number;
    extraTowelRevenue: number;
    discountUsed: number;
    guestCount: number;
    childrenCount: number;
    bookingCount: number;
    nightCount: number;
    potentialRevenue: number;
  } | null;
}


export type { MyBookingResponse, MyBookingData };