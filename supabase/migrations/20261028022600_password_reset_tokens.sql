CREATE TABLE public.password_reset_token (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token_hash bytea NOT NULL UNIQUE,
    expires_at timestamptz NOT NULL,
    used boolean NOT NULL DEFAULT false,
    used_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT password_reset_token_hash_length
        CHECK (octet_length(token_hash) = 32),
    CONSTRAINT password_reset_token_expiry_after_creation
        CHECK (expires_at > created_at),
    CONSTRAINT password_reset_token_used_consistent
        CHECK (used = (used_at IS NOT NULL))
);

CREATE INDEX password_reset_token_active_expiry_idx
    ON public.password_reset_token (expires_at)
    WHERE used = false;

CREATE INDEX password_reset_token_user_id_idx
    ON public.password_reset_token (user_id);

ALTER TABLE public.password_reset_token ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.password_reset_token FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.password_reset_token TO service_role;
