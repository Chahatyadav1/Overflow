const dotenv = require('dotenv');
const Joi = require('joi');

// Load environment file based on NODE_ENV
if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: '.env.test' });
} else {
  dotenv.config();
}

const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  MONGO_URI: Joi.string().required().description('MongoDB URI'),
  JWT_SECRET: Joi.string().required().description('JWT secret key'),
  JWT_EXPIRE: Joi.string().default('7d'),
}).unknown().required();

const { error, value: envVars } = envVarsSchema.validate(process.env);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoUri: envVars.MONGO_URI,
  jwtSecret: envVars.JWT_SECRET,
  jwtExpire: envVars.JWT_EXPIRE,
};