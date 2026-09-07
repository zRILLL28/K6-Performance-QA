// scripts/soak-test.js
// Tujuan: menguji stabilitas sistem dalam durasi lama pada beban moderat
// untuk mendeteksi memory leak, koneksi database bocor, degradasi performa, dll.
//
// Jalankan: k6 run scripts/soak-test.js

import http from 'k6/http';
import { sleep } from 'k6';
import { getEnvConfig } from '../config/environments.js';
import { checkResponse } from '../utils/helpers.js';

const env = getEnvConfig();

export const options = {
  stages: [
    { duration: '2m', target: 50 },
    { duration: '3h', target: 50 }, // beban stabil dalam waktu lama
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<800'],
  },
};

export default function () {
  const res = http.get(`${env.baseUrl}/api/products`);
  checkResponse(res, 200, 'soak-request');
  sleep(1);
}
