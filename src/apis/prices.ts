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

  static generateDiscountCode(payload: GenerateDiscountCodePayload): Promise<{ data: any; headers: RawAxiosResponseHeaders; }> {
    return this.api.post(`${path}/generate-discount-code`, payload);
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
  discount: number; // ส่วนลด (บาท)
  discountPercentage: number; // ส่วนลด (เปอร์เซนต์)
  count: number; // จำนวนครั้ง
}