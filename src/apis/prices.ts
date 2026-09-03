import { RawAxiosResponseHeaders } from "axios";
import { InstancePricesAPI } from "./instance";

const path = "prices";

export default class PricesAPI extends InstancePricesAPI {
  static getPrices(payload: GetPricesByMonthPayload): Promise<{ data: any; headers: RawAxiosResponseHeaders; }> {
    return this.api.post(`${path}/get-price-by-month`, payload);
  }

  static generatePrices(payload: GeneratePricesPayload): Promise<{ data: any; headers: RawAxiosResponseHeaders; }> {
    return this.api.post(`${path}/generate`, payload);
  }

  static updatePriceById(id: string, payload: { price: number }): Promise<{ data: any; headers: RawAxiosResponseHeaders; }> {
    return this.api.patch(`${path}/${id}/price`, payload);
  }

  static updateRoomStatusById(id: string, payload: { isMaintenance: boolean }): Promise<{ data: any; headers: RawAxiosResponseHeaders; }> {
    return this.api.patch(`${path}/${id}/maintenance`, payload);
  }

  static resetPrices(payload: { year: number, roomId: string }): Promise<{ data: any; headers: RawAxiosResponseHeaders; }> {
    return this.api.post(`${path}/reset`, payload);
  }

  static getGeneratedYears(roomId: string): Promise<{ data: { message: string; years: number[] }; headers: RawAxiosResponseHeaders; }> {
    return this.api.get(`${path}/generated-years/${roomId}`);
  }

  static getYearPriceSummaries(roomId: string): Promise<{ data: { message: string; summaries: YearPriceSummary[] }; headers: RawAxiosResponseHeaders; }> {
    return this.api.get(`${path}/summaries/${roomId}`);
  }

  static fetchBotHolidays(year: number): Promise<{ data: { success: boolean; message: string; holidays: { date: string; description: string }[] }; headers: RawAxiosResponseHeaders; }> {
    return this.api.get(`${path}/bot-holidays/${year}`);
  }

  static getYearHolidaysFromDB(roomId: string, year: number): Promise<{ data: { message: string; holidays: { date: string; price: number; description: string }[] }; headers: RawAxiosResponseHeaders; }> {
    return this.api.get(`${path}/holidays/${roomId}/${year}`);
  }

  static syncHolidays(payload: { roomId: string; year: number; holidayPrice?: number }): Promise<{ data: { success: boolean; message: string; updatedCount: number }; headers: RawAxiosResponseHeaders; }> {
    return this.api.post(`${path}/sync-holidays`, payload);
  }

  //Discount code
  static generateDiscountCode(payload: GenerateDiscountCodePayload): Promise<{ data: any; headers: RawAxiosResponseHeaders; }> {
    return this.api.post(`${path}/generate-discount-code`, payload);
  }

  static getAllDiscountCode(): Promise<{ data: DiscountCodeResponse; headers: RawAxiosResponseHeaders; }> {
    return this.api.get(`${path}/discount-codes`);
  }

  static getDiscountDataByCode(code: string): Promise<{ data: DiscountCode; headers: RawAxiosResponseHeaders; }> {
    return this.api.get(`${path}/discount-codes/${code}`);
  }

  static useDiscountCode(code: string): Promise<{ data: any; headers: RawAxiosResponseHeaders; }> {
    return this.api.post(`${path}/discount-codes/${code}/use`);
  }

  static priceCalculate(payload: PriceCalculatePayload): Promise<{ data: PriceCalculateResponse; headers: RawAxiosResponseHeaders; }> {
    return this.api.post(`${path}/calculate`, payload);
  }
}

interface GetPricesByMonthPayload {
  month: number; // 1-12
  year: number; // 2026
  roomId: string; // a20626d8-dd06-45ca-b85d-71032e776543
}

interface GeneratePricesPayload {
  year: number; // 2026
  weekdayPrice: number; // ราคาจันทร์ - ศุกร์
  weekendPrice: number; // ราคาเสาร์ - อาทิตย์
  holidayPrice: number; // ราคาวันหยุดนักขัตฤกษ์
  description: string; // รายละเอียดราคา
  roomId: string; // a20626d8-dd06-45ca-b85d-71032e776543
}

interface GenerateDiscountCodePayload {
  code: string; // โค้ดส่วนลด
  discount?: number; // ส่วนลด (บาท)
  discountPercentage?: number; // ส่วนลด (เปอร์เซนต์)
  count: number; // จำนวนโค้ด
}

export interface DiscountCodeResponse {
  message: string
  discountCodes: DiscountCode[]
}

export interface DiscountCode {
  id: string
  code: string
  discount: string
  discountPercentage: string
  count: number
  usedAt: any
  createdAt: string
  updatedAt: any
}

interface PriceCalculatePayload {
  roomId: string
  checkinDate: string
  checkoutDate: string
}

interface PriceCalculateResponse {
  message: string
  totalPrice: number
  nights: number
  priceDetails: PriceDetail[]
}

export interface PriceDetail {
  date: string;
  price: number;
}

export interface YearPriceSummary {
  year: number;
  minWeekdayPrice: number;
  maxWeekdayPrice: number;
  avgWeekdayPrice: number;
  minWeekendPrice: number;
  maxWeekendPrice: number;
  avgWeekendPrice: number;
  minHolidayPrice: number;
  maxHolidayPrice: number;
  avgHolidayPrice: number;
  holidayCount: number;
  totalDays: number;
}

