import { ApplicationErrors } from "@enums/application.errors";
import { BillingStatus } from "@enums/billing.status";
import { DatabaseFunctions } from "@enums/database.functions";
import { DatabaseTables } from "@enums/database.tables";
import { InvoiceStatus } from "@enums/invoice.status";
import { BorrowerBillingData } from "@models/data/borrower_billing.data";
import { MarkInvoiceRequest } from "@models/requests/mark_invoice.request";
import { InvoiceResponse } from "@models/responses/invoice.response";
import { BaseService } from "@services/base.service";
import { ApplicationError } from "@utilities/application_error";
import { InvoiceServiceInterface } from "./contracts/invoice_service.interface";

export class InvoiceService
  extends BaseService
  implements InvoiceServiceInterface
{
  async create(param: {
    loanId: string;
    borrowerId: string;
    billings: BorrowerBillingData[];
  }): Promise<InvoiceResponse> {
    if (param.billings.length == 0) {
      throw new ApplicationError({
        status: 400,
        code: ApplicationErrors.INVALID_BILLING,
      });
    }

    param.billings.forEach((billing) => {
      if (billing.billing_status != BillingStatus.PENDING) {
        throw new ApplicationError({
          status: 400,
          code: ApplicationErrors.INVALID_BILLING,
        });
      }

      if (billing.loan_id != param.loanId) {
        throw new ApplicationError({
          status: 400,
          code: ApplicationErrors.MISMATCH_LOAN,
        });
      }
    });

    /**
     * Let's assume each borrower can only have one invoice at a time
     */

    const { data: existingInvoice, error: existingInvoiceError } =
      await this.getDatasource()
        .from(DatabaseTables.INVOICES)
        .select("id")
        .eq("loan_id", param.loanId)
        .gt("expiry_date", new Date().toISOString().split("T")[0])
        .neq("status", InvoiceStatus.PAID)
        .is("deleted_by", null)
        .maybeSingle<{ id: string }>();

    if (existingInvoiceError) {
      throw new ApplicationError({
        status: 500,
        code: ApplicationErrors.UNKNWON_ERROR,
      });
    }

    if (existingInvoice) {
      throw new ApplicationError({
        status: 409,
        code: ApplicationErrors.INVOICE_ALREADY_EXISTS,
      });
    }

    const expiration = parseInt(
      process.env.DEFAULT_PAYMENT_EXPIRATION_IN_MINUTES ?? "60",
    );
    const expiryDate = new Date(new Date().getTime() + expiration * 60 * 1000);
    const { data, error } = await this.getDatasource().rpc(
      DatabaseFunctions.CREATE_INVOICE,
      {
        p_loan_id: param.loanId,
        p_expiry_date: expiryDate,
        p_billing_ids: param.billings.map((billing) => billing.billing_id),
        p_amount: param.billings.reduce(
          (acc, billing) => acc + parseFloat(billing.billing_amount),
          0,
        ),
        p_borrower_id: param.borrowerId,
      },
    );

    if (error) {
      throw new ApplicationError({
        status: 500,
        code: ApplicationErrors.UNKNWON_ERROR,
      });
    }

    return await this.get({ id: data });
  }

  async markInvoice(param: MarkInvoiceRequest): Promise<boolean> {
    const { data, error } = await this.getDatasource()
      .rpc(DatabaseFunctions.MARK_INVOICE, {
        p_invoice_id: param.invoiceId,
        p_ref_id: param.refId,
        p_amount: param.amount,
      })
      .maybeSingle<boolean>();

    if (error || !data) {
      throw new ApplicationError({
        status: 500,
        code: ApplicationErrors.UNKNWON_ERROR,
      });
    }

    return data;
  }

  async get(param: { id: string }): Promise<InvoiceResponse> {
    const { data, error } = await this.getDatasource()
      .from(DatabaseTables.INVOICES)
      .select(
        `
        id,
        amount,
        status,
        expiry_date,
        loan:loans(
          id, 
          amount, 
          total_due, 
          weekly_due, 
          fee, 
          tenure_week, 
          date, 
          status, 
          borrower:borrowers(
            id, 
            name, 
            email, 
            phone, 
            is_active
          )
        )
    `,
      )
      .eq("id", param.id)
      .is("deleted_by", null)
      .maybeSingle<InvoiceResponse>();

    if (error || !data) {
      throw new ApplicationError({
        status: 404,
        code: ApplicationErrors.INVOICE_NOT_FOUND,
      });
    }

    return data;
  }
}
