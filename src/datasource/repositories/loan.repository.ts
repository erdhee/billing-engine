import { CreateLoanRequest } from "@models/requests/create_loan.request";
import { LoanResponse } from "@models/responses/loan.response";
import { LoanStatusResponse } from "@models/responses/loan_status.response";
import { OutstandingResponse } from "@models/responses/outstanding.response";
import { BillingServiceInterface } from "@services/contracts/billing_service.interface";
import { LoanServiceInterface } from "@services/contracts/loan_service.interface";
import { LoanRepositoryInterface } from "./contracts/loan_repository.interface";

export class LoanRepository implements LoanRepositoryInterface {
  private loanService: LoanServiceInterface;
  private billingService: BillingServiceInterface;

  constructor(services: {
    loanService: LoanServiceInterface;
    billingService: BillingServiceInterface;
  }) {
    this.loanService = services.loanService;
    this.billingService = services.billingService;
  }

  async getAll(param: { borrowerId?: string }): Promise<LoanResponse[]> {
    return await this.loanService.getAll(param);
  }

  async get(param: { id: string; borrowerId: string }): Promise<LoanResponse> {
    return await this.loanService.get(param);
  }

  async create(param: { request: CreateLoanRequest }): Promise<LoanResponse> {
    param.request.fee ??= parseInt(process.env.DEFAULT_FEE_PERCENTAGE ?? "10");
    param.request.tenure_week ??= parseInt(
      process.env.DEFAULT_TENURE_WEEK ?? "50",
    );
    param.request.total_due =
      param.request.amount * ((100 + param.request.fee) / 100);
    param.request.weekly_due =
      param.request.total_due / param.request.tenure_week;

    return await this.loanService?.create(param);
  }

  async approve(param: { id: string }): Promise<LoanResponse> {
    return await this.loanService.approve(param);
  }

  async disburse(param: { id: string }): Promise<LoanResponse> {
    return await this.loanService.disburse(param);
  }

  async getOutstanding(param: {
    id: string;
    borrowerId: string;
  }): Promise<OutstandingResponse> {
    const response = await this.billingService.getOutstandings({
      loanId: param.id,
      borrowerId: param.borrowerId,
    });

    return {
      outstanding: response.reduce(
        (acc, billing) => acc + parseFloat(billing.billing_amount),
        0,
      ),
      billings: response,
    };
  }

  async getStatus(param: {
    id: string;
    borrowerId: string;
  }): Promise<LoanStatusResponse> {
    const response = await this.billingService.getOutstandings({
      loanId: param.id,
      borrowerId: param.borrowerId,
    });

    return {
      is_delinquent: response.length >= 2,
    };
  }
}
