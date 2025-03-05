import { registerAs } from '@nestjs/config';
import 'dotenv/config';
require('dotenv').config();

export default registerAs('auth', () => ({
  secret: process.env.APP_KEY,
  expires: process.env.TOKEN_EXPIRES_IN || '60s',
}));
