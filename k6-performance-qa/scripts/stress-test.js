// scripts/stress-test.js
// Tujuan: mencari titik jenuh (breaking point) sistem dengan menaikkan
// beban secara bertahap jauh di atas kondisi normal.
//
// Jalankan: k6 run scripts/stress-test.js

import http from 'k6/http';
import { sleep } from 'k6';
import { getEnvConfig } from '../config/environments.js';
import { checkResponse } from '../utils/helpers.js';

const env = getEnvConfig();

export const options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 300 },
    { duration: '5m', target: 300 },
    { duration: '2m', target: 500 },
    { duration: '5m', target: 500 },
    { duration: '5m', target: 0 }, // recovery
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'], // toleransi error lebih longgar saat stress
    http_req_duration: ['p(95)<2000'],
  },
};

export default function () {
  const res = http.get(`${env.baseUrl}/api/products`);
  checkResponse(res, 200, 'list-products-stress');
  sleep(0.5);
}
