/**
 * renew-login: the connection timed out -> please display a login modal and login again
 * logout: the user got intentionally logged out
 * -> all subscriptions etc. are expected to be unsubscribed and all cached data should be cleared
 * logged-in: the user is now successfully logged in
 */
export type AuthEvent = 'logged-in' | 'logout' | 'renew-login';
