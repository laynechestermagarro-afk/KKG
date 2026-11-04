# Team database setup

This repository manages the KKG PostgreSQL schema using Supabase CLI migration
files in `supabase/migrations`. The database is hosted by Supabase. Team
members do not need Docker to link to that hosted project or apply migrations.

## One-time project setup

1. A project administrator creates or selects the team's Supabase project.
2. Share the project reference with team members. Find it in the project URL
   (`https://<project-ref>.supabase.co`) or in the Supabase project settings.
3. Keep database passwords, Supabase personal access tokens, and service-role
   keys in an approved password manager. Never commit them or put them in
   `supabase/config.toml`.
4. Ensure team members have the Supabase project access required for their
   work. Use individual Supabase accounts rather than sharing a login.

The repository's `supabase/config.toml` is safe to commit; it contains local
CLI configuration, not the hosted database password or service-role key.
Supabase CLI link metadata under `supabase/.temp` is local and ignored by Git.

## Team member setup

From the repository root in PowerShell, each team member runs:

```powershell
npx.cmd supabase login
npx.cmd supabase link --project-ref YOUR_PROJECT_REF
npx.cmd supabase migration list
```

`supabase link` may request the database password. Enter it in the prompt only.
Do not pass it on the command line, commit it, or send it in chat.

## Migration workflow

1. Create a migration for a schema change:

   ```powershell
   npx.cmd supabase migration new descriptive_change_name
   ```

2. Add and review PostgreSQL SQL in the generated file under
   `supabase/migrations`.
3. Open a pull request so the team can review the migration before it reaches
   the shared database.
4. After approval, preview pending migrations:

   ```powershell
   .\scripts\run-supabase-migrations.ps1 -ProjectRef YOUR_PROJECT_REF
   ```

5. Apply only after the preview has been reviewed and the team agrees:

   ```powershell
   .\scripts\run-supabase-migrations.ps1 -ProjectRef YOUR_PROJECT_REF -Apply
   ```

The script does not use Docker. Its default behavior is preview-only. With
`-Apply`, it runs `supabase db push`, which applies all pending local migrations
to the linked hosted project—not only a selected migration.

### Existing dashboard changes and migration history

SQL run manually in the Dashboard SQL Editor is not automatically stored in
the repository or registered in CLI migration history. Before pushing, compare
the remote schema and migration list with the SQL files. If a change was
already made manually, coordinate a safe reconciliation with the database
owner; blindly pushing can fail on existing objects.

`supabase migration repair` only edits migration history. It does not execute
or validate a migration. Use it only after confirming that the corresponding
SQL changes are actually present and complete.

## Current schema migrations

- `20261028022200_app_user_roles_rights.sql`: roles, user profile, modules,
  rights catalogue, and user permissions.
- `20261028022600_password_reset_tokens.sql`: server-only password reset token
  storage.
- `20261028023000_seed_modules_rights.sql`: five modules and 36 catalogue
  rights.
- `20261028023400_audit_user.sql`: audit log and authenticated-user logging
  function.

All relevant tables enable Row Level Security. Review and add intentional
policies before exposing table access to app clients. Do not expose a
service-role key in client code. Use Supabase Auth's built-in password reset
flow unless the team has implemented and reviewed a secure custom flow.

## Verify tables

In the Supabase Dashboard, open **SQL Editor** and run:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

Expected project tables from the migrations include `app_user`, `audit_log`,
`module`, `password_reset_token`, `rights_catalogue`, `role`, and
`user_permission`. A migration version marked applied does not by itself prove
that SQL was executed; verify the schema if migrations were manually repaired.
