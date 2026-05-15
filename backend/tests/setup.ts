process.env.NODE_ENV = 'test';
process.env.DATABASE_URL ??= 'postgresql://roomies_test:roomies_test@localhost:5432/roomies_test';
process.env.JWT_SECRET ??= 'test-secret-not-for-production';
process.env.GOOGLE_CLIENT_ID ??= 'test-google-client-id';
