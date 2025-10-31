# Supabase MCP Setup Guide

## What is MCP?

MCP (Model Context Protocol) lets AI assistants interact directly with Supabase, automating setup tasks that would normally require manual steps.

## Prerequisites

1. **Supabase Account**: Sign up at https://supabase.com
2. **Create a Project**: Go to dashboard and create a new project
3. **Personal Access Token**: 
   - Go to https://supabase.com/dashboard/account/tokens
   - Click "Generate new token"
   - Copy it (you'll need this!)

## Setup Steps

### 1. Run the Automated Setup Script

```bash
npm run setup:supabase
```

This will:
- ✅ Prompt you for your Supabase credentials
- ✅ Create `.env.local` with your configuration
- ✅ Set up MCP configuration automatically
- ✅ Guide you through remaining steps

### 2. Restart Cursor

After running the script, **restart Cursor** to activate the MCP connection.

### 3. Use AI Assistant to Complete Setup

Once MCP is active, you can ask me to:

**Run the database migration:**
```
"Can you run the database migration from supabase/migrations/001_initial_schema.sql?"
```

**Enable MFA:**
```
"Enable Multi-Factor Authentication in my Supabase project"
```

**Verify setup:**
```
"Check if my Supabase project is configured correctly"
```

## Manual Steps (If Needed)

If you prefer to do some steps manually:

1. **Get API Keys:**
   - Supabase Dashboard → Settings → API
   - Copy: Project URL, anon key, service_role key

2. **Run Migration:**
   - Supabase Dashboard → SQL Editor
   - Copy/paste contents of `supabase/migrations/001_initial_schema.sql`
   - Click "Run"

3. **Enable MFA:**
   - Settings → Authentication → Multi-Factor Authentication
   - Enable TOTP

## What MCP Can Do

With MCP configured, the AI can:
- Manage database tables and migrations
- Execute SQL queries
- Configure project settings
- View logs and debug issues
- Manage authentication settings

Just ask naturally! The AI will use MCP tools to interact with your Supabase project.

## Troubleshooting

**MCP not connecting?**
- Make sure `.cursor/mcp.json` exists
- Verify `SUPABASE_ACCESS_TOKEN` is in `.env.local`
- Restart Cursor completely
- Check Cursor → Settings → MCP to see if Supabase server is listed

**Need help?**
Just ask! With MCP, I can help diagnose and fix issues directly.
