process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-key";
process.env.JWT_EXPIRE = process.env.JWT_EXPIRE || "1h";
process.env.CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "sk_test_dummy";
process.env.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "whsec_dummy";
process.env.MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/agrilink-test";
