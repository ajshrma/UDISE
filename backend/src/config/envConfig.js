// required environment variables

// Base variables always required for the backend to function
const baseRequiredEnvVars = [
  "MONGO_URI",
  "JWT_AUTH_SECRET",
  "JWT_AUTH_EXPIRATION",
  "JWT_REFRESH_SECRET",
  "CLIENT_URL",
];

// Email is optional in many environments. Only enforce SendGrid keys
// when EMAIL_ENABLED is explicitly set to "true".
const emailRequiredEnvVars =
  process.env.EMAIL_ENABLED === "true"
    ? ["SENDGRID_API_KEY", "SENDGRID_EMAIL"]
    : [];

export const requiredEnvVars = [
  ...baseRequiredEnvVars,
  ...emailRequiredEnvVars,
];