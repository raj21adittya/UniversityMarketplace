const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

exports.getCustomToken = onCall(async (request) => {
  // Only authenticated users can get a custom token
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Must be signed in.");
  }

  const uid = request.auth.uid;
  const email = request.auth.token.email || "";

  // Verify it's a UNC email
  const allowedDomains = ["@unc.edu", "@kenan-flagler.unc.edu", "@business.unc.edu"];
  const isAllowed = allowedDomains.some((domain) => email.toLowerCase().endsWith(domain));

  if (!isAllowed) {
    throw new HttpsError("permission-denied", "Only UNC emails are allowed.");
  }

  try {
    const customToken = await admin.auth().createCustomToken(uid);
    return { token: customToken };
  } catch (error) {
    throw new HttpsError("internal", "Failed to create token.");
  }
});
