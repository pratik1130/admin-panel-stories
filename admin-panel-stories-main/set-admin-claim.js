"use strict";
// Usage:
//   node set-admin-claim.js <FIREBASE_UID>           -> grant admin
//   node set-admin-claim.js <FIREBASE_UID> --revoke  -> remove admin and kill active sessions
const fs = require("fs");
const path = require("path");
const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

const EXPECTED_PROJECT = "majestic-boulevard-mxctm";
const uid = process.argv[2];
const revoke = process.argv.includes("--revoke");

if (!uid || !/^[A-Za-z0-9]{1,128}$/.test(uid)) {
  console.error("Usage: node set-admin-claim.js <FIREBASE_UID> [--revoke]");
  process.exit(1);
}

const keyPath = path.join(__dirname, "firebase-admin-key.json");
if (!fs.existsSync(keyPath)) {
  console.error("firebase-admin-key.json not found in the project root. Keep it local; never commit it.");
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));
if (serviceAccount.project_id !== EXPECTED_PROJECT) {
  console.error(`Key belongs to "${serviceAccount.project_id}", expected "${EXPECTED_PROJECT}". Aborting.`);
  process.exit(1);
}

initializeApp({ credential: cert(serviceAccount) });
const auth = getAuth();

(async () => {
  const user = await auth.getUser(uid); // fails fast if the UID does not exist
  if (revoke) {
    await auth.setCustomUserClaims(uid, { admin: false });
    await auth.revokeRefreshTokens(uid);
    console.log(`Admin revoked and sessions ended for ${user.email || uid}`);
  } else {
    await auth.setCustomUserClaims(uid, { admin: true });
    console.log(`Admin granted to ${user.email || uid}. The user must sign out and sign in again.`);
  }
  process.exit(0);
})().catch(e => {
  console.error("Failed:", e.code || "", e.message);
  process.exit(1);
});
