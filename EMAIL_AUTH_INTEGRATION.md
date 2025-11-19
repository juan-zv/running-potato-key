# Email Authentication Integration

## Overview
This project now supports both Google OAuth and email/password authentication using Supabase Auth.

## Implementation Details

### 1. Sign In Card (`src/components/auth/SignInCard.tsx`)
The sign-in component has been updated to support three authentication modes:
- **Sign In**: Email and password login for existing users
- **Sign Up**: Create new account with email and password
- **Password Reset**: Request password reset link via email

#### Features:
- Form validation (minimum 6 characters for password)
- Dynamic UI that switches between modes
- Email/password authentication alongside Google OAuth
- User-friendly error messages via toast notifications

### 2. Password Reset Flow

#### Step 1: Request Reset
Users can request a password reset from the login page by:
1. Clicking "Forgot password?"
2. Entering their email address
3. Receiving a reset link via email

#### Step 2: Reset Password Page (`src/pages/ResetPasswordPage.tsx`)
A dedicated page for users to set a new password after clicking the reset link:
- Validates session from reset link
- Requires password confirmation
- Minimum 6 character password validation
- Automatic redirect to dashboard after successful reset

### 3. App Routing (`src/App.tsx`)
Updated to handle the password reset route:
- Detects `/reset-password` path or `type=recovery` hash parameter
- Shows appropriate page based on authentication state and current route

## Authentication Methods

### Email Sign Up
```typescript
await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    emailRedirectTo: 'https://yourapp.com',
  },
})
```

### Email Sign In
```typescript
await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
})
```

### Password Reset Request
```typescript
await supabase.auth.resetPasswordForEmail('user@example.com', {
  redirectTo: 'https://yourapp.com/reset-password',
})
```

### Password Update
```typescript
await supabase.auth.updateUser({ 
  password: 'newPassword123' 
})
```

### Google OAuth (Existing)
```typescript
await supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: redirectUrl,
    scopes: "calendar.readonly calendar.events.readonly",
    queryParams: {
      access_type: "offline",
      prompt: "consent",
    },
  },
})
```

## Supabase Configuration

### Email Settings
To configure email authentication in Supabase:

1. **Email Confirmations** (Dashboard):
   - Go to Authentication → Settings → Email Auth
   - Toggle "Enable email confirmations" based on your needs
   - For development: typically disabled
   - For production: typically enabled

2. **Redirect URLs** (Dashboard):
   - Go to Authentication → URL Configuration
   - Add your app URLs to the allowed redirect URLs:
     - `http://localhost:5173` (development)
     - `https://yourapp.com` (production)
     - `https://yourapp.com/reset-password` (password reset)

3. **Email Templates** (Dashboard):
   - Go to Authentication → Email Templates
   - Customize confirmation and password reset emails
   - Update redirect URLs in email templates

### Custom SMTP (Production)
For production use, configure a custom SMTP server:
- Go to Authentication → Settings → SMTP Settings
- Configure your email provider (SendGrid, Mailgun, etc.)
- The default Supabase email service has rate limits (2 emails/hour)

### Local Development
- Supabase CLI captures emails using Mailpit
- Run `supabase status` to get the Mailpit URL
- View sent emails in your browser for testing

## Security Features

1. **Password Requirements**: Minimum 6 characters (configurable)
2. **Email Verification**: Can be enabled in Supabase settings
3. **Password Confirmation**: Required when resetting password
4. **Session Validation**: Reset links expire and require valid session
5. **Secure Password Storage**: Handled by Supabase Auth

## User Experience

### Sign In Flow
1. User enters email and password
2. Clicks "Sign In"
3. On success: redirected to dashboard
4. On failure: error message displayed

### Sign Up Flow
1. User clicks "Don't have an account? Sign up"
2. Enters email and password
3. Clicks "Sign Up"
4. If email confirmation enabled: receives verification email
5. After verification: can sign in

### Password Reset Flow
1. User clicks "Forgot password?"
2. Enters email address
3. Clicks "Send Reset Link"
4. Receives email with reset link
5. Clicks link → redirected to reset page
6. Enters new password twice
7. Clicks "Update Password"
8. Redirected to dashboard

## Environment Variables
Ensure these are set in your `.env` file:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SITE_URL=http://localhost:5173 # or your production URL
```

## Testing Checklist

- [ ] Sign up with new email
- [ ] Receive confirmation email (if enabled)
- [ ] Sign in with email/password
- [ ] Request password reset
- [ ] Receive reset email
- [ ] Complete password reset
- [ ] Sign in with new password
- [ ] Google OAuth still works
- [ ] Test with invalid credentials
- [ ] Test password requirements validation

## Future Enhancements

- Add "Remember me" functionality
- Social auth with other providers (GitHub, Twitter, etc.)
- Two-factor authentication
- Password strength indicator
- Account email change functionality
- Magic link authentication (passwordless)
