# Netlify Deployment Guide - Pet Passport System

This guide will help you deploy your Pet Passport System to Netlify.

## Prerequisites

- GitHub repository (✅ Already done: https://github.com/Alannjaf/pet-passport-system)
- Netlify account (free - sign up at https://netlify.com)
- Neon database (✅ Already configured)

## Step 1: Prepare for Deployment

### 1.1 Install Netlify CLI (Optional)

```bash
npm install -D @netlify/plugin-nextjs
```

This ensures the Next.js runtime plugin is available.

### 1.2 Commit Configuration

The `netlify.toml` file has been created. Let's commit it:

```bash
git add netlify.toml NETLIFY_DEPLOYMENT.md
git commit -m "Add Netlify deployment configuration"
git push
```

## Step 2: Deploy to Netlify

### Option A: Deploy via Netlify Dashboard (Recommended)

1. **Go to Netlify Dashboard**
   - Visit https://app.netlify.com
   - Sign up or login (you can use your GitHub account)

2. **Import Your Repository**
   - Click "Add new site" → "Import an existing project"
   - Choose "Deploy with GitHub"
   - Authorize Netlify to access your GitHub
   - Select `Alannjaf/pet-passport-system`

3. **Configure Build Settings**
   
   Netlify should auto-detect Next.js. Verify these settings:
   
   - **Branch to deploy**: `main`
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Functions directory**: (leave empty)

4. **Add Environment Variables**
   
   Click "Advanced settings" → "New variable" and add:

   ```
   DATABASE_URL=your_neon_connection_string
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=https://your-site-name.netlify.app
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your_secure_password
   ```

   ⚠️ **Important**: The `NEXTAUTH_URL` will be your Netlify URL. You can update it after first deployment.

5. **Deploy**
   - Click "Deploy site"
   - Wait 2-3 minutes for build to complete
   - Your site will be live at `https://random-name-123456.netlify.app`

### Option B: Deploy via Netlify CLI

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize and deploy
netlify init

# Follow the prompts:
# - Create & configure a new site
# - Choose your team
# - Site name: pet-passport-system (or your preference)
# - Build command: npm run build
# - Publish directory: .next

# Deploy
netlify deploy --prod
```

## Step 3: Update NEXTAUTH_URL

After your first deployment:

1. Note your Netlify URL (e.g., `https://pet-passport-system.netlify.app`)
2. Go to **Site settings** → **Environment variables**
3. Update `NEXTAUTH_URL` to your actual Netlify URL
4. Trigger a new deployment:
   - Go to **Deploys** tab
   - Click "Trigger deploy" → "Deploy site"

## Step 4: Custom Domain (Optional)

### Add Your Own Domain

1. Go to **Site settings** → **Domain management**
2. Click "Add custom domain"
3. Enter your domain (e.g., `petpassport.com`)
4. Follow DNS configuration instructions
5. Netlify will automatically provision SSL certificate

### Update Environment Variables

After adding custom domain:
1. Update `NEXTAUTH_URL` to use your custom domain
2. Redeploy the site

## Step 5: Verify Deployment

### Test Your Deployed App

1. **Open your Netlify URL** (e.g., `https://pet-passport-system.netlify.app`)
2. **Test Login**
   - Click "Login"
   - Enter your `ADMIN_USERNAME` and `ADMIN_PASSWORD`
   - Should redirect to Syndicate Dashboard
3. **Test All Features**
   - Create clinic account
   - Generate QR codes
   - Create pet profile
   - View as public

## Netlify-Specific Features

### Automatic Deployments

- Every push to `main` branch triggers automatic deployment
- Preview deployments for pull requests
- Instant rollback to previous versions

### Environment Variables

Manage in: **Site settings** → **Environment variables**

Required variables:
- `DATABASE_URL` - Your Neon connection string
- `NEXTAUTH_SECRET` - Random secret (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Your Netlify URL
- `ADMIN_USERNAME` - Admin login username
- `ADMIN_PASSWORD` - Admin login password

### Build & Deploy Settings

Location: **Site settings** → **Build & deploy**

- **Branch**: main
- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node version**: 18.x (set in netlify.toml)

## Troubleshooting

### Build Fails

**Issue**: Build fails with module errors

**Solution**:
```bash
# Ensure all dependencies are in package.json
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

### NextAuth Errors

**Issue**: Login fails or session errors

**Solution**:
1. Verify `NEXTAUTH_SECRET` is set
2. Verify `NEXTAUTH_URL` matches your Netlify URL exactly
3. Check that URL uses `https://` (not `http://`)

### Database Connection Issues

**Issue**: Can't connect to Neon database

**Solution**:
1. Verify `DATABASE_URL` is correct in Netlify environment variables
2. Check Neon project is active (not paused)
3. Ensure connection string includes `?sslmode=require`

### Functions/API Routes Not Working

**Issue**: API routes return 404

**Solution**:
1. Ensure `@netlify/plugin-nextjs` is installed
2. Check `netlify.toml` is configured correctly
3. Redeploy the site

## Performance Optimization

### Enable Netlify Features

1. **Asset Optimization**
   - Site settings → Build & deploy → Post processing
   - Enable: Bundle CSS, Minify CSS, Minify JS

2. **Edge Functions** (Future)
   - Can be used for faster API responses
   - Deploy functions closer to users

3. **Analytics** (Optional)
   - Enable Netlify Analytics
   - Monitor traffic and performance

## Monitoring

### Check Deployment Status

1. **Deploys Tab**: View build logs and deployment history
2. **Functions Tab**: Monitor API route performance
3. **Analytics Tab**: Track site usage (if enabled)

### View Logs

```bash
# Real-time logs via CLI
netlify logs:function

# Or view in dashboard
# Site → Functions → Select function → View logs
```

## Costs

### Free Tier Includes:
- 300 build minutes/month
- 100 GB bandwidth/month
- Automatic HTTPS
- Continuous deployment
- Form handling

### When to Upgrade:
- High traffic (>100GB/month)
- Need more build minutes
- Want advanced features (background functions, etc.)

## Useful Commands

```bash
# View site status
netlify status

# Open deployed site
netlify open:site

# Open Netlify dashboard
netlify open:admin

# View environment variables
netlify env:list

# Set environment variable
netlify env:set VARIABLE_NAME value

# Trigger deployment
netlify deploy --prod

# View logs
netlify logs
```

## Quick Deploy Checklist

- [ ] Repository pushed to GitHub
- [ ] `netlify.toml` committed
- [ ] Netlify account created
- [ ] Site imported from GitHub
- [ ] Environment variables set
- [ ] First deployment successful
- [ ] `NEXTAUTH_URL` updated with actual URL
- [ ] Site redeployed
- [ ] Login tested
- [ ] All features working

## Next Steps

After successful deployment:

1. **Share Your App**: `https://your-site.netlify.app`
2. **Monitor Performance**: Check Netlify analytics
3. **Set Up Custom Domain**: For professional look
4. **Enable Form Notifications**: For contact forms (future)

---

## Support Resources

- **Netlify Docs**: https://docs.netlify.com
- **Next.js on Netlify**: https://docs.netlify.com/integrations/frameworks/next-js/
- **Netlify Community**: https://answers.netlify.com

---

**Your app is ready to deploy! Follow the steps above and you'll be live in minutes.** 🚀

