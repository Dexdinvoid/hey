# Email rate limit exceeded

Supabase’s built-in email is limited to about **2 emails per hour** (signup confirmation, password reset, etc.). When you hit that, you’ll see “Email rate limit exceeded”.

## Quick fix (local dev)

**Turn off “Confirm email”** so signup doesn’t send an email:

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. Go to **Authentication** → **Providers** → **Email**.
3. Turn **OFF** “Confirm email”.
4. Save.

New signups will be able to log in immediately without a confirmation email, and you won’t hit the rate limit for signup.

## Production / higher limits

Use **Custom SMTP** so Supabase sends mail through your provider (Resend, SendGrid, Brevo, etc.):

1. In the Dashboard: **Project Settings** → **Authentication** → **SMTP Settings**.
2. Enable **Custom SMTP** and enter your provider’s host, port, user, and password.
3. With custom SMTP you can also raise the “Email sent” rate limit under **Authentication** → **Rate Limits**.

See [Supabase: Send emails with custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp).
