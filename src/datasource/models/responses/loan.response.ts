import { LoanStatus } from "@enums/loan.status";
import { BorrowerResponse } from "@models/responses/borrower.response";

export type LoanResponse = {
  id: string;
  amount: number;
  total_due?: number;
  weekly_due?: number;
  fee?: number;
  tenure_week?: number;
  date: Date;
  status?: LoanStatus;
  borrower?: BorrowerResponse;
};
