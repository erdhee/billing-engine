CREATE TABLE borrowers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    created_by TEXT NOT NULL,
    updated_at TIMESTAMP,
    updated_by TEXT,
    deleted_at TIMESTAMP,
    deleted_by TEXT
);

CREATE INDEX idx_borrowers_name ON borrowers (name);
CREATE INDEX idx_borrowers_email ON borrowers (email);
CREATE INDEX idx_borrowers_phone ON borrowers (phone);
CREATE INDEX idx_borrowers_active ON borrowers (is_active, deleted_by);

CREATE UNIQUE INDEX uniq_borrowers_active_email_and_phone_number ON borrowers (email, phone) WHERE is_active = true AND deleted_by IS NULL;
CREATE UNIQUE INDEX uniq_borrowers_active_email ON borrowers (email) WHERE is_active = true AND deleted_by IS NULL;
CREATE UNIQUE INDEX uniq_borrowers_active_phone ON borrowers (phone) WHERE is_active = true AND deleted_by IS NULL;