import { BorrowerBillingData } from "@models/data/borrower_billing.data";
import { MarkInvoiceRequest } from "@models/requests/mark_invoice.request";
import { InvoiceResponse } from "@models/responses/invoice.response";

export interface InvoiceServiceInterface {
  create(param: {
    loanId: string;
    borrowerId: string;
    billings: BorrowerBillingData[];
  }): Promise<InvoiceResponse>;

  markInvoice(param: MarkInvoiceRequest): Promise<boolean>;
}
