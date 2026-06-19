// =============================================================================
// Passport Configuration — Google OAuth 2.0 strategy
// -----------------------------------------------------------------------------
// Used by the /api/v1/auth/google and /api/v1/auth/google/callback routes.
// On successful auth, the verify callback looks up (or creates) the user via
// auth.service.upsertGoogleUser and issues JWTs.
// =============================================================================

import passport from "passport";
import { Strategy as GoogleStrategy, type Profile as GoogleProfile } from "passport-google-oauth20";
import { env } from "./env";
import { upsertGoogleUser } from "../services/auth.service";
import { logger } from "./logger";

// -----------------------------------------------------------------------------
// Configure Google OAuth strategy
// -----------------------------------------------------------------------------

export function configurePassport(): void {
  // Only configure if credentials are provided
  if (!env.google.clientId || !env.google.clientSecret) {
    logger.warn("⚠️  Google OAuth credentials not set — Google login disabled.");
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: env.google.clientId,
        clientSecret: env.google.clientSecret,
        callbackURL: env.google.callbackUrl,
        scope: ["profile", "email"],
      },
      async (_accessToken, _refreshToken, profile: GoogleProfile, done) => {
        try {
          if (!profile.emails || profile.emails.length === 0) {
            return done(new Error("Google profile did not include an email"));
          }

          const authResult = await upsertGoogleUser({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            avatarUrl: profile.photos?.[0]?.value,
          });

          // Pass the full auth result (user + tokens) to the route handler
          return done(null, authResult as unknown as Express.User);
        } catch (err) {
          logger.error("Google OAuth verify callback failed", err);
          return done(err instanceof Error ? err : new Error(String(err)));
        }
      },
    ),
  );

  // We don't use serialize/deserialize for session-based auth — JWTs only.
  // These stubs are required by Passport's typing.
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((obj, done) => done(null, obj as unknown as Express.User));

  logger.info("✅ Google OAuth strategy configured");
}
