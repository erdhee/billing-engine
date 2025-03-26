CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    loan_id UUID NOT NULL REFERENCES loans (id),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    created_by TEXT NOT NULL,
    updated_at TIMESTAMP,
    updated_by TEXT,
    deleted_at TIMESTAMP,
    deleted_by TEXT
);

CREATE INDEX idx_invoices_loan_id ON invoices (loan_id, deleted_by);
CREATE INDEX idx_invoices_status ON invoices (status, deleted_by);
CREATE INDEX idx_invoices_loan_status ON invoices (loan_id, status, expiry_date, deleted_by);

CREATE UNIQUE INDEX uniq_invoices_active_loan_id ON invoices (loan_id, status, expiry_date) WHERE deleted_by IS NULL AND (status != 'PAID' OR status != 'EXPIRED');