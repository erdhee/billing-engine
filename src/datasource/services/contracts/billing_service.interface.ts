import { BorrowerBillingData } from "@models/data/borrower_billing.data";

export interface BillingServiceInterface {
  getOutstandings(param: {
    loanId: string;
    borrowerId: string;
  }): Promise<BorrowerBillingData[]>;
}
