# Deployment Guide for Vercel

## Prerequisites
- Vercel account (free tier available)
- GitHub repository (recommended)

## Quick Deploy

### Option 1: Deploy via Vercel CLI

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
vercel
```

4. **Deploy to Production**
```bash
vercel --prod
```

### Option 2: Deploy via GitHub

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Import to Vercel**
- Go to [vercel.com/new](https://vercel.com/new)
- Import your GitHub repository
- Vercel will auto-detect SvelteKit
- Click "Deploy"

## Configuration

### Environment Variables
If you need environment variables:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add your variables (refer to `.env.example`)

### Build Settings
The following are configured automatically:
- **Framework**: SvelteKit
- **Build Command**: `npm run build`
- **Output Directory**: `.svelte-kit`
- **Install Command**: `npm install`
- **Node Version**: 20.x

### Function Configuration
- **Max Duration**: 60 seconds (for PDF processing)
- **Memory**: 3008 MB (for heavy PDF operations)
- **Region**: Singapore (sin1) for better Asia performance

## Important Notes

### File Upload Limits
Vercel has the following limits:
- **Free tier**: 4.5 MB request body size
- **Pro tier**: 4.5 MB request body size
- **Enterprise**: Custom limits

For large PDF files, consider:
1. Upgrading to Pro/Enterprise
2. Using external storage (AWS S3, Cloudflare R2)
3. Implementing chunked uploads

### Fonts
Thai fonts (Sarabun) are included in `static/fonts/` and will be deployed automatically.

### Static Files
All files in `static/` directory are served automatically:
- `/logo.png`
- `/robots.txt`
- `/fonts/Sarabun-Regular.ttf`
- `/fonts/Sarabun-Bold.ttf`

## Post-Deployment

### Custom Domain
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

### Monitoring
- View logs in Vercel Dashboard
- Monitor function execution times
- Check for errors in Runtime Logs

### Performance Tips
1. Enable Edge Caching for static assets
2. Use Image Optimization for images
3. Monitor function execution times
4. Consider splitting large PDF operations

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
vercel --force
```

### Function Timeout
- Increase `maxDuration` in `vercel.json` (up to 60s on Hobby)
- Optimize PDF processing code
- Consider background jobs for large files

### Memory Issues
- Increase `memory` in `vercel.json`
- Optimize memory usage in PDF processing
- Use streaming where possible

## Testing Locally

Test the production build locally:
```bash
npm run build
npm run preview
```

## Deployment Checklist

- [x] Installed `@sveltejs/adapter-vercel`
- [x] Updated `svelte.config.js`
- [x] Created `vercel.json` with configuration
- [x] Created `.vercelignore`
- [x] Created `.env.example`
- [ ] Push code to GitHub
- [ ] Connect to Vercel
- [ ] Configure environment variables (if needed)
- [ ] Deploy!

## Useful Commands

```bash
# Deploy preview
vercel

# Deploy production
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls

# Remove deployment
vercel rm <deployment-url>
```

## Links
- [Vercel Dashboard](https://vercel.com/dashboard)
- [SvelteKit Adapter Vercel](https://kit.svelte.dev/docs/adapter-vercel)
- [Vercel Documentation](https://vercel.com/docs)

---

Happy deploying! 🚀
