import { registerAs } from '@nestjs/config';
import 'dotenv/config';
require('dotenv').config();

export default registerAs('app', () => ({
  nodeEnv: process.env.APP_ENV,
  name: process.env.APP_NAME,
  workingDir: process.env.PWD || process.cwd(),
  port: parseInt(process.env.APP_PORT, 10) || 9876,
  apiPrefix: process.env.APP_PREFIX || 'api',
  fallbackLanguage: process.env.APP_LANG || 'en',
}));
