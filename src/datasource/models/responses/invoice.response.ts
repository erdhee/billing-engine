import { InvoiceStatus } from "@enums/invoice.status";
import { LoanResponse } from "@models/responses/loan.response";

export type InvoiceResponse = {
  id: string;
  amount: string;
  status: InvoiceStatus;
  expiry_date: Date;
  loan?: LoanResponse;
};
