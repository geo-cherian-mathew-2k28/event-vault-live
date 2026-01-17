# EventVault Deployment Instructions

Your application is ready for production. Below are the steps to deploy it properly.

## 1. Prerequisites (Setup Git & GitHub)

You need to push your code to a remote repository (GitHub, GitLab, or Bitbucket) for Vercel to allow continuous deployment, although Vercel CLI can also deploy directly.

**Step 1. Initialize & Commit (Important Update)**
We have updated `vercel.json` one last time to be explicit about the framework.
Please run these check-in commands immediately:

```bash
# 1. Add all new files
git add .

# 2. Commit
git commit -m "Fix routing and vercel config"

# 3. Push to deploy
git push origin main
```

**Step 2. Push to GitHub (Standard Approach)**
1.  Go to **GitHub.com** and create a **New Repository**.
    *   **Repository Name**: `event-vault`
    *   **Visibility**: **Private** (Recommended for security)
2.  **Do not** add a README or .gitignore (you already have them).
3.  Copy the URL (e.g., `https://github.com/YourUsername/event-vault.git`).
4.  Run these commands in your VS Code terminal:

```bash
# Link your local folder to GitHub
git remote add origin https://github.com/YOUR_USERNAME/event-vault.git

# Rename branch to main (standard)
git branch -M main

# Push your code
git push -u origin main
```

## 2. Deploy via Vercel Website (No CLI)

This is the easiest way to deploy.

1.  **Go to [vercel.com/new](https://vercel.com/new)** and Log In.
2.  **Import Git Repository**:
    *   You should see your `event-vault` repository in the list (if you connected GitHub).
    *   Click **Import**.
3.  **Configure Project**:
    *   **Framework Preset**: It should auto-detect **Vite**.
    *   **Root Directory**: Leave as `./`.
4.  **Environment Variables (CRITICAL)**:
    *   Click to expand the **Environment Variables** section.
    *   Copy these values from your local `.env` file:
        *   **Name**: `VITE_SUPABASE_URL` | **Value**: `https://bxuzhfcnzuonnwgmgrnv.supabase.co`
        *   **Name**: `VITE_SUPABASE_ANON_KEY` | **Value**: (your long key starting with eyJ...)
    *   *Tip: You can Copy/Paste lines from your .env file usually.*
5.  **Click Deploy**.
    *   Wait ~1 minute. You will get a production URL (e.g., `https://event-vault.vercel.app`).

## 3. Configure Supabase for Production (CRITICAL)

Now that you have your **Vercel URL** (e.g., `https://event-vault.vercel.app`), you must tell Supabase it is safe.

1.  Go to your **Supabase Dashboard**.
2.  Navigate to **Authentication > URL Configuration**.
3.  **Site URL**: Change this from `localhost` to your new Vercel URL.
4.  **Redirect URLs**: Add `https://event-vault.vercel.app/**` (ensure you add the `/**` at the end).
5.  **Save**.

**Done!** Your app is now live and secure.

## 4. How "Public Access" Works Now

*   **Sign Up**: Anyone can go to `/register`.
    *   If they use an email that exists, they get a clear error: *"This email is already connected to an account."*
    *   If they are new, they are **Automatically Confirmed** (thanks to the trigger we added). They can login instantly.
*   **Login**: Anyone with a valid account can login.

## 5. Deployment Commands (Cheat Sheet)

When you make future changes:

```bash
# 1. Save changes in git
git add .
git commit -m "Update message"

# 2. Deploy to Production
vercel --prod
```
