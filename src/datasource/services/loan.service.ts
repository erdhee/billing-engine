import { ApplicationErrors } from "@enums/application.errors";
import { DatabaseFunctions } from "@enums/database.functions";
import { DatabaseTables } from "@enums/database.tables";
import { LoanStatus } from "@enums/loan.status";
import { CreateLoanRequest } from "@models/requests/create_loan.request";
import { LoanResponse } from "@models/responses/loan.response";
import { BaseService } from "@services/base.service";
import { LoanServiceInterface } from "@services/contracts/loan_service.interface";
import { ApplicationError } from "@utilities/application_error";

export class LoanService extends BaseService implements LoanServiceInterface {
  selectionQuery = `
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
  `;

  async getAll(param: { borrowerId?: string }): Promise<LoanResponse[]> {
    const { data, error } = await this.getDatasource()
      .from(DatabaseTables.LOANS)
      .select(this.selectionQuery)
      .eq("borrower_id", param.borrowerId)
      .is("deleted_by", null)
      .order("date", { ascending: false })
      .returns<LoanResponse[]>();

    if (error) {
      console.log(error);
      throw new ApplicationError({
        status: 500,
        code: ApplicationErrors.UNKNWON_ERROR,
      });
    }

    return data;
  }

  async get(param: { id: string; borrowerId?: string }): Promise<LoanResponse> {
    let query = this.getDatasource()
      .from(DatabaseTables.LOANS)
      .select(this.selectionQuery)
      .eq("id", param.id);

    if (param.borrowerId) {
      query = query.eq("borrower_id", param.borrowerId);
    }

    const { data, error } = await query.maybeSingle<LoanResponse>();

    if (error || !data) {
      throw new ApplicationError({
        status: 404,
        code: ApplicationErrors.LOAN_NOT_FOUND,
      });
    }

    return data;
  }

  async create(param: { request: CreateLoanRequest }): Promise<LoanResponse> {
    const maxLoan = parseInt(process.env.DEFAULT_MAX_LOAN ?? "5000000");

    if (param.request.amount > maxLoan) {
      throw new ApplicationError({
        status: 400,
        code: ApplicationErrors.INVALID_LOAN_AMOUNT,
      });
    }

    /**
     * Let's assume each borrower can only have one pending loan at a time
     */

    const { data: existingLoan, error: existingLoanError } =
      await this.getDatasource()
        .from(DatabaseTables.LOANS)
        .select("id, status, borrower_id, deleted_by")
        .eq("borrower_id", param.request.borrower_id)
        .eq("status", LoanStatus.PENDING)
        .is("deleted_by", null)
        .maybeSingle<{ id: string }>();

    if (existingLoanError) {
      throw new ApplicationError({
        status: 500,
        code: ApplicationErrors.UNKNWON_ERROR,
      });
    }

    if (existingLoan) {
      throw new ApplicationError({
        status: 409,
        code: ApplicationErrors.LOAN_ALREADY_EXISTS,
      });
    }

    const { data, error } = await this.getDatasource()
      .from(DatabaseTables.LOANS)
      .insert({
        ...param.request,
        created_by: param.request.borrower_id,
        status: LoanStatus.PENDING,
      })
      .select("id")
      .maybeSingle<{ id: string }>();

    if (error) {
      throw new ApplicationError({
        status: 500,
        code: ApplicationErrors.UNKNWON_ERROR,
      });
    }

    if (!data) {
      throw new ApplicationError({
        status: 404,
        code: ApplicationErrors.LOAN_NOT_FOUND,
      });
    }

    return await this.get({
      id: data.id,
      borrowerId: param.request.borrower_id,
    });
  }

  /**
   * For now, let's assume admin unable to change loan configuration such as
   * fee, tenure week, etc.
   */

  async approve(param: { id: string }): Promise<LoanResponse> {
    const { data, error } = await this.getDatasource()
      .from(DatabaseTables.LOANS)
      .update({
        status: LoanStatus.APPROVED,
        updated_by: "SYSTEM",
        updated_at: new Date(),
      })
      .eq("id", param.id)
      .not(
        "status",
        "in",
        `(${LoanStatus.DISBURSED}, ${LoanStatus.COMPLETED}, ${LoanStatus.APPROVED})`,
      );

    if (error) {
      throw new ApplicationError({
        status: 500,
        code: ApplicationErrors.UNKNWON_ERROR,
      });
    }

    return await this.get({ id: param.id });
  }

  async disburse(param: { id: string }): Promise<LoanResponse> {
    const { data, error } = await this.getDatasource().rpc(
      DatabaseFunctions.DISBURSE_LOAN,
      {
        p_loan_id: param.id,
      },
    );

    if (error || !data) {
      throw new ApplicationError({
        status: 500,
        code: ApplicationErrors.UNKNWON_ERROR,
      });
    }

    return await this.get({ id: param.id });
  }
}
