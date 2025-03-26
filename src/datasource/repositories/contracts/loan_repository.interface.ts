import { CreateLoanRequest } from "@models/requests/create_loan.request";
import { LoanResponse } from "@models/responses/loan.response";
import { LoanStatusResponse } from "@models/responses/loan_status.response";
import { OutstandingResponse } from "@models/responses/outstanding.response";

export interface LoanRepositoryInterface {
  create(param: { request: CreateLoanRequest }): Promise<LoanResponse>;
  getAll(param: { borrowerId?: string }): Promise<LoanResponse[]>;
  get(param: { id: string; borrowerId: string }): Promise<LoanResponse>;
  approve(param: { id: string }): Promise<LoanResponse>;
  disburse(param: { id: string }): Promise<LoanResponse>;
  getOutstanding(param: {
    id: string;
    borrowerId: string;
  }): Promise<OutstandingResponse>;
  getStatus(param: {
    id: string;
    borrowerId: string;
  }): Promise<LoanStatusResponse>;
}
