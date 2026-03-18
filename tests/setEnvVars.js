// Set default test environment variables before any imports
process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://dummy:27017/test';
process.env.JWT_SECRET = 'test_secret_key';
process.env.JWT_EXPIRE = '7d';
process.env.PORT = '3000';