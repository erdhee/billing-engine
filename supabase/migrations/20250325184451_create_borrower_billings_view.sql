DROP VIEW IF EXISTS borrower_billings;
CREATE OR REPLACE VIEW borrower_billings AS (
    SELECT l.id as loan_id, l.borrower_id, b.id as billing_id, b.amount as billing_amount, b.status as billing_status, b.date as billing_date
    FROM loans l
    INNER JOIN billings b on b.loan_id = l.id AND b.deleted_by IS NULL and b.status != 'PAID' and b.date <= NOW()
    WHERE l.deleted_by IS NULL AND l.status = 'DISBURSED'
);