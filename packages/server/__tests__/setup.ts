/**
 * Preloaded by Bun before any test file runs (see bunfig.toml).
 * Sets dummy environment variables so SDK clients don't throw
 * at instantiation time during tests.
 *
 * Real values from .env are only needed at runtime, not in tests,
 * since all external clients are mocked.
 */
process.env.GROQ_API_KEY = "test-key";
