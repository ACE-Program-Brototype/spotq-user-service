process.env.NODE_ENV = "test";
process.env.DATABASE_URL =
	"postgresql://postgres:password@localhost:5432/user_db";
process.env.REDIS_URL = "redis://localhost:6379";
process.env.ADMIN_NAME = "Test Admin";
process.env.ADMIN_EMAIL = "admin@example.com";
process.env.ADMIN_PASSWORD = "password123";
process.env.JWT_ACCESS_SECRET = "test-access-secret";
process.env.JWT_ACCESS_EXPIRES_IN = "15m";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
process.env.JWT_REFRESH_EXPIRES_IN = "7d";
process.env.JWT_TEMP_SECRET = "test-temp-secret";
process.env.JWT_TEMP_EXPIRES_IN = "10m";
process.env.COOKIE_REFRESH_MAX_AGE = "604800000";
process.env.COOKIE_TEMP_MAX_AGE = "600000";
process.env.BREVO_API_KEY = "test-brevo-key";
process.env.BREVO_SENDER_EMAIL = "noreply@example.com";
process.env.BREVO_SENDER_NAME = "SpotQ Test";
