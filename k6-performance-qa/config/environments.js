// config/environments.js
// Kelola base URL & kredensial per environment.
// Jalankan test dengan: k6 run -e ENV=staging scripts/load-test.js

export const environments = {
  local: {
    baseUrl: 'http://localhost:3000',
  },
  staging: {
    baseUrl: 'https://staging.example.com',
  },
  production: {
    baseUrl: 'https://api.example.com',
  },
};

export function getEnvConfig() {
  const envName = __ENV.ENV || 'local';
  const config = environments[envName];

  if (!config) {
    throw new Error(
      `Environment "${envName}" tidak ditemukan. Pilihan: ${Object.keys(environments).join(', ')}`
    );
  }

  return { name: envName, ...config };
}
