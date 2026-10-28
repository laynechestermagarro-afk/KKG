CREATE TABLE public."role" (
    code text PRIMARY KEY,
    name text NOT NULL,
    description text,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT role_code_not_empty CHECK (length(trim(code)) > 0)
);

INSERT INTO public."role" (code, name)
VALUES
    ('superadmin', 'Superadmin'),
    ('admin', 'Admin'),
    ('user', 'User')
ON CONFLICT (code) DO NOTHING;

CREATE TABLE public."module" (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text NOT NULL UNIQUE,
    name text NOT NULL,
    description text,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT module_code_not_empty CHECK (length(trim(code)) > 0)
);

CREATE TABLE public.rights_catalogue (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id uuid NOT NULL REFERENCES public."module"(id) ON DELETE RESTRICT,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT rights_catalogue_code_not_empty CHECK (length(trim(code)) > 0),
    CONSTRAINT rights_catalogue_module_code_unique UNIQUE (module_id, code)
);

CREATE TABLE public.app_user (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role text NOT NULL DEFAULT 'superadmin'
        REFERENCES public."role"(code) ON DELETE RESTRICT,
    blocked boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.user_permission (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    app_user_id uuid NOT NULL REFERENCES public.app_user(id) ON DELETE CASCADE,
    right_id uuid NOT NULL REFERENCES public.rights_catalogue(id) ON DELETE RESTRICT,
    granted_by uuid REFERENCES public.app_user(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

CREATE UNIQUE INDEX user_permission_active_unique
    ON public.user_permission (app_user_id, right_id)
    WHERE deleted_at IS NULL;

CREATE INDEX rights_catalogue_module_id_idx
    ON public.rights_catalogue (module_id);

CREATE INDEX user_permission_app_user_id_idx
    ON public.user_permission (app_user_id);

ALTER TABLE public."role" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."module" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rights_catalogue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permission ENABLE ROW LEVEL SECURITY;
