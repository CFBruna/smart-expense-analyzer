# Architecture & State Management

## User Preferences (Currency & Language)

### Source of Truth
- **Authenticated User:** The **Backend** is the single source of truth.
  - Upon login, the frontend MUST fetch the user's profile to determine the correct `currency` and `language`.
  - `localStorage` values should be ignored or overwritten by backend data when a valid user session exists.
- **Guest/Unauthenticated:** `localStorage` is used as a fallback to persist preferences across sessions for non-logged users (if applicable).

### State Synchronization Rules
1. **Login:** Fetch profile -> Update Contexts -> Update `localStorage`.
2. **Logout:** Clear `localStorage` (tokens and preferences) -> Reset Contexts.
3. **Update:** Optimistic update in Context -> Send request to Backend -> Update `localStorage`.

### Security & Cleanup
- On **Logout**, the application MUST:
  - Invalidate all React Query caches (`queryClient.clear()`).
  - Clear sensitive data from `localStorage` (`access_token`).
  - Clear user preferences from `localStorage` to prevent information leakage between sessions.
