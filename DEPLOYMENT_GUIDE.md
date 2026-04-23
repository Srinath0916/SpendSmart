# SpendSmart Deployment Guide

## ✅ Pre-Deployment Cleanup Complete

The following unnecessary files have been removed:
- Test CSV files (my_transactions.csv, test_transactions.csv)
- Sample data files (backend/sample_transactions.csv)
- Unused code (backend/core/reconciliation.py)
- Setup scripts (backend/setup.sh)
- Temporary guides (PDF_UPLOAD_GUIDE.md)

## 🚀 Deployment Steps

### Backend (Render)

Since you already deployed to Render, you need to **trigger a redeploy** to get the latest changes:

#### Option 1: Push to GitHub (Recommended)
```bash
# Commit all changes
git add .
git commit -m "Complete SpendSmart with PDF upload and password change features"
git push origin main
```

Render will automatically detect the push and redeploy your backend.

#### Option 2: Manual Redeploy from Render Dashboard
1. Go to https://dashboard.render.com
2. Find your SpendSmart backend service
3. Click "Manual Deploy" → "Deploy latest commit"

#### Important: Environment Variables on Render
Make sure these are set in your Render dashboard:
- `DJANGO_SECRET_KEY` - Your Django secret key
- `DEBUG` - Set to `False` for production
- `ALLOWED_HOSTS` - Your Render URL (e.g., `spendsmart-backend.onrender.com`)
- `CORS_ALLOWED_ORIGINS` - Your Vercel frontend URL

### Frontend (Vercel)

Since you already deployed to Vercel, you need to **update the environment variable** and redeploy:

#### Step 1: Update Environment Variable
1. Go to https://vercel.com/dashboard
2. Select your SpendSmart project
3. Go to Settings → Environment Variables
4. Update `VITE_API_BASE_URL` to your Render backend URL:
   ```
   VITE_API_BASE_URL=https://your-backend-url.onrender.com/api
   ```
   (Replace with your actual Render URL)

#### Step 2: Redeploy
```bash
# Commit all changes
git add .
git commit -m "Complete SpendSmart with PDF upload and password change features"
git push origin main
```

Vercel will automatically detect the push and redeploy your frontend.

#### Alternative: Manual Redeploy from Vercel Dashboard
1. Go to your Vercel dashboard
2. Find your SpendSmart project
3. Go to Deployments tab
4. Click "Redeploy" on the latest deployment

## 🔍 Verify Deployment

### Backend Health Check
Visit: `https://your-backend-url.onrender.com/api/health/`

Should return:
```json
{
  "status": "healthy",
  "message": "SpendSmart API is running"
}
```

### Frontend Check
Visit: `https://your-frontend-url.vercel.app`

Should show the SpendSmart login page.

## 🎯 New Features to Test After Deployment

1. **PDF Upload with Password**
   - Go to Statement Import
   - Upload a PhonePe PDF
   - Enter password if protected
   - Verify transactions are extracted

2. **Change Password**
   - Go to Settings
   - Click "Change Password"
   - Enter current and new passwords
   - Verify password changes successfully

3. **Uncategorized Tracking**
   - Check Dashboard pie chart includes "Uncategorized"
   - Check Budgets page shows uncategorized spending
   - Verify all numbers match across pages

4. **Events/Trips**
   - Create an event with date range
   - Verify transactions are pulled for that period
   - Check budget vs spent calculation

## 📝 Post-Deployment Checklist

- [ ] Backend deployed and health check passes
- [ ] Frontend deployed and loads correctly
- [ ] Login/Register works
- [ ] Dashboard shows data
- [ ] Transactions page loads
- [ ] CSV upload works
- [ ] PDF upload works (with password)
- [ ] Change password works
- [ ] Budgets page displays correctly
- [ ] Events/Trips feature works
- [ ] All numbers match across pages

## 🐛 Troubleshooting

### "Failed to fetch" errors
- Check CORS settings on backend
- Verify `VITE_API_BASE_URL` points to correct backend URL
- Check backend is running (visit health check endpoint)

### PDF upload not working
- Verify `pdfplumber` is in requirements.txt (✅ already added)
- Check backend logs on Render for errors
- Ensure PDF format is supported (PhonePe format)

### Changes not showing
- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Check if deployment completed successfully
- Verify correct branch is deployed

## 📊 What's New in This Deployment

### Backend Changes
- ✅ PDF parser with PhonePe format support
- ✅ Password-protected PDF handling
- ✅ Change password endpoint
- ✅ Improved error messages
- ✅ Removed unused code

### Frontend Changes
- ✅ PDF upload UI with password input
- ✅ Change password modal in Settings
- ✅ Uncategorized expense tracking
- ✅ Events/Trips date range budgeting
- ✅ Analytics with time filters
- ✅ Delete transaction functionality
- ✅ Improved UX across all pages

## 🎉 You're Done!

Once both deployments complete (usually 2-5 minutes), your live site will have all the new features!

Visit your deployed URLs:
- Frontend: https://your-app.vercel.app
- Backend: https://your-api.onrender.com
