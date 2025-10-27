# FocusField Deployment Guide

## Deploy to Vercel (Recommended)

### 1. Prepare Your Repository
```bash
git add .
git commit -m "Initial FocusField setup"
git push origin main
```

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
5. Click "Deploy"

### 3. Configure Domain (Optional)
1. Go to your project settings in Vercel
2. Add your custom domain
3. Update Supabase auth settings with your new domain

## Deploy to Netlify

### 1. Build Settings
- Build command: `npm run build`
- Publish directory: `.next`

### 2. Environment Variables
Add the same environment variables as Vercel

## Deploy to Railway

### 1. Connect Repository
1. Go to [railway.app](https://railway.app)
2. Create new project from GitHub repo

### 2. Configure
- Add environment variables
- Railway will auto-detect Next.js and configure build settings

## Post-Deployment Checklist

### 1. Update Supabase Auth Settings
1. Go to Supabase Dashboard > Authentication > URL Configuration
2. Add your production URL to:
   - Site URL
   - Redirect URLs

### 2. Test Core Features
- [ ] User registration/login
- [ ] Task creation and completion
- [ ] Plant growth animation
- [ ] Focus mode timer
- [ ] Responsive design on mobile

### 3. Test Authentication
1. Test email/password signup and login
2. Verify user sessions persist correctly

### 4. Performance Optimization
- [ ] Enable Vercel Analytics (optional)
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Configure CDN for static assets

## Environment Variables Reference

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional (for analytics, monitoring, etc.)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
```

## Troubleshooting

### Common Issues

1. **Build Errors**
   - Check TypeScript errors: `npm run type-check`
   - Verify all dependencies are installed

2. **Authentication Issues**
   - Verify Supabase URL and keys
   - Check redirect URLs in Supabase settings

3. **Database Connection**
   - Ensure RLS policies are set up correctly
   - Verify table permissions

### Performance Tips

1. **Image Optimization**
   - Use Next.js Image component for better performance
   - Optimize plant SVG animations

2. **Code Splitting**
   - Lazy load heavy components (Focus Mode, etc.)
   - Use dynamic imports for better bundle size

3. **Caching**
   - Implement proper caching strategies
   - Use SWR or React Query for data fetching

## Monitoring

### Recommended Tools
- **Vercel Analytics**: Built-in performance monitoring
- **Sentry**: Error tracking and performance monitoring
- **LogRocket**: User session recording
- **Supabase Dashboard**: Database and auth monitoring

### Key Metrics to Track
- Page load times
- User engagement (task completion rates)
- Error rates
- Authentication success rates
- Mobile vs desktop usage

## Scaling Considerations

### Database
- Monitor Supabase usage and upgrade plan as needed
- Implement proper indexing for large datasets
- Consider read replicas for high traffic

### Frontend
- Use CDN for static assets
- Implement proper caching headers
- Consider server-side rendering for SEO

### Features to Add Later
- Push notifications for streak reminders
- Social features (friend gardens, leaderboards)
- Advanced analytics and insights
- Mobile app (React Native)
- Offline support with PWA