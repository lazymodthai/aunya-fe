import { InstanceBookingManageAPI } from "@apis/instance";
import { RawAxiosResponseHeaders } from "axios";
const book = "booking"
export class ManageBookingAPI extends InstanceBookingManageAPI {
    static getBookingList(): Promise<{ data: any; headers: RawAxiosResponseHeaders; }> {
        return this.api.get(`${book}/booked/all`);
    }
}
