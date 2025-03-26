CREATE TABLE loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount NUMERIC(10, 2) NOT NULL,
    total_due NUMERIC(10, 2) NOT NULL,
    weekly_due NUMERIC(10, 2) NOT NULL,
    fee NUMERIC(10, 2) NOT NULL,
    tenure_week INT NOT NULL,
    date TIMESTAMP NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL,
    borrower_id UUID NOT NULL REFERENCES borrowers (id),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    created_by TEXT NOT NULL,
    updated_at TIMESTAMP,
    updated_by TEXT,
    deleted_at TIMESTAMP,
    deleted_by TEXT
);

CREATE INDEX idx_loans_borrower_id ON loans (borrower_id, deleted_by);
CREATE INDEX idx_loans_status ON loans (status, deleted_by);
CREATE INDEX idx_loans_borrower_status ON loans (borrower_id, status, deleted_by);

CREATE UNIQUE INDEX uniq_loans_active_borrower_id ON loans (borrower_id, status) WHERE deleted_by IS NULL;