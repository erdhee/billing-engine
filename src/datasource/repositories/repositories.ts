import { InvoiceRepositoryInterface } from "@repositories/contracts/invoice_repository.interface";
import { LoanRepositoryInterface } from "@repositories/contracts/loan_repository.interface";
import { InvoiceRepository } from "@repositories/invoice.repository";
import { LoanRepository } from "@repositories/loan.repository";
import { Services } from "@services/services";

export class Repositories {
  static loanRepository: LoanRepositoryInterface = new LoanRepository({
    loanService: Services.loanService,
    billingService: Services.billingService,
  });

  static invoiceRepository: InvoiceRepositoryInterface = new InvoiceRepository({
    invoiceService: Services.invoiceService,
    billingService: Services.billingService,
  });
}
