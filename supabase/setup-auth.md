# Supabase Authentication Setup Guide

This guide walks you through configuring authentication for Spooky AI Search.

## Authentication Methods

The application supports two authentication methods:

1. **Email/Password Authentication** - Traditional email-based signup and login
2. **Anonymous Authentication** - Allow users to search without creating an account

## Setup Steps

### 1. Enable Email/Password Authentication

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Email** in the list and click to configure
4. Enable the following options:
   - ✅ Enable Email provider
   - ✅ Confirm email
   - ✅ Secure email change
   - ✅ Secure password change

5. Configure email templates (optional but recommended):
   - Go to **Authentication** → **Email Templates**
   - Customize the following templates:
     - Confirmation email
     - Magic link email
     - Password reset email
     - Email change confirmation

### 2. Enable Anonymous Authentication

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Find **Anonymous** in the list
3. Toggle it to **Enabled**
4. Save changes

Anonymous users can:
- Perform searches without signing up
- Access cached results
- Later convert their anonymous account to a permanent account

### 3. Configure Email Settings (Production)

For production, you'll need to configure SMTP for sending emails:

1. Go to **Settings** → **Auth**
2. Scroll to **SMTP Settings**
3. Configure your SMTP provider:
   ```
   Host: smtp.your-provider.com
   Port: 587
   Username: your-smtp-username
   Password: your-smtp-password
   Sender email: noreply@yourdomain.com
   Sender name: Spooky AI Search
   ```

Popular SMTP providers:
- SendGrid
- AWS SES
- Mailgun
- Postmark
- Resend

### 4. Configure Site URL and Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**: `https://yourdomain.com` (or `http://localhost:5173` for development)
3. Add **Redirect URLs**:
   ```
   http://localhost:5173/**
   https://yourdomain.com/**
   https://your-netlify-site.netlify.app/**
   ```

### 5. Configure Password Requirements

1. Go to **Authentication** → **Policies**
2. Set password requirements:
   - Minimum length: 8 characters (recommended)
   - Require uppercase: Optional
   - Require lowercase: Optional
   - Require numbers: Optional
   - Require special characters: Optional

### 6. Rate Limiting (Security)

Configure rate limiting to prevent abuse:

1. Go to **Authentication** → **Rate Limits**
2. Set limits for:
   - Sign up: 10 requests per hour per IP
   - Sign in: 20 requests per hour per IP
   - Password reset: 5 requests per hour per IP
   - Email verification: 10 requests per hour per IP

### 7. Session Management

Configure session settings:

1. Go to **Authentication** → **Policies**
2. Configure:
   - JWT expiry: 3600 seconds (1 hour)
   - Refresh token expiry: 2592000 seconds (30 days)
   - Enable refresh token rotation: ✅

## Testing Authentication

### Test Email/Password Authentication

```typescript
import { supabase } from './lib/supabase';

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password-123',
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure-password-123',
});

// Sign out
await supabase.auth.signOut();
```

### Test Anonymous Authentication

```typescript
import { supabase } from './lib/supabase';

// Sign in anonymously
const { data, error } = await supabase.auth.signInAnonymously();

// Convert anonymous user to permanent account
const { data, error } = await supabase.auth.updateUser({
  email: 'user@example.com',
  password: 'secure-password-123',
});
```

## Security Best Practices

1. **Never expose service_role key** - Only use in backend/edge functions
2. **Use anon key in frontend** - It's safe to expose in client-side code
3. **Enable RLS on all tables** - Already configured in migration
4. **Use HTTPS in production** - Required for secure authentication
5. **Implement rate limiting** - Prevent brute force attacks
6. **Enable email confirmation** - Verify user email addresses
7. **Use strong password policies** - Enforce minimum requirements
8. **Monitor auth logs** - Check for suspicious activity

## Troubleshooting

### Email Confirmation Not Working

- Check SMTP settings are correct
- Verify sender email is verified with your SMTP provider
- Check spam folder
- Review email template configuration

### Anonymous Auth Not Working

- Ensure anonymous provider is enabled
- Check that RLS policies allow anonymous access where needed
- Verify anon key is correct in environment variables

### JWT Token Errors

- Check JWT secret is configured correctly
- Verify token hasn't expired
- Ensure clock sync between client and server

### Rate Limit Errors

- Implement exponential backoff in your application
- Show user-friendly error messages
- Consider increasing limits for legitimate use cases

## Environment Variables

Make sure these are set in your `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Get these from:
- Supabase Dashboard → Settings → API
- Or run `supabase status` for local development

## Next Steps

After authentication is configured:

1. Test signup and login flows
2. Verify email confirmation works
3. Test anonymous authentication
4. Implement password reset flow
5. Add user profile management
6. Set up session monitoring
7. Configure production SMTP

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)
