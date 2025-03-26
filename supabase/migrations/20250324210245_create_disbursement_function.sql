CREATE OR REPLACE FUNCTION disburse_loan(p_loan_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_weekly_due NUMERIC;
  v_tenure INT;
  v_start_date DATE;
  v_counter INT;
BEGIN
  SELECT weekly_due, tenure_week, date
  INTO v_weekly_due, v_tenure, v_start_date
  FROM loans
  WHERE id = p_loan_id AND status = 'APPROVED'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Loan not found or status is not APPROVED: %', loan_uuid;
  END IF;

  UPDATE loans
  SET status = 'DISBURSED', updated_at = NOW(), updated_by = 'SYSTEM'
  WHERE id = p_loan_id;

  FOR v_counter IN 0..(v_tenure - 1) LOOP
    INSERT INTO billings (loan_id, sequence, amount, status, date, created_at, created_by)
    VALUES (
      p_loan_id,
      v_counter + 1,
      v_weekly_due,
      'PENDING',
      v_start_date + ((v_counter + 1) * 7),
      NOW(),
      'SYSTEM'
    );
  END LOOP;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error disbursing loan %: %', p_loan_id, SQLERRM;
END;
$$ LANGUAGE plpgsql;
