# Deployment Checklist

## Environment Variables
Ensure these variables are set in your deployment environment:

### Database
- [ ] POSTGRES_PRISMA_URL
- [ ] POSTGRES_URL_NON_POOLING

### Cloudinary
- [ ] NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
- [ ] NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
- [ ] CLOUDINARY_API_KEY
- [ ] CLOUDINARY_API_SECRET

## Pre-deployment Steps
1. Run build locally to check for errors:
   ```bash
   npm run build
   ```
2. Check .gitignore includes all sensitive files
3. Verify all environment variables are set in deployment platform
4. Run database migrations

## Post-deployment Steps
1. Verify image upload functionality
2. Check database connections
3. Test CRUD operations 