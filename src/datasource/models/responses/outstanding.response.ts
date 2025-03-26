import { BorrowerBillingData } from "@models/data/borrower_billing.data";

export type OutstandingResponse = {
  outstanding: number;
  billings: BorrowerBillingData[];
};
