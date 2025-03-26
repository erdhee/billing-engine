CREATE TABLE billings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount NUMERIC(10, 2) NOT NULL,
    sequence INT NOT NULL,
    status TEXT NOT NULL,
    date DATE NOT NULL,
    loan_id UUID NOT NULL REFERENCES loans (id),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    created_by TEXT NOT NULL,
    updated_at TIMESTAMP,
    updated_by TEXT,
    deleted_at TIMESTAMP,
    deleted_by TEXT
);

CREATE INDEX idx_billing_loan_sequence ON billings (loan_id, sequence, deleted_by);
CREATE INDEX idx_billings_status ON billings (status, deleted_by);
CREATE INDEX idx_billings_loan_status ON billings (loan_id, date, status, deleted_by);

CREATE UNIQUE INDEX uniq_billings_active_loan_id ON billings (loan_id, date, status) WHERE deleted_by IS NULL;