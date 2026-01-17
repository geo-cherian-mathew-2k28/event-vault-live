# EventVault Deployment Instructions

Your application is ready for production. Below are the steps to deploy it properly.

## 1. Prerequisites (Setup Git & GitHub)

You need to push your code to a remote repository (GitHub, GitLab, or Bitbucket) for Vercel to allow continuous deployment, although Vercel CLI can also deploy directly.

**Step 1. Initialize & Commit**
```bash
# 1. Initialize Git
git init

# 2. Add all files
git add .

# 3. Commit
git commit -m "Initial commit for production"
```

**Step 2. Push to GitHub (Standard Approach)**
1.  Go to **GitHub.com** and create a **New Repository** (e.g., named `event-vault`).
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

## 2. Deploy to Vercel (Recommended)

Vercel is the most professional hosting platform for Next.js/Vite apps.

1.  **Go to [vercel.com](https://vercel.com) and Sign Up/Login.**
2.  **Install Vercel CLI** (Optional but easier):
    ```bash
    npm i -g vercel
    ```
3.  **Run Deploy Command**:
    In your project terminal (`d:\event`), run:
    ```bash
    vercel
    ```
4.  **Follow the prompts**:
    *   Set up and deploy? **Y**
    *   Which scope? **(Select your account)**
    *   Link to existing project? **N**
    *   Project name? **event-vault**
    *   Directory? **./**
    *   Auto-detect settings? **Y** (It will detect Vite)

5.  **Environment Variables**:
    *   Go to your new Vercel Dashboard for the project.
    *   Go to **Settings > Environment Variables**.
    *   Add your Supabase keys from your `.env` file:
        *   `VITE_SUPABASE_URL`
        *   `VITE_SUPABASE_ANON_KEY`
    *   **Redeploy** (Go to Deployments -> Redeploy) for these to take effect.

## 3. Configure Supabase for Production (CRITICAL)

For "Login with Email" to work for *everyone* on the public internet:

1.  Go to your **Supabase Dashboard**.
2.  Navigate to **Authentication > URL Configuration**.
3.  **Site URL**: Change this from `localhost` to your new Vercel domain (e.g., `https://event-vault.vercel.app`).
4.  **Redirect URLs**: Add `https://event-vault.vercel.app/**`.
5.  **Save**.

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
