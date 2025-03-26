import { BillingService } from "@services/billing.service";
import { BillingServiceInterface } from "@services/contracts/billing_service.interface";
import { InvoiceServiceInterface } from "@services/contracts/invoice_service.interface";
import { LoanServiceInterface } from "@services/contracts/loan_service.interface";
import { InvoiceService } from "@services/invoice.service";
import { LoanService } from "@services/loan.service";

export class Services {
  static loanService: LoanServiceInterface = new LoanService();
  static billingService: BillingServiceInterface = new BillingService();
  static invoiceService: InvoiceServiceInterface = new InvoiceService();
}
