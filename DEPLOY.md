# JSS Public Deployment Guide

Execute the following commands in your terminal to publish **Jasa Suruh Kalirejo (JSS)** to GitHub and Vercel:

1. Initialize Git repository
```bash
git init
```

2. Set default branch to main
```bash
git branch -M main
```

3. Stage all prepared files
```bash
git add .
```

4. Create production commit
```bash
git commit -m "feat: Initial production release of Jasa Suruh Kalirejo (JSS)"
```

5. Connect your remote GitHub repository (Replace URL with your own GitHub repository link)
```bash
git remote add origin https://github.com/YOUR_USERNAME/web-jss.git
```

6. Push code to GitHub
```bash
git push -u origin main
```

7. Publish to Vercel (Choose Option A or Option B):

**Option A (Vercel Dashboard - Recommended)**:
- Go to https://vercel.com/new
- Select your `web-jss` GitHub repository
- Click **Deploy**

**Option B (Vercel CLI)**:
```bash
npx vercel
```
- Press `Y` to confirm deployment and select your free `*.vercel.app` domain.
