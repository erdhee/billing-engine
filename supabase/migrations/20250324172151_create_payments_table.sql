CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount NUMERIC(10, 2) NOT NULL,
    ref_id TEXT NOT NULL,
    date TIMESTAMP NOT NULL,
    invoice_id UUID NOT NULL REFERENCES invoices (id),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    created_by TEXT NOT NULL,
    updated_at TIMESTAMP,
    updated_by TEXT,
    deleted_at TIMESTAMP,
    deleted_by TEXT
);

CREATE INDEX idx_payments_invoice_id ON payments (invoice_id, deleted_by);
CREATE UNIQUE INDEX uniq_payments_active_invoice_id ON payments (invoice_id) WHERE deleted_by IS NULL;