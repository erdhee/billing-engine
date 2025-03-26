CREATE OR REPLACE FUNCTION mark_invoice(
  p_invoice_id UUID,
  p_ref_id TEXT,
  p_amount NUMERIC
)
RETURNS BOOLEAN AS $$
DECLARE
  v_loan_id UUID;
  v_invoice_amount NUMERIC;
  v_now TIMESTAMP := NOW();
BEGIN
  SELECT loan_id, amount
  INTO v_loan_id, v_invoice_amount
  FROM invoices
  WHERE id = p_invoice_id AND status = 'PENDING'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invoice not found or not in PENDING status';
  END IF;

  UPDATE invoices
  SET status = 'PAID',
      updated_at = v_now,
      updated_by = 'SYSTEM'
  WHERE id = p_invoice_id;

  UPDATE billings
  SET status = 'PAID',
      updated_at = v_now,
      updated_by = 'SYSTEM'
  WHERE id IN (
    SELECT billing_id
    FROM invoice_billings
    WHERE invoice_id = p_invoice_id
  );

  INSERT INTO payments (
    id,
    invoice_id,
    ref_id,
    amount,
    date,
    created_at,
    created_by
  ) VALUES (
    gen_random_uuid(),
    p_invoice_id,
    p_ref_id,
    p_amount,
    v_now,
    v_now,
    'SYSTEM'
  );

  IF NOT EXISTS (
    SELECT 1
    FROM billings
    WHERE loan_id = v_loan_id AND status = 'PENDING'
  ) THEN
    UPDATE loans
    SET status = 'COMPLETED',
        updated_at = v_now,
        updated_by = 'SYSTEM'
    WHERE id = v_loan_id;
  END IF;

  RETURN TRUE;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error in mark_invoice_as_paid: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;
