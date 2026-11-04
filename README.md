# KKG student setup

This repository contains the KKG project and its Supabase database migrations.
You do not need Docker to connect to the hosted team database or review the
migrations.

## Requirements

- Git
- Node.js LTS, which includes `npm` and `npx`
- Access to the team's Supabase project

Check Node.js and npm in a new VS Code PowerShell terminal:

```powershell
node -v
npm -v
npx.cmd --version
```

## Get the project

Clone the GitHub repository, then open its folder in VS Code:

```powershell
git clone https://github.com/laynechestermagarro-afk/KKG.git
cd KKG
```

If you already have the repository, open its folder and pull the latest branch
or changes provided by your team.

## Connect to Supabase

Ask a team administrator for the Supabase project reference. Do not ask for or
share the database password, service-role key, or personal access token in the
repository or chat.

In the repository's VS Code terminal:

```powershell
npx.cmd supabase login
npx.cmd supabase link --project-ref YOUR_PROJECT_REF
npx.cmd supabase migration list
```

The login command opens the Supabase CLI sign-in flow. The project reference
identifies the hosted project; it is not a password. The link command may
prompt for the database password. Enter it only into the CLI prompt, never into
a committed file.

The migration list shows which versions are local and which are recorded as
applied remotely. Do not run `migration repair` just to make the remote list
look complete: repair changes migration history and does not execute SQL.

## Review and apply migrations

To preview pending migrations without applying them:

```powershell
.\scripts\run-supabase-migrations.ps1 -ProjectRef YOUR_PROJECT_REF
```

Review the preview and coordinate with the team before applying changes to the
shared database. To apply all pending migrations, explicitly add `-Apply`:

```powershell
.\scripts\run-supabase-migrations.ps1 -ProjectRef YOUR_PROJECT_REF -Apply
```

The runner uses the hosted project and Supabase CLI; it does not start Docker
or a local database. Applying migrations changes the shared database, so do
not use `-Apply` unless your team asked you to do so.

## Database checks

You can inspect public tables in the Supabase Dashboard under **Table Editor**,
or run this query in **SQL Editor**:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

For database conventions, access safeguards, and team workflow, see
[docs/team-database-setup.md](docs/team-database-setup.md).
