export type CreateLoanRequest = {
  amount: number;
  total_due?: number;
  weekly_due?: number;
  fee?: number;
  tenure_week?: number;
  borrower_id: string;
};
