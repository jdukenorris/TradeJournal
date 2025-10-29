# Deployment Rules for TradeJournal

**Repository:** https://github.com/jdukenorris/TradeJournal.git  
**Branch:** `main`  
**User:** `jdukenorris`

---

## 🚀 QUICKEST DEPLOY (Use This!)

After making changes in Cursor, run this **one command**:

```bash
git add . && git commit -m "Your commit message" && git push origin main
```

**That's it!** GitHub Actions will automatically:
- ✅ Run ESLint checks
- ✅ Build your project
- ✅ Report any errors

Check results at: https://github.com/jdukenorris/TradeJournal/actions

---

## 📦 What Happens After You Push

1. **You push code** → GitHub receives your commit
2. **GitHub Actions starts** → Runs the CI/CD pipeline (see `.github/workflows/ci.yml`)
3. **Automated checks run:**
   - Installs dependencies
   - Runs `npm run lint`
   - Runs `npm run build`
4. **You get feedback:**
   - ✅ Green checkmark = All good!
   - ❌ Red X = Fix the errors

---

## Quick Deploy Command

```bash
git add . && git commit -m "Your commit message" && git push origin main
```

---

## Standard Deployment Workflow

### 1. Before Starting Work
Pull the latest code to ensure you're up to date:
```bash
cd "/Users/john.duke-norris/Test Project"
git pull origin main
npm install
```

### 2. During Development
- Make your changes in Cursor
- Run the dev server to test: `npm run dev`
- Check for errors: `npm run lint`
- Optional: Test build: `npm run build`

### 3. Pre-Deployment Checklist
- [ ] All changes saved in Cursor
- [ ] Dev server stopped (or running in background is fine)
- [ ] Code linted: `npm run lint`
- [ ] No console errors
- [ ] Tested locally at http://localhost:3000

### 4. Deploy to GitHub

#### Step 1: Check Status
```bash
git status
```
Review what files have changed.

#### Step 2: Stage Changes
```bash
git add .
```
Or stage specific files:
```bash
git add src/app/page.tsx
```

#### Step 3: Commit with Message
```bash
git commit -m "Brief description of changes"
```

**Good commit message examples:**
- `Add trading dashboard layout`
- `Fix authentication bug`
- `Update home page styling`
- `Implement trade entry form`

#### Step 4: Push to GitHub
```bash
git push origin main
```

If prompted for credentials:
- Username: `jdukenorris`
- Password: Use your GitHub Personal Access Token (not account password)

### 5. Verify Deployment
- Visit: https://github.com/jdukenorris/TradeJournal
- Confirm your commit appears in the commit history
- Check that files are updated

---

## Quick Reference Commands

```bash
# Navigate to project
cd "/Users/john.duke-norris/Test Project"

# Pull latest changes
git pull origin main

# Check repository status
git status

# View commit history
git log --oneline

# Stage all changes
git add .

# Commit changes
git commit -m "Your message"

# Push to GitHub
git push origin main

# View configured remote
git remote -v

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard local changes (CAREFUL!)
git reset --hard HEAD
```

---

## Branch Strategy

### Current Setup
- **Main branch:** `main` (production-ready code)

### Optional: Feature Branches (for larger features)
```bash
# Create and switch to new feature branch
git checkout -b feature/new-dashboard

# Work on feature...

# Push feature branch
git push origin feature/new-dashboard

# Switch back to main
git checkout main

# Merge feature (after testing)
git merge feature/new-dashboard

# Delete feature branch
git branch -d feature/new-dashboard
```

---

## Troubleshooting

### Authentication Failed
- Ensure you're using a Personal Access Token, not your GitHub password
- Create token at: https://github.com/settings/tokens
- Scope required: `repo`

### Push Rejected (Out of Date)
```bash
git pull origin main
# Resolve any conflicts
git push origin main
```

### Undo Staging
```bash
git reset HEAD <file>
```

### View Differences Before Commit
```bash
git diff
```

### Check Remote Configuration
```bash
git remote -v
# Should show: https://github.com/jdukenorris/TradeJournal.git
```

---

## NPM Script Shortcuts

Add these to `package.json` under `"scripts"` for easier deployment:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "predeploy": "npm run lint && npm run build",
  "deploy": "git add . && git status"
}
```

Then run:
```bash
npm run predeploy  # Check everything before deploying
npm run deploy     # Quick staging
```

---

## Best Practices

1. **Commit Often:** Small, focused commits are easier to track
2. **Meaningful Messages:** Write clear commit messages
3. **Pull Before Push:** Always pull before starting work
4. **Test Locally:** Test changes before deploying
5. **Review Status:** Always `git status` before committing
6. **Backup Important Work:** Push to GitHub regularly

---

## Daily Workflow Summary

```bash
# Morning: Start work
cd "/Users/john.duke-norris/Test Project"
git pull origin main
npm install
npm run dev

# During day: Code in Cursor...

# End of session: Deploy
npm run lint
git add .
git commit -m "Describe today's work"
git push origin main
```

---

**Last Updated:** $(date)  
**Repository:** https://github.com/jdukenorris/TradeJournal

