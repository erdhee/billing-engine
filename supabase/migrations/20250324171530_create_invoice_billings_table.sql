CREATE TABLE invoice_billings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices (id),
    billing_id UUID NOT NULL REFERENCES billings (id),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    created_by TEXT NOT NULL,
    updated_at TIMESTAMP,
    updated_by TEXT,
    deleted_at TIMESTAMP,
    deleted_by TEXT
);

CREATE INDEX idx_invoice_billings_invoice_id ON invoice_billings (invoice_id, deleted_by);
CREATE INDEX idx_invoice_billings_billing_id ON invoice_billings (billing_id, deleted_by);
CREATE UNIQUE INDEX uniq_invoice_billings_invoice_id ON invoice_billings (invoice_id, billing_id) WHERE deleted_by IS NULL;