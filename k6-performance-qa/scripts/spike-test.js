// scripts/spike-test.js
// Tujuan: menguji ketahanan sistem terhadap lonjakan traffic mendadak
// (misalnya flash sale, campaign viral, dsb).
//
// Jalankan: k6 run scripts/spike-test.js

import http from 'k6/http';
import { sleep } from 'k6';
import { getEnvConfig } from '../config/environments.js';
import { checkResponse } from '../utils/helpers.js';

const env = getEnvConfig();

export const options = {
  stages: [
    { duration: '1m', target: 20 },   // kondisi normal
    { duration: '30s', target: 500 }, // spike tiba-tiba
    { duration: '2m', target: 500 },  // tahan di puncak
    { duration: '30s', target: 20 },  // turun cepat
    { duration: '2m', target: 20 },   // recovery, verifikasi kembali normal
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.1'],
  },
};

export default function () {
  const res = http.get(`${env.baseUrl}/api/products`);
  checkResponse(res, 200, 'spike-request');
  sleep(0.3);
}
