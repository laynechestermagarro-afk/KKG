BEGIN;

SELECT plan(3);

SELECT set_config(
    'request.jwt.claim.sub',
    '8c3c4bd5-16b2-4c0d-a4c8-4161b864f010',
    true
);
SELECT set_config(
    'request.jwt.claims',
    '{"sub":"8c3c4bd5-16b2-4c0d-a4c8-4161b864f010"}',
    true
);

SELECT is(
    public.audit_user(),
    '8c3c4bd5-16b2-4c0d-a4c8-4161b864f010'::uuid,
    'returns the authenticated user id'
);

SELECT is(
    (
        SELECT count(*)::integer
        FROM public.audit_log
        WHERE user_id = '8c3c4bd5-16b2-4c0d-a4c8-4161b864f010'::uuid
    ),
    1,
    'writes the authenticated user id to audit_log'
);

SELECT set_config('request.jwt.claim.sub', '', true);
SELECT set_config('request.jwt.claims', '', true);

SELECT throws_ok(
    'SELECT public.audit_user()',
    '28000',
    'Authentication required',
    'rejects calls without an authenticated user'
);

SELECT * FROM finish();

ROLLBACK;
