import { ApplicationErrors } from "@enums/application.errors";
import { BillingStatus } from "@enums/billing.status";
import { DatabaseView } from "@enums/database.view";
import { BorrowerBillingData } from "@models/data/borrower_billing.data";
import { ApplicationError } from "@utilities/application_error";
import { BaseService } from "./base.service";
import { BillingServiceInterface } from "./contracts/billing_service.interface";

export class BillingService
  extends BaseService
  implements BillingServiceInterface
{
  async getOutstandings(param: {
    loanId: string;
    borrowerId: string;
  }): Promise<BorrowerBillingData[]> {
    const { data, error } = await this.getDatasource()
      .from(DatabaseView.BORROWER_BILLINGS)
      .select("*")
      .eq("loan_id", param.loanId)
      .eq("borrower_id", param.borrowerId)
      .neq("billing_status", BillingStatus.PAID)
      .lte("billing_date", new Date().toISOString().split("T")[0])
      .returns<BorrowerBillingData[]>();

    if (error) {
      throw new ApplicationError({
        status: 500,
        code: ApplicationErrors.UNKNWON_ERROR,
      });
    }

    if (!data) {
      return [];
    }

    return data;
  }
}
