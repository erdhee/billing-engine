CREATE OR REPLACE FUNCTION create_invoice(
  p_loan_id UUID,
  p_expiry_date TIMESTAMP,
  p_billing_ids UUID[],
  p_amount NUMERIC,
  p_borrower_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_invoice_id UUID := gen_random_uuid();
  v_billing_id UUID;
BEGIN
  INSERT INTO invoices (
    id,
    loan_id,
    amount,
    status,
    expiry_date,
    created_at,
    created_by
  ) VALUES (
    v_invoice_id,
    p_loan_id,
    p_amount,
    'PENDING',
    p_expiry_date,
    NOW(),
    p_borrower_id
  );

  -- Insert invoice-billing links
  FOREACH v_billing_id IN ARRAY p_billing_ids
  LOOP
    INSERT INTO invoice_billings (
      invoice_id,
      billing_id,
      created_at,
      created_by
    ) VALUES (
      v_invoice_id,
      v_billing_id,
      NOW(),
      p_borrower_id
    );
  END LOOP;

  RETURN v_invoice_id;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating invoice: %', SQLERRM;
    RAISE;
END;
$$ LANGUAGE plpgsql;
