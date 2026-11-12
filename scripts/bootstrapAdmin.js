/**
 * VoltFlow Enterprise - Initial Admin Bootstrap & Role Provisioning Script
 * 
 * Usage:
 * 1. Place your serviceAccountKey.json in the scripts directory.
 * 2. Run: node scripts/bootstrapAdmin.js
 * 
 * This trusted backend script uses the Firebase Admin SDK to:
 * - Create the initial Main Administrator account without public signup.
 * - Set secure Custom Claims: { role: 'Main Admin', isAdmin: true }.
 * - Seed the Firestore 'users' collection document.
 */

import admin from "firebase-admin";
import fs from "fs";
import path from "path";

const serviceAccountPath = path.resolve("./scripts/serviceAccountKey.json");

if (!fs.existsSync(serviceAccountPath)) {
  console.log("=================================================================");
  console.log("VoltFlow Firebase Admin SDK Bootstrap Notice:");
  console.log("Please download your serviceAccountKey.json from Firebase Console:");
  console.log("Project Settings -> Service accounts -> Generate new private key");
  console.log("Place it in: voltflow-inventory/scripts/serviceAccountKey.json");
  console.log("=================================================================");
} else {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  const auth = admin.auth();
  const db = admin.firestore();

  async function bootstrapMainAdmin() {
    const adminEmail = process.env.BOOTSTRAP_ADMIN_EMAIL || "admin@voltflow.com";
    const adminPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD || "VoltFlow@Admin2026";
    const adminName = "Engr. Rafiqul Islam";
    const adminBranchId = "loc_gazaria_230";

    try {
      console.log(`Checking if admin account (${adminEmail}) exists...`);
      let userRecord;
      try {
        userRecord = await auth.getUserByEmail(adminEmail);
        console.log(`Existing user found with UID: ${userRecord.uid}`);
      } catch (err) {
        if (err.code === "auth/user-not-found") {
          console.log(`Creating initial Main Admin user in Firebase Auth...`);
          userRecord = await auth.createUser({
            email: adminEmail,
            password: adminPassword,
            displayName: adminName,
            emailVerified: true
          });
          console.log(`Created user with UID: ${userRecord.uid}`);
        } else {
          throw err;
        }
      }

      // Set Custom Claims for backend token verification
      console.log("Setting Custom Claims: role='Main Admin', isAdmin=true...");
      await auth.setCustomUserClaims(userRecord.uid, {
        role: "Main Admin",
        isAdmin: true,
        branchId: adminBranchId
      });

      // Write verified Firestore profile
      console.log("Writing to Firestore 'users' collection...");
      await db.collection("users").doc(userRecord.uid).set({
        uid: userRecord.uid,
        fullName: adminName,
        email: adminEmail,
        phone: "+880 1711-234567",
        role: "Main Admin",
        branchId: adminBranchId,
        branchName: "Gazaria 230 KV Substation",
        department: "Grid Operations & Executive Central",
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      console.log("=================================================");
      console.log("SUCCESS: Initial Main Admin Provisioned!");
      console.log(`Email: ${adminEmail}`);
      console.log(`Role: Main Admin (Custom Claim enforced)`);
      console.log(`Branch: Gazaria 230 KV Substation`);
      console.log("=================================================");
    } catch (error) {
      console.error("Bootstrap error:", error);
    }
  }

  bootstrapMainAdmin();
}
