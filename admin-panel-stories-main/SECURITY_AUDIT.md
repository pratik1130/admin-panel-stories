# Admin Panel: Security Audit and Hardening Notes

## Findings fixed in this revision
1. Stored XSS in Users, Coupons and Trending lists (database text was written with innerHTML). Now escaped with window.esc().
2. Dashboard error message written as HTML. Now escaped.
3. Firestore rules: catalogue writes now require admin AND validate field types and lengths; coupons readable only by signed-in users; users cannot write admin or role fields; listen counters can only increase by exactly 1.
4. Storage rules: uploads limited by content type and size (covers 5 MB images, episodes 500 MB audio, teasers 200 MB MP4). Unknown paths are read-only for clients.
5. Editor: deleting a book requires typing its exact title. Archive option added (hidden from app, restorable).
6. Orphaned Storage files are removed after a successful save or delete, only if no document still references them.
7. Object URLs used for previews are revoked when the editor closes (memory leak fix).
8. Subtitles limited to 400 KB and 5000 lines per episode (Firestore document limit is 1 MB).
9. .gitignore rewritten as clean UTF-8 (the old file had UTF-16 bytes appended by a PowerShell command).
10. set-admin-claim.js: UID passed as argument, project checked, revoke option added, no hardcoded UID.
11. Hosting headers: X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy.

## Still open (needs action outside this code)
- Rotate the service-account key. It was committed locally once (commit 8c0ee53). Delete it in Google Cloud and create a new one.
- Restrict the Web API key in Google Cloud Console to the production domains, and enable Firebase App Check.
- user_coins and subscriptions: the mobile app writes these from the client. Full protection requires Cloud Functions that verify purchases and change coins on the server.
- server.ts (mobile app backend): /api/admin/broadcast-notification and DELETE /api/audiobooks/:id must verify the Firebase ID token and the admin claim. This file is not in the admin panel repository.
- Content-Security-Policy is not added yet, because the panel uses inline scripts and CDN Tailwind. Remove the Tailwind CDN and move inline scripts to files, then add a strict CSP.
- Admin accounts: enable multi-factor authentication. Revoke sessions when removing an admin (set-admin-claim.js --revoke).
- Test the rules in the Firebase Emulator before deploying. Confirm the mobile app still reads and writes listen counts and user data.
