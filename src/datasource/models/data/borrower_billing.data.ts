import { BillingStatus } from "@enums/billing.status";

export type BorrowerBillingData = {
  loan_id: string;
  borrower_id: string;
  billing_id: string;
  billing_amount: string;
  billing_status: BillingStatus;
  billing_date: Date;
};
