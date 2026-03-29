const REQUIRED_VARS = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_OPENAI_API_KEY",
  "VITE_ANTHROPIC_API_KEY"
];

export function checkEnv() {
  const missing = REQUIRED_VARS.filter(
    (v) => !import.meta.env[v]
  );
  missing.forEach((v) =>
    console.warn(`⚠️ Missing env var: ${v} — some features may not work`)
  );
  return { allPresent: missing.length === 0, missing };
}
