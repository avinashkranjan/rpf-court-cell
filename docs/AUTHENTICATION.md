# Authentication and Session Management

This document describes how authentication and route protection is implemented in the RPF Court Cell application.

## Overview

The application uses Supabase for authentication and session management. Route protection is implemented using custom React components that check authentication status before rendering protected content.

## Components

### 1. AuthContext (`/context/auth-context.tsx`)
The main authentication context that provides:
- `user`: Current authenticated user
- `session`: Current session
- `profile`: User profile data from database
- `loading`: Loading state for auth operations
- `signIn()`: Sign in method
- `signUp()`: Sign up method
- `signOut()`: Sign out method
- `refreshProfile()`: Refresh user profile

### 2. useAuth Hook
A custom hook exported from `AuthContext` that must be used within an `AuthProvider`:
```typescript
const { user, session, profile, loading, signIn, signOut } = useAuth();
```

### 3. ProtectedRoute (`/components/auth/protected-route.tsx`)
A wrapper component that protects routes requiring authentication:
- Redirects unauthenticated users to `/login`
- Shows loading spinner while checking auth status
- Renders children only when user is authenticated

**Usage:**
```tsx
<ProtectedRoute>
  <YourProtectedContent />
</ProtectedRoute>
```

### 4. PublicOnlyRoute (`/components/auth/public-only-route.tsx`)
A wrapper component that prevents authenticated users from accessing auth pages:
- Redirects authenticated users to `/dashboard`
- Shows loading spinner while checking auth status
- Renders children only when user is NOT authenticated

**Usage:**
```tsx
<PublicOnlyRoute>
  <LoginPage />
</PublicOnlyRoute>
```

## Implementation

### Dashboard Pages (Protected)
All pages under `/app/(dashboard)/` are protected by wrapping the layout with `ProtectedRoute`:

```tsx
// app/(dashboard)/layout.tsx
export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      {/* Dashboard UI */}
      {children}
    </ProtectedRoute>
  );
}
```

### Auth Pages (Public Only)
All pages under `/app/(auth)/` (login, register, etc.) are wrapped with `PublicOnlyRoute`:

```tsx
// app/(auth)/layout.tsx
export default function AuthLayout({ children }) {
  return (
    <PublicOnlyRoute>
      {children}
    </PublicOnlyRoute>
  );
}
```

### Home Page
The root page (`/app/page.tsx`) redirects based on authentication status:
- Authenticated users → `/dashboard`
- Unauthenticated users → `/login`

## Authentication Flow

### Sign In Flow
1. User navigates to `/login`
2. `PublicOnlyRoute` checks if user is already authenticated
3. If authenticated, redirects to `/dashboard`
4. If not, shows login form
5. User submits credentials
6. `signIn()` method authenticates with Supabase
7. On success, `AuthContext` updates state with user and session
8. User is redirected to `/dashboard`

### Protected Page Access
1. User tries to access `/dashboard` or any dashboard page
2. `ProtectedRoute` checks authentication status
3. If `loading` is true, shows loading spinner
4. If `user` is null, redirects to `/login`
5. If `user` exists, renders the protected content

### Sign Out Flow
1. User clicks "Sign Out" button
2. `signOut()` method is called
3. Supabase session is cleared
4. `AuthContext` state is reset
5. User is redirected to `/login`

## Session Persistence

Sessions are automatically persisted using Supabase's built-in session management:
- Sessions are stored in `localStorage`
- Tokens are auto-refreshed
- Auth state is synchronized across tabs
- On page reload, the session is restored from storage

## Security Considerations

1. **Client-side Protection**: Route protection happens on the client side using React hooks and effects
2. **Server-side Security**: Always validate authentication on API routes and server actions using Supabase's server-side auth methods
3. **Token Management**: Access tokens are managed by Supabase SDK and refreshed automatically
4. **RLS Policies**: Database security is enforced through Supabase Row Level Security (RLS) policies

## Testing Authentication

To test the authentication flow:

1. **Unauthenticated Access**:
   - Navigate to `/dashboard` without logging in
   - Should redirect to `/login`

2. **Login**:
   - Navigate to `/login`
   - Enter valid credentials
   - Should redirect to `/dashboard`

3. **Already Authenticated**:
   - While logged in, navigate to `/login`
   - Should redirect to `/dashboard`

4. **Logout**:
   - Click "Sign Out" button
   - Should clear session and redirect to `/login`

5. **Session Persistence**:
   - Login and refresh the page
   - Should remain authenticated
   - Dashboard should load without redirect

## Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```
