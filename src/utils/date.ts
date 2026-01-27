/**
 * Parse "YYYY-MM-DD" string เป็น local Date โดยไม่ผ่าน UTC
 * ป้องกันปัญหา new Date("YYYY-MM-DD") ถูก parse เป็น UTC midnight แล้ววันเลื่อนใน timezone อื่น
 */
export function parseLocalDate(dateStr: string): Date {
  const datePart = dateStr.split('T')[0].split(' ')[0];
  const [year, month, day] = datePart.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * ฟังก์ชันสำหรับจัดรูปแบบวันที่หลากหลายรูปแบบทั้งภาษาอังกฤษและภาษาไทย
 * @param dateInput - วันที่ในรูปแบบ yyyy-MM-dd (เช่น 2025-02-15) หรือ Date object หรือ String ของ Date object
 * @param format - ตัวเลขระบุรูปแบบที่ต้องการ (1-10), ค่าเริ่มต้นเป็น 1
 * @returns วันที่ในรูปแบบที่กำหนด
 */
export function FormatDate(dateInput: string | Date, format: number = 1): string {
  // แปลงข้อมูลนำเข้าให้เป็น Date object
  let dateObj: Date;
  
  if (dateInput instanceof Date) {
    // กรณีเป็น Date object อยู่แล้ว
    dateObj = dateInput;
  } else {
    // กรณีเป็น string
    // ตรวจสอบว่าเป็นรูปแบบ yyyy-MM-dd หรือไม่
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      dateObj = parseLocalDate(dateInput);
    } else {
      // ลองแปลงจาก string ของ Date object (เช่น "Wed Feb 15 2025 ...")
      dateObj = new Date(dateInput);
    }
  }
  
  // ตรวจสอบความถูกต้องของวันที่
  if (isNaN(dateObj.getTime())) {
    throw new Error('วันที่ไม่ถูกต้อง กรุณาใช้รูปแบบ yyyy-MM-dd หรือ Date object หรือ String ของ Date object');
  }

  // วันที่ในรูปแบบภาษาอังกฤษ
  const engMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // วันที่ในรูปแบบภาษาอังกฤษแบบย่อ
  const engMonthsShort = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // วันที่ในรูปแบบภาษาไทย
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  // วันที่ในรูปแบบภาษาไทยแบบย่อ
  const thaiMonthsShort = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];

  // ดึงข้อมูลวัน เดือน ปี จาก Date object
  const day = dateObj.getDate();
  const month = dateObj.getMonth() + 1; // getMonth() เริ่มจาก 0
  const year = dateObj.getFullYear();
  
  // แปลงเป็นปี พ.ศ. (เพิ่ม 543 ปี)
  const thaiYear = year + 543;
  
  // เดือนในอาเรย์เริ่มที่ 0 แต่เดือนจริงเริ่มที่ 1
  const monthIndex = month - 1;

  // จัดรูปแบบตามที่กำหนด
  switch (format) {
    case 1: // 15 February 2025
      return `${day} ${engMonths[monthIndex]} ${year}`;
    
    case 2: // 15 Feb 2025
      return `${day} ${engMonthsShort[monthIndex]} ${year}`;
    
    case 3: // 15 Feb 25
      return `${day} ${engMonthsShort[monthIndex]} ${year.toString().slice(2)}`;
    
    case 4: // 15 กุมภาพันธ์ 2568
      return `${day} ${thaiMonths[monthIndex]} ${thaiYear}`;
    
    case 5: // 15 ก.พ. 2568
      return `${day} ${thaiMonthsShort[monthIndex]} ${thaiYear}`;
    
    case 6: // 15 ก.พ. 68
      return `${day} ${thaiMonthsShort[monthIndex]} ${thaiYear.toString().slice(2)}`;
    
    case 7: // 15/02/2025
      return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
    
    case 8: // 15/02/25
      return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year.toString().slice(2)}`;
    
    case 9: // 15/02/2568
      return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${thaiYear}`;
    
    case 10: // 15/02/68
      return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${thaiYear.toString().slice(2)}`;
    
    case 11: // feb
      return `${engMonthsShort[monthIndex]}`;

    case 12: // feb 25
    return `${engMonthsShort[monthIndex]} ${year.toString().slice(2)}`;

    default:
      return `${day} ${engMonths[monthIndex]} ${year}`;  // เหมือนกับ format 1 เป็นค่าเริ่มต้น
  }
}

/**
 * Formats date strings from "YYYY-MM-DD HH:MM:SS" or "YYYY-MM-DD" to "DD/MM/YYYY,HH:MM:SS" or "DD/MM/YYYY"
 * @param dateString - Input date string in format "YYYY-MM-DD HH:MM:SS" or "YYYY-MM-DD"
 * @returns Formatted date string
 */

export function formatDateTime(dateString: string): string {
  // Split the input string to check if it has time component
  const parts = dateString.split(' ');
  const datePart = parts[0]; // YYYY-MM-DD
  const timePart = parts[1]; // HH:MM:SS (if exists)
  
  // Format the date part from YYYY-MM-DD to DD/MM/YYYY
  const [year, month, day] = datePart.split('-');
  const formattedDate = `${day}/${month}/${year}`;
  
  // If time part exists, append it to the formatted date
  if (timePart) {
    return `${formattedDate},${timePart}`;
  }
  
  // Return only the formatted date if no time part
  return formattedDate;
}