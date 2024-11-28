import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import http from 'k6/http';
import { check } from 'k6';
import { Trend, Rate } from 'k6/metrics';

export const getContactsDuration = new Trend('get_region', true);
export const RateContentOK = new Rate('content_OK');

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.12'],
    get_region: ['p(95)<5700'],
    content_OK: ['rate>0.88']
  },
  stages: [
    { duration: '30s', target: 50 },
    { duration: '30s', target: 50 },
    { duration: '30s', target: 80 },
    { duration: '30s', target: 80 },
    { duration: '30s', target: 80 },
    { duration: '30s', target: 140 },
    { duration: '30s', target: 140 },
    { duration: '30s', target: 140 },
    { duration: '30s', target: 300 },
    { duration: '30s', target: 300 }
  ]
};

export function handleSummary(data) {
  return {
    './src/output/index.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true })
  };
}

export default function () {
  const baseUrl = 'https://restcountries.com/v3.1/region/america/';

  const params = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const OK = 200;

  const res = http.get(`${baseUrl}`, params);

  getContactsDuration.add(res.timings.duration);

  RateContentOK.add(res.status === OK);

  check(res, {
    'GET region - Status 200': () => res.status === OK
  });
}
