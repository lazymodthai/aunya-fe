export const numberOnly = (value: string) => {
  return value.replace(/\D/g, '');
}

export const decimalOnly = (value: string) => {
  return value.replace(/[^\d.]/g, '');
}

export const alphanumericOnly = (value: string) => {
  return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

export const formatPhoneNumber = (phoneNumber:string) => {
  if (typeof phoneNumber !== 'string' || phoneNumber.length !== 10) {
    throw new Error("Invalid phone number format. Please provide a 10-digit phone number.");
  }

  return phoneNumber.slice(0, 2) + '*-***' + phoneNumber.slice(6);
}

export const isValidThaiPhoneNumber = (phoneNumber:string) =>  {
  const regex = /^(08|09|06)\d{8}$/;
  return regex.test(phoneNumber);
}

export const formatCid = (value: string) => {

  if (value.length === 0) {
    return '';
  }

  if (value.length <= 1) {
    return value;
  } else if (value.length <= 5) {
    value = value.replace(/^(\d{1})(\d{0,4})$/, '$1-$2');
  } else if (value.length <= 10) {
    value = value.replace(/^(\d{1})(\d{0,4})(\d{0,5})$/, '$1-$2-$3');
  } else if (value.length <= 12) {
    value = value.replace(/^(\d{1})(\d{0,4})(\d{0,5})(\d{0,2})$/, '$1-$2-$3-$4');
  } else {
    value = value.replace(/^(\d{1})(\d{0,4})(\d{0,5})(\d{0,2})(\d{0,1})$/, '$1-$2-$3-$4-$5');
  }

  return value;
}

export const formatLaserId= (value: string) => {
  if (value.length === 0) {
    return '';
  }

  if (value.length <= 3) {
    return value;
  } else if (value.length <= 10) {
    // เพิ่มเครื่องหมาย "-" หลังจากตัวที่ 3
    return value.replace(/^([A-Z0-9]{3})([A-Z0-9]{0,7})$/, '$1-$2');
  } else {
    // เพิ่มเครื่องหมาย "-" หลังจากตัวที่ 3 และ 10
    return value.replace(/^([A-Z0-9]{3})([A-Z0-9]{0,7})([A-Z0-9]{0,2})$/, '$1-$2-$3');
  }
}