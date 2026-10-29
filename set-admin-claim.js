"use strict";

const fs = require("fs");
const path = require("path");
const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

const serviceAccountPath = [
  path.join(__dirname, "firebase-admin-key.json"),
  path.join(__dirname, "service-account.json"),
  path.join(__dirname, "service account.json"),
].find((filePath) => fs.existsSync(filePath));

if (!serviceAccountPath) {
  console.error(
    "Service account file not found.\n" +
      "Save the JSON in the project root as firebase-admin-key.json."
  );
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

if (
  serviceAccount.project_id !== "majestic-boulevard-mxctm" ||
  serviceAccount.client_email !==
    "firebase-adminsdk-fbsvc@majestic-boulevard-mxctm.iam.gserviceaccount.com"
) {
  console.error("The service account JSON does not match the expected Firebase project.");
  process.exit(1);
}

console.log("Initializing Firebase Admin with service account...");

initializeApp({
  credential: cert(serviceAccount),
});

const uid = "1JQQmgpnOsVO6LAFHTYzzvx5o6p2";

getAuth()
  .setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log("Successfully set admin claim for user:", uid);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error setting custom claims:", error.code, error.message);
    process.exit(1);
  });