import { MarkInvoiceRequest } from "@models/requests/mark_invoice.request";
import { InvoiceResponse } from "@models/responses/invoice.response";
import { BillingServiceInterface } from "@services/contracts/billing_service.interface";
import { InvoiceServiceInterface } from "@services/contracts/invoice_service.interface";
import { InvoiceRepositoryInterface } from "./contracts/invoice_repository.interface";

export class InvoiceRepository implements InvoiceRepositoryInterface {
  private invoiceService: InvoiceServiceInterface;
  private billingService: BillingServiceInterface;

  constructor(services: {
    invoiceService: InvoiceServiceInterface;
    billingService: BillingServiceInterface;
  }) {
    this.invoiceService = services.invoiceService;
    this.billingService = services.billingService;
  }

  async create(param: {
    loanId: string;
    borrowerId: string;
  }): Promise<InvoiceResponse> {
    const billings = await this.billingService.getOutstandings({
      loanId: param.loanId,
      borrowerId: param.borrowerId,
    });

    return await this.invoiceService.create({
      loanId: param.loanId,
      borrowerId: param.borrowerId,
      billings: billings,
    });
  }

  async markInvoice(param: MarkInvoiceRequest): Promise<boolean> {
    return await this.invoiceService.markInvoice(param);
  }
}
