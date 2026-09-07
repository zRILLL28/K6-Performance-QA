// scripts/load-test.js
// Tujuan: mengukur performa sistem pada beban normal/harian yang diharapkan.
//
// Jalankan: k6 run scripts/load-test.js
// Jalankan dengan env: k6 run -e ENV=staging scripts/load-test.js

import http from 'k6/http';
import { sleep } from 'k6';
import { getEnvConfig } from '../config/environments.js';
import { checkResponse, jsonHeaders, randomUserPayload } from '../utils/helpers.js';

const env = getEnvConfig();

export const options = {
  stages: [
    { duration: '2m', target: 50 },   // ramp-up ke 50 VU
    { duration: '5m', target: 50 },   // tahan di 50 VU (steady state)
    { duration: '2m', target: 0 },    // ramp-down
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<800', 'p(99)<1500'],
  },
};

export default function () {
  // Contoh skenario: browse -> get detail -> create data
  const listRes = http.get(`${env.baseUrl}/api/products`);
  checkResponse(listRes, 200, 'list-products');
  sleep(1);

  const detailRes = http.get(`${env.baseUrl}/api/products/1`);
  checkResponse(detailRes, 200, 'get-product-detail');
  sleep(1);

  const payload = JSON.stringify(randomUserPayload());
  const createRes = http.post(`${env.baseUrl}/api/users`, payload, jsonHeaders());
  checkResponse(createRes, 201, 'create-user');

  sleep(Math.random() * 2 + 1); // simulasi think-time user
}
