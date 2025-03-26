import { MarkInvoiceRequest } from "@models/requests/mark_invoice.request";
import { InvoiceResponse } from "@models/responses/invoice.response";

export interface InvoiceRepositoryInterface {
  create(param: {
    loanId: string;
    borrowerId: string;
  }): Promise<InvoiceResponse>;

  markInvoice(param: MarkInvoiceRequest): Promise<boolean>;
}
