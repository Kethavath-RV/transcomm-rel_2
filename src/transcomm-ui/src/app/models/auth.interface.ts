export interface LoginResponse {
  message: string;
  expires: Date;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface InvoiceParams {
  ecomBusinessCode: string;
  orderNumber: string;
  invoiceNumber: string;
}