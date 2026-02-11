# Authentication Flow Diagram

## Route Protection Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         RPF Court Cell App                          │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │   AuthContext/Provider  │
                    │   (Session Management)  │
                    └─────────────────────────┘
                                  │
                    ┌─────────────┴──────────────┐
                    │                            │
                    ▼                            ▼
        ┌──────────────────────┐    ┌──────────────────────┐
        │   ProtectedRoute     │    │  PublicOnlyRoute     │
        │   Component          │    │  Component           │
        └──────────────────────┘    └──────────────────────┘
                    │                            │
        ┌───────────┴───────────┐    ┌──────────┴──────────┐
        │                       │    │                     │
        ▼                       ▼    ▼                     ▼
┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│  Dashboard   │        │    Cases     │        │    Login     │
│    Layout    │        │  Officers    │        │   Register   │
│              │        │  Settings    │        │  DSC Login   │
└──────────────┘        └──────────────┘        └──────────────┘
```

## User Flow - Unauthenticated User

```
┌──────────────┐
│ User visits  │
│  /dashboard  │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│  ProtectedRoute      │
│  checks auth status  │
└──────┬───────────────┘
       │
       ▼
┌──────────────┐     NO      ┌──────────────┐
│  Is user     │────────────>│  Redirect to │
│ authenticated?│            │    /login    │
└──────┬───────┘             └──────────────┘
       │
       │ YES
       ▼
┌──────────────┐
│   Render     │
│  Dashboard   │
└──────────────┘
```

## User Flow - Authenticated User at Login

```
┌──────────────┐
│ User visits  │
│    /login    │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ PublicOnlyRoute      │
│ checks auth status   │
└──────┬───────────────┘
       │
       ▼
┌──────────────┐     YES     ┌──────────────┐
│  Is user     │────────────>│  Redirect to │
│ authenticated?│            │  /dashboard  │
└──────┬───────┘             └──────────────┘
       │
       │ NO
       ▼
┌──────────────┐
│   Render     │
│  Login Page  │
└──────────────┘
```

## Login Flow

```
┌──────────────┐
│ User enters  │
│ credentials  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Submit     │
│   Form       │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│  signIn() method     │
│  (AuthContext)       │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Supabase Auth API   │
│  validates           │
└──────┬───────────────┘
       │
  ┌────┴────┐
  │         │
  ▼         ▼
SUCCESS   FAILURE
  │         │
  │         └──> Show error message
  │              Stay on /login
  │
  ▼
┌──────────────────────┐
│  Update AuthContext  │
│  - user              │
│  - session           │
│  - profile           │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Store session in    │
│  localStorage        │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Redirect to         │
│  /dashboard          │
└──────────────────────┘
```

## Session Persistence Flow

```
┌──────────────┐
│ User opens   │
│ application  │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│  AuthProvider        │
│  initializes         │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Check localStorage  │
│  for session         │
└──────┬───────────────┘
       │
  ┌────┴────┐
  │         │
  ▼         ▼
SESSION   NO SESSION
FOUND
  │         │
  │         └──> Set user = null
  │              Set loading = false
  │
  ▼
┌──────────────────────┐
│  Validate session    │
│  with Supabase       │
└──────┬───────────────┘
       │
  ┌────┴────┐
  │         │
  ▼         ▼
VALID    INVALID
  │         │
  │         └──> Clear session
  │              Set user = null
  │              Set loading = false
  │
  ▼
┌──────────────────────┐
│  Fetch user profile  │
│  from database       │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Set user state      │
│  Set profile state   │
│  Set loading = false │
└──────────────────────┘
```

## Logout Flow

```
┌──────────────┐
│ User clicks  │
│  "Sign Out"  │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│  signOut() method    │
│  (AuthContext)       │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Supabase signOut()  │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Clear localStorage  │
│  session data        │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Reset AuthContext   │
│  - user = null       │
│  - session = null    │
│  - profile = null    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Redirect to         │
│  /login              │
└──────────────────────┘
       │
       ▼
┌──────────────────────┐
│  User at login page  │
│  (logged out)        │
└──────────────────────┘
```

## Component Decision Tree

```
                    ┌────────────────┐
                    │  Page Request  │
                    └────────┬───────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
        ┌───────────────┐         ┌───────────────┐
        │  Is page in   │         │  Is page in   │
        │  (dashboard)  │         │   (auth)      │
        │   group?      │         │   group?      │
        └───────┬───────┘         └───────┬───────┘
                │                         │
                │ YES                     │ YES
                ▼                         ▼
        ┌───────────────┐         ┌───────────────┐
        │ ProtectedRoute│         │PublicOnlyRoute│
        │   Component   │         │   Component   │
        └───────┬───────┘         └───────┬───────┘
                │                         │
                ▼                         ▼
        ┌───────────────┐         ┌───────────────┐
        │  Check: user  │         │  Check: user  │
        │   exists?     │         │   exists?     │
        └───────┬───────┘         └───────┬───────┘
                │                         │
        ┌───────┴───────┐         ┌───────┴───────┐
        │               │         │               │
        ▼               ▼         ▼               ▼
      YES              NO       YES              NO
        │               │         │               │
        │               │         │               │
        ▼               ▼         ▼               ▼
    ┌────────┐    ┌────────┐  ┌────────┐    ┌────────┐
    │ Render │    │Redirect│  │Redirect│    │ Render │
    │  Page  │    │/login  │  │/dash   │    │  Page  │
    └────────┘    └────────┘  └────────┘    └────────┘
```

## Key Points

### ✅ What We Protect
- Dashboard pages (all pages under `app/(dashboard)/`)
- New case forms
- Case listings
- Officer management
- Settings pages

### ✅ What We Allow
- Login page (accessible when logged out)
- Register page (accessible when logged out)
- DSC login page (accessible when logged out)

### ✅ Smart Redirects
- Logged out user → `/dashboard` → Redirected to `/login`
- Logged in user → `/login` → Redirected to `/dashboard`
- Logged in user → `/` → Redirected to `/dashboard`
- Logged out user → `/` → Redirected to `/login`

### ✅ Loading States
- Shows spinner while checking authentication
- Prevents flash of unauthorized content
- Smooth user experience

### ✅ Session Management
- Automatic session persistence in localStorage
- Token auto-refresh
- Cross-tab synchronization
- Survives page refreshes
