import { CreateLoanRequest } from "@models/requests/create_loan.request";
import { LoanResponse } from "@models/responses/loan.response";

export interface LoanServiceInterface {
  create(param: { request: CreateLoanRequest }): Promise<LoanResponse>;
  getAll(param: { borrowerId?: string }): Promise<LoanResponse[]>;
  get(param: { id: string; borrowerId?: string }): Promise<LoanResponse>;
  approve(param: { id: string }): Promise<LoanResponse>;
  disburse(param: { id: string }): Promise<LoanResponse>;
}
