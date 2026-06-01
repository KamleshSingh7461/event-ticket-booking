const path = require('path');
const dotenv = require('dotenv');

// Load root .env from the repo root (works on any machine)
dotenv.config({ path: path.resolve(__dirname, '.env') });

module.exports = {
  apps: [
    {
      name: 'wyldcard-web',
      cwd: path.resolve(__dirname, 'apps/web'),
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        ...process.env,
      },
    },
    {
      name: 'wyldcard-admin',
      cwd: path.resolve(__dirname, 'apps/admin'),
      script: 'node_modules/.bin/next',
      args: 'start -p 3001',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        ...process.env,
      },
    },
  ],
};
