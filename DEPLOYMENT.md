# Deployment Guide - Pet Passport System

This guide walks you through deploying the Pet Passport System to Vercel.

## Prerequisites

- A GitHub account
- A Vercel account (free tier available at https://vercel.com)
- A Neon PostgreSQL database (free tier available at https://neon.tech)

## Step 1: Prepare Your Code

### 1.1 Initialize Git Repository (if not already done)

```bash
git init
git add .
git commit -m "Initial commit - Pet Passport System"
```

### 1.2 Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository (e.g., "pet-passport-system")
3. **Don't** initialize with README (we already have one)

### 1.3 Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/pet-passport-system.git
git branch -M main
git push -u origin main
```

## Step 2: Set Up Neon Database

### 2.1 Create Database

1. Go to https://neon.tech
2. Sign up or login
3. Create a new project
4. Name it "pet-passport-db" (or your preference)
5. Select a region closest to your users

### 2.2 Get Connection String

1. In your Neon project dashboard, click "Connection Details"
2. Copy the connection string
3. It looks like: `postgresql://user:password@host.neon.tech/dbname?sslmode=require`
4. Save this for later

### 2.3 Push Database Schema

From your local machine (with Neon connection string in `.env.local`):

```bash
npm run db:push
```

This creates all necessary tables in your Neon database.

## Step 3: Deploy to Vercel

### 3.1 Connect to Vercel

1. Go to https://vercel.com
2. Sign up or login (you can use your GitHub account)
3. Click "New Project"
4. Import your GitHub repository

### 3.2 Configure Project

#### Project Settings:
- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `./` (leave as default)
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)

#### Environment Variables:

Click "Environment Variables" and add the following:

**DATABASE_URL**
```
postgresql://user:password@host.neon.tech/dbname?sslmode=require
```
*(Your Neon connection string)*

**NEXTAUTH_SECRET**
```
your_generated_secret_here
```
*(Generate with: `openssl rand -base64 32`)*

**NEXTAUTH_URL**
```
https://your-project-name.vercel.app
```
*(Will be your Vercel URL - you can update this after first deployment)*

**ADMIN_USERNAME**
```
syndicate_admin
```
*(Your admin username)*

**ADMIN_PASSWORD**
```
YourSecurePassword123
```
*(Your admin password - use a strong password!)*

### 3.3 Deploy

1. Click "Deploy"
2. Wait for the build to complete (2-3 minutes)
3. Once deployed, you'll get a URL like `https://your-project-name.vercel.app`

### 3.4 Update NEXTAUTH_URL

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Update `NEXTAUTH_URL` with your actual Vercel URL
4. Redeploy the application

## Step 4: Verify Deployment

### 4.1 Test Public Access

1. Open your Vercel URL
2. You should see the landing page
3. Language switcher should work

### 4.2 Test Admin Login

1. Click "Login"
2. Enter your `ADMIN_USERNAME` and `ADMIN_PASSWORD`
3. You should be redirected to the Syndicate dashboard

### 4.3 Test Clinic Creation

1. Go to "Clinics" in the Syndicate dashboard
2. Create a test clinic
3. Note the generated credentials

### 4.4 Test QR Generation

1. Go to "QR Generator"
2. Generate a few QR codes
3. Download the PDF

## Step 5: Custom Domain (Optional)

### 5.1 Add Domain in Vercel

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain (e.g., `petpassport.com`)
4. Follow Vercel's instructions to configure DNS

### 5.2 Update Environment Variables

1. Update `NEXTAUTH_URL` to use your custom domain
2. Redeploy

## Production Checklist

Before going live, ensure:

- [ ] Database is properly configured in Neon
- [ ] All environment variables are set in Vercel
- [ ] Admin credentials are strong and secure
- [ ] QR codes are generated and printed
- [ ] At least one test clinic account is created
- [ ] Test pet profile is created successfully
- [ ] Public view works correctly
- [ ] All three languages (EN/AR/CKB) are functioning
- [ ] Mobile responsive design is working

## Monitoring & Maintenance

### Vercel Dashboard

Monitor your application:
- **Analytics**: View page visits and performance
- **Logs**: Check for errors in real-time
- **Deployments**: View deployment history

### Neon Dashboard

Monitor your database:
- **Usage**: Check database size and connection count
- **Queries**: View slow queries
- **Backups**: Neon automatically backs up your data

## Scaling Considerations

### Free Tier Limits

**Vercel Free Tier:**
- 100 GB bandwidth per month
- Unlimited requests
- Automatic SSL

**Neon Free Tier:**
- 0.5 GB storage
- 1 project
- Automatically paused after inactivity

### When to Upgrade

Consider upgrading when:
- You have > 100 clinics
- You're approaching storage limits
- You need better performance
- You need multiple environments (staging/production)

## Troubleshooting

### Build Failures

**Issue**: Build fails in Vercel

**Solutions**:
1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Test build locally: `npm run build`
4. Check TypeScript errors: `npm run lint`

### Database Connection Issues

**Issue**: Can't connect to Neon database

**Solutions**:
1. Verify `DATABASE_URL` is correct
2. Check Neon project is active
3. Ensure connection string includes `?sslmode=require`
4. Check Neon dashboard for any issues

### Authentication Issues

**Issue**: Can't login or session errors

**Solutions**:
1. Verify `NEXTAUTH_SECRET` is set
2. Check `NEXTAUTH_URL` matches your domain
3. Clear browser cookies and try again
4. Check Vercel logs for auth errors

### Missing Environment Variables

**Issue**: App crashes on certain pages

**Solutions**:
1. Go to Vercel project settings
2. Check all environment variables are set
3. Add any missing variables
4. Redeploy the application

## Updates & Redeployment

### Pushing Updates

```bash
# Make your changes
git add .
git commit -m "Description of changes"
git push origin main
```

Vercel automatically deploys when you push to main branch.

### Manual Redeploy

1. Go to Vercel dashboard
2. Select your project
3. Click "Deployments"
4. Click "Redeploy" on any previous deployment

## Security Best Practices

1. **Strong Admin Password**: Use a password manager to generate strong passwords
2. **Environment Variables**: Never commit `.env.local` to Git
3. **HTTPS Only**: Vercel provides SSL automatically
4. **Regular Updates**: Keep dependencies updated
5. **Database Backups**: Enable Neon automatic backups (paid plan)

## Support Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Neon Documentation**: https://neon.tech/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **NextAuth Documentation**: https://next-auth.js.org

## Cost Estimates

### Free Tier (Good for up to 50 clinics)
- Vercel: $0/month
- Neon: $0/month
- **Total: $0/month**

### Small Scale (50-500 clinics)
- Vercel Pro: $20/month
- Neon Launch: $19/month
- **Total: $39/month**

### Medium Scale (500+ clinics)
- Vercel Pro: $20/month
- Neon Scale: $69+/month
- **Total: $89+/month**

---

## Quick Deploy Button

You can also deploy with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/pet-passport-system)

Remember to set environment variables after deployment!

