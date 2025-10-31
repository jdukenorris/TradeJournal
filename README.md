# Notion Trade Journal Bridge

Voice-first trading journal that syncs to Notion and provides AI reviews.

## Week 1 Setup (Core Auth + Testing)

### Prerequisites

- Node.js 20+ 
- npm or yarn
- Supabase account (for database and auth)
- GitHub account (for CI/CD)

### Initial Setup

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Supabase (Easy with MCP!):**
   
   **🚀 Recommended: Use the automated setup script:**
   ```bash
   npm run setup:supabase
   ```
   
   This will guide you through:
   - Getting your Supabase Personal Access Token
   - Entering your project credentials
   - Setting up MCP (Model Context Protocol) for easy AI-assisted management
   
   **📖 Detailed guide: See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)**
   
   After running the script, restart Cursor and ask the AI assistant to:
   - Run the database migration
   - Enable MFA in your project
   - Verify everything is configured correctly

3. **Configure environment variables:**
   
   Create a `.env.local` file in the project root:
   ```bash
   touch .env.local
   ```
   
   Add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
   
   Replace with your actual values from Supabase dashboard → Settings → API

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Run tests:**
   ```bash
   # Unit tests
   npm run test:unit
   
   # E2E tests
   npm run test:e2e
   
   # E2E tests with UI
   npm run test:e2e:ui
   ```

### Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── sign-in/           # Sign in page + TOTP verification
│   ├── sign-up/           # Sign up page
│   ├── dashboard/         # Protected dashboard
│   ├── settings/          # Settings pages (MFA)
│   └── auth/              # Auth callbacks
├── lib/
│   ├── supabase/          # Supabase client utilities
│   └── auth.ts            # Auth helpers
├── components/            # React components
└── test/                  # Test setup

tests/
├── e2e/                   # Playwright E2E tests
└── unit/                  # Vitest unit tests

supabase/
└── migrations/            # Database migrations
```

### Features Implemented (Week 1)

✅ Password authentication (sign-up/sign-in)  
✅ TOTP/MFA enrollment and verification  
✅ Protected routes with middleware  
✅ Database schema (user_security, user_backup_codes, broker_connections)  
✅ Testing infrastructure (Vitest, Playwright, RTL)  
✅ CI/CD setup (GitHub Actions)  

### Next Steps (Week 2)

- Broker + Notion connection setup
- CSV import functionality
- Trade mapping system

### Testing

The project includes:
- **Unit tests** (Vitest): Test utilities and business logic
- **Component tests** (React Testing Library): Test React components
- **E2E tests** (Playwright): Test full user flows

CI runs all tests on push/PR to main branch.

### Deployment

See `DEPLOY.md` for deployment instructions.
