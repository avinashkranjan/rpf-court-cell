# Authentication Testing Scenarios

This document outlines test scenarios to verify the authentication and session management implementation.

## Prerequisites

Before testing, ensure:
1. Supabase environment variables are configured
2. Application is running (`npm run dev`)
3. Test user credentials are available

## Test Scenarios

### Scenario 1: Unauthenticated User Access
**Objective**: Verify that unauthenticated users cannot access protected pages

**Steps**:
1. Clear browser storage (localStorage/cookies)
2. Navigate to `/dashboard`
3. **Expected**: Redirect to `/login`
4. Try accessing `/cases`
5. **Expected**: Redirect to `/login`
6. Try accessing `/officers`
7. **Expected**: Redirect to `/login`
8. Try accessing `/settings`
9. **Expected**: Redirect to `/login`

**Status**: ✅ Pass / ❌ Fail

---

### Scenario 2: Login Flow
**Objective**: Verify successful login and redirection

**Steps**:
1. Navigate to `/login`
2. **Expected**: Login form is displayed
3. Enter valid credentials
4. Submit the form
5. **Expected**: Redirect to `/dashboard`
6. Verify user profile is displayed in sidebar
7. **Expected**: User name and designation are shown

**Status**: ✅ Pass / ❌ Fail

---

### Scenario 3: Already Authenticated User
**Objective**: Verify that authenticated users are redirected from auth pages

**Steps**:
1. Login successfully (complete Scenario 2)
2. Navigate to `/login`
3. **Expected**: Redirect to `/dashboard`
4. Try navigating to `/register`
5. **Expected**: Redirect to `/dashboard`
6. Try navigating to `/dsc-login`
7. **Expected**: Redirect to `/dashboard`

**Status**: ✅ Pass / ❌ Fail

---

### Scenario 4: Session Persistence
**Objective**: Verify that sessions persist across page refreshes

**Steps**:
1. Login successfully (complete Scenario 2)
2. Verify you're on `/dashboard`
3. Refresh the page (F5 or Ctrl+R)
4. **Expected**: Remain on `/dashboard` without redirect
5. User profile should still be displayed
6. Navigate to `/cases`
7. **Expected**: Page loads without redirect to login

**Status**: ✅ Pass / ❌ Fail

---

### Scenario 5: Logout Flow
**Objective**: Verify successful logout and session clearing

**Steps**:
1. Login successfully (complete Scenario 2)
2. Click on "Sign Out" button in the sidebar
3. **Expected**: Redirect to `/login`
4. Try navigating to `/dashboard`
5. **Expected**: Redirect to `/login` (session cleared)
6. Check localStorage
7. **Expected**: Auth session should be cleared

**Status**: ✅ Pass / ❌ Fail

---

### Scenario 6: Loading States
**Objective**: Verify loading indicators work correctly

**Steps**:
1. Clear browser cache and storage
2. Open DevTools Network tab and throttle to "Slow 3G"
3. Navigate to `/dashboard`
4. **Expected**: Loading spinner appears briefly
5. **Expected**: Then redirect to `/login`
6. Login with valid credentials
7. **Expected**: Loading spinner appears briefly
8. **Expected**: Then dashboard loads

**Status**: ✅ Pass / ❌ Fail

---

### Scenario 7: Root Page Redirect
**Objective**: Verify root page redirects correctly based on auth state

**Steps**:
1. Logout (if logged in)
2. Navigate to `/`
3. **Expected**: Redirect to `/login`
4. Login successfully
5. Navigate to `/`
6. **Expected**: Redirect to `/dashboard`

**Status**: ✅ Pass / ❌ Fail

---

### Scenario 8: Multiple Tabs Sync
**Objective**: Verify auth state syncs across browser tabs

**Steps**:
1. Login successfully in Tab 1
2. Open a new tab (Tab 2)
3. Navigate to `/dashboard` in Tab 2
4. **Expected**: Dashboard loads (session shared)
5. In Tab 1, click "Sign Out"
6. Switch to Tab 2
7. Try navigating to a different dashboard page
8. **Expected**: Should detect logged out state and redirect

**Status**: ✅ Pass / ❌ Fail

---

### Scenario 9: Direct URL Access
**Objective**: Verify protection works with direct URL access

**Steps**:
1. Logout (if logged in)
2. Type `/dashboard/settings` directly in address bar
3. Press Enter
4. **Expected**: Redirect to `/login`
5. Login successfully
6. **Expected**: After login, redirect to `/dashboard` (not back to settings)

**Status**: ✅ Pass / ❌ Fail

---

### Scenario 10: Invalid Credentials
**Objective**: Verify error handling for invalid credentials

**Steps**:
1. Navigate to `/login`
2. Enter invalid credentials
3. Submit the form
4. **Expected**: Error message displayed
5. **Expected**: Remain on `/login` page
6. **Expected**: Can retry with correct credentials

**Status**: ✅ Pass / ❌ Fail

---

## Browser Compatibility Testing

Test the above scenarios on:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers (iOS Safari, Android Chrome)

## Performance Considerations

Monitor for:
- Loading spinner flashing (should be smooth, no flash if auth check is quick)
- Redirect loops (none should occur)
- Multiple API calls on mount (should be minimal)
- Console errors or warnings

## Security Checklist

- [ ] Passwords are not logged to console
- [ ] Tokens are not exposed in URL
- [ ] localStorage is properly cleared on logout
- [ ] Protected routes cannot be accessed by modifying localStorage
- [ ] No sensitive data in client-side code

## Notes

Add any observations or issues found during testing:

---

**Tested by**: _____________
**Date**: _____________
**Environment**: _____________
**Overall Status**: ✅ Pass / ❌ Fail
