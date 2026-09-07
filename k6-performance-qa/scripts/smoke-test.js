// scripts/smoke-test.js
// Tujuan: memastikan sistem berjalan baik dengan load sangat kecil
// sebelum menjalankan test yang lebih berat. Jalankan di setiap deploy/CI.
//
// Jalankan: k6 run scripts/smoke-test.js
// Jalankan dengan env: k6 run -e ENV=staging scripts/smoke-test.js

import http from 'k6/http';
import { sleep } from 'k6';
import { getEnvConfig } from '../config/environments.js';
import { checkResponse } from '../utils/helpers.js';

const env = getEnvConfig();

export const options = {
  vus: 1,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.01'], // error rate < 1%
    http_req_duration: ['p(95)<500'], // 95% request di bawah 500ms
  },
};

export default function () {
  const res = http.get(`${env.baseUrl}/health`);
  checkResponse(res, 200, 'health-check');
  sleep(1);
}
