// utils/helpers.js
import { check } from 'k6';
import { randomIntBetween, randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

/**
 * Validasi response standar: status code & response time.
 * @param {Object} res - response object dari k6 http call
 * @param {number} expectedStatus - status code yang diharapkan
 * @param {string} label - label untuk nama check
 */
export function checkResponse(res, expectedStatus = 200, label = 'request') {
  return check(res, {
    [`${label} - status is ${expectedStatus}`]: (r) => r.status === expectedStatus,
    [`${label} - response time < 800ms`]: (r) => r.timings.duration < 800,
    [`${label} - body not empty`]: (r) => r.body && r.body.length > 0,
  });
}

/** Header default untuk request JSON */
export function jsonHeaders(extra = {}) {
  return {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...extra,
    },
  };
}

/** Generate payload user acak untuk keperluan test data */
export function randomUserPayload() {
  return {
    username: `user_${randomString(8)}`,
    email: `user_${randomString(6)}@example.com`,
    age: randomIntBetween(18, 60),
  };
}

export { randomIntBetween, randomString };
