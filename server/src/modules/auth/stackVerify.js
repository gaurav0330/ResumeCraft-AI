import { createRemoteJWKSet, jwtVerify } from "jose";

const STACK_ISSUER = process.env.STACK_ISSUER; // e.g. https://api.stack-auth.com/{projectId}
const STACK_AUDIENCE = process.env.STACK_AUDIENCE; // optional; set if required by your Stack project

let jwks = null;

function getJwks() {
  if (!STACK_ISSUER) {
    throw new Error("STACK_ISSUER not set for Stack token verification");
  }
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(`${STACK_ISSUER}/.well-known/jwks.json`));
  }
  return jwks;
}

export async function verifyStackIdToken(idToken) {
  if (!idToken) throw new Error("Missing Stack id token");

  const JWKS = getJwks();

  const { payload } = await jwtVerify(idToken, JWKS, {
    issuer: STACK_ISSUER,
    audience: STACK_AUDIENCE,
  });

  return payload; // contains email, sub, etc.
}


