CREATE TABLE public.audit_log (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.audit_log FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.audit_user()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    logged_in_user_id uuid := auth.uid();
BEGIN
    IF logged_in_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required'
            USING ERRCODE = '28000';
    END IF;

    INSERT INTO public.audit_log (user_id)
    VALUES (logged_in_user_id);

    RETURN logged_in_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.audit_user() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.audit_user() TO authenticated;
