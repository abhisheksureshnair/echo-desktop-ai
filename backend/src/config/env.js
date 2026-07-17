import process from 'node:process';

export const config = Object.freeze({
  host: process.env.HOST || '127.0.0.1',
  port: Number(process.env.PORT || 7891),
  nodeEnv: process.env.NODE_ENV || 'development',
});
