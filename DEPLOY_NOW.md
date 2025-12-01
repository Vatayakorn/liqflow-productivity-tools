# 🚀 Quick Deploy to Vercel

## ✅ Setup Complete!

Your project is now ready to deploy to Vercel. All necessary configurations have been added:

- ✅ `@sveltejs/adapter-vercel` installed
- ✅ `svelte.config.js` configured for Vercel
- ✅ `vercel.json` created with optimization settings
- ✅ `.vercelignore` created
- ✅ `.env.example` template added
- ✅ Build tested successfully

## 🎯 Deploy Now (3 Options)

### Option 1: GitHub + Vercel (Recommended) ⭐

**Step 1: Push to GitHub**
```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Ready for Vercel deployment"

# Create a new repository on GitHub, then:
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

**Step 2: Deploy on Vercel**
1. Go to https://vercel.com/new
2. Sign in with GitHub
3. Click "Import Project"
4. Select your repository
5. Click "Deploy" (Vercel auto-detects SvelteKit!)

**That's it! Your site will be live in ~1 minute** 🎉

### Option 2: Vercel CLI (Fast)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy preview
vercel

# Deploy to production
vercel --prod
```

### Option 3: Drag & Drop

1. Run `npm run build` (already done ✅)
2. Go to https://vercel.com/new
3. Drag and drop the `.svelte-kit/output` folder

## ⚙️ Configuration Details

### Adapter Settings
```javascript
// svelte.config.js
adapter: adapter({
  runtime: 'nodejs20.x',        // Node.js 20
  regions: ['sin1'],            // Singapore (best for Asia)
  maxDuration: 60              // 60 seconds max for PDF processing
})
```

### Function Settings
```json
// vercel.json
{
  "functions": {
    "api/**/*.js": {
      "maxDuration": 60,       // Extended timeout for PDF operations
      "memory": 3008           // 3GB RAM for heavy processing
    }
  }
}
```

## 📊 Build Output
```
✓ Client build: 2.7 MB (gzipped: ~500 KB)
✓ Server build: 126 KB
✓ PDF.js worker: 1.96 MB
✓ Total: ~4.8 MB

Build time: ~25 seconds
```

## ⚠️ Important Notes

### File Upload Limits
Vercel has request body size limits:
- **Hobby (Free)**: 4.5 MB per request
- **Pro**: 4.5 MB per request  
- **Enterprise**: Custom limits

**Recommendation**: For large PDFs (>4 MB), consider:
1. Client-side chunked uploads
2. External storage (AWS S3, Cloudflare R2)
3. Upgrade to Pro/Enterprise with custom limits

### Canvas Dependencies
The build warnings about `@napi-rs/canvas` are normal - Vercel will use the Linux version automatically. No action needed.

### Environment Variables
If you need any (API keys, secrets):
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add variables (use `.env.example` as reference)
3. Redeploy for changes to take effect

## 🌐 After Deployment

### Custom Domain
1. Project Settings → Domains
2. Add your domain
3. Update DNS records as shown
4. Wait for SSL certificate (automatic)

### Performance Monitoring
- View logs: Project → Deployments → [Latest] → Runtime Logs
- Check analytics: Project → Analytics
- Monitor function execution: Project → Functions

### Updates
Push to GitHub = Auto-deploy! Every push triggers a new deployment.

## 🔧 Troubleshooting

### Build Fails
```bash
# Clear cache locally
rm -rf .svelte-kit node_modules
npm install
npm run build

# Or on Vercel, trigger rebuild with:
vercel --force
```

### Function Timeout (>60s)
- Optimize PDF processing code
- Split large operations into smaller chunks
- Consider upgrading to Pro for 300s max duration

### Memory Issues
- Increase `memory` in `vercel.json` (max 3008 MB on Hobby)
- Optimize memory usage in PDF processing
- Use streaming for large files

### Canvas/PDF.js Issues
These packages work on Vercel! The build warnings are expected - Vercel uses the correct platform binaries.

## 📝 Deployment Checklist

Before deploying, verify:

- [ ] All features work locally (`npm run dev`)
- [ ] Build succeeds (`npm run build`)
- [ ] Preview works (`npm run preview`)
- [ ] Static assets in `static/` folder
- [ ] Fonts included for Thai support
- [ ] No sensitive data in code
- [ ] `.env` not committed (use `.env.example`)
- [ ] `package.json` has correct dependencies
- [ ] Git repository up to date

## 🎉 Success Metrics

After deployment, you should see:
- ✅ Build completes in ~30-60 seconds
- ✅ All routes accessible
- ✅ PDF tools working
- ✅ Search functionality active
- ✅ Static assets loading
- ✅ Thai fonts rendering correctly

## 📚 Resources

- [Vercel Dashboard](https://vercel.com/dashboard)
- [SvelteKit on Vercel](https://kit.svelte.dev/docs/adapter-vercel)
- [Vercel Limits](https://vercel.com/docs/concepts/limits/overview)
- [Vercel Functions](https://vercel.com/docs/functions)

---

## 🚀 Ready to Deploy!

Choose your method above and deploy in minutes. Your PDF tools will be live at:
`https://your-project-name.vercel.app`

Good luck! 🎉
