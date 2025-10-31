#!/usr/bin/env node

/**
 * Automated Supabase Setup Script
 * Uses Supabase MCP to automatically set up your project
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('🚀 Supabase Automated Setup\n');
  console.log('This script will help you set up your Supabase project automatically.\n');

  // Step 1: Get Supabase Personal Access Token
  console.log('Step 1: Get your Supabase Personal Access Token');
  console.log('─'.repeat(60));
  console.log('1. Go to: https://supabase.com/dashboard/account/tokens');
  console.log('2. Click "Generate new token"');
  console.log('3. Give it a name (e.g., "MCP Setup")');
  console.log('4. Copy the token\n');
  
  const accessToken = await question('Paste your Supabase Access Token: ');
  
  if (!accessToken || accessToken.trim() === '') {
    console.error('❌ Access token is required');
    process.exit(1);
  }

  // Step 2: Get Project URL and Keys
  console.log('\nStep 2: Get your project credentials');
  console.log('─'.repeat(60));
  console.log('1. Go to your Supabase project dashboard');
  console.log('2. Navigate to Settings → API');
  console.log('3. Copy the following values:\n');
  
  const projectUrl = await question('Project URL (https://xxxxx.supabase.co): ');
  const anonKey = await question('anon/public key: ');
  const serviceRoleKey = await question('service_role key: ');

  // Step 3: Create .env.local file
  console.log('\n📝 Creating .env.local file...');
  
  const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${projectUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}
SUPABASE_SERVICE_ROLE_KEY=${serviceRoleKey}
SUPABASE_ACCESS_TOKEN=${accessToken}

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
`;

  const envPath = path.join(process.cwd(), '.env.local');
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file');

  // Step 4: Setup MCP configuration
  console.log('\n📝 Setting up MCP configuration...');
  
  const mcpConfig = {
    mcpServers: {
      supabase: {
        command: "npx",
        args: [
          "-y",
          "@supabase/mcp-server-supabase@latest",
          "--access-token",
          accessToken
        ]
      }
    }
  };

  const mcpDir = path.join(process.cwd(), '.cursor');
  if (!fs.existsSync(mcpDir)) {
    fs.mkdirSync(mcpDir, { recursive: true });
  }
  
  const mcpPath = path.join(mcpDir, 'mcp.json');
  fs.writeFileSync(mcpPath, JSON.stringify(mcpConfig, null, 2));
  console.log('✅ Created .cursor/mcp.json file');

  // Step 5: Instructions for running migration
  console.log('\n📋 Next Steps:');
  console.log('─'.repeat(60));
  console.log('1. The MCP server is now configured in Cursor');
  console.log('2. Restart Cursor to activate the MCP connection');
  console.log('3. Ask me (the AI assistant) to:');
  console.log('   - Run the database migration');
  console.log('   - Enable MFA in your Supabase project');
  console.log('   - Verify the setup');
  console.log('\nOr manually:');
  console.log('4. Go to Supabase Dashboard → SQL Editor');
  console.log('5. Copy/paste the contents of supabase/migrations/001_initial_schema.sql');
  console.log('6. Run the query');
  console.log('7. Enable MFA: Settings → Authentication → Multi-Factor Authentication\n');

  console.log('✨ Setup complete! Your credentials are saved in .env.local');
  console.log('⚠️  Remember: Never commit .env.local to git!\n');

  rl.close();
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});

